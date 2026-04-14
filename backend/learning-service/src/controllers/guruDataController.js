const { Op } = require("sequelize");
const { Guru } = require("../../../academic-service/src/models");
const {
  createError,
} = require("../../../academic-service/src/middleware/errorHandler");
const asyncHandler = require("../../../academic-service/src/utils/asyncHandler");

exports.getAllGuru = asyncHandler(async (req, res) => {
  const data = await Guru.findAll({ order: [["nama_lengkap", "ASC"]] });
  res.json({ success: true, data });
});

exports.createGuru = asyncHandler(async (req, res) => {
  const { nip, nama_lengkap, email, jabatan, mata_pelajaran, no_telepon } =
    req.body;
  if (!nama_lengkap) throw createError(400, "Field nama_lengkap wajib diisi");

  const guru = await Guru.create({
    nip,
    nama_lengkap,
    email: email || null,
    jabatan: jabatan || null,
    mata_pelajaran: mata_pelajaran || null,
    no_telepon: no_telepon || null,
  });
  res.status(201).json({ success: true, data: guru });
});

exports.updateGuru = asyncHandler(async (req, res) => {
  const { nip, nama_lengkap, email, jabatan, mata_pelajaran, no_telepon } =
    req.body;
  if (!nama_lengkap) throw createError(400, "Field nama_lengkap wajib diisi");

  const guru = await Guru.findByPk(req.params.id);
  if (!guru) throw createError(404, "Guru tidak ditemukan");

  await guru.update({
    nip,
    nama_lengkap,
    email: email || null,
    jabatan: jabatan || null,
    mata_pelajaran: mata_pelajaran || null,
    no_telepon: no_telepon || null,
  });
  res.json({ success: true, data: guru });
});

exports.deleteGuru = asyncHandler(async (req, res) => {
  const guru = await Guru.findByPk(req.params.id);
  if (!guru) throw createError(404, "Guru tidak ditemukan");
  await guru.destroy();
  res.json({ success: true, message: "Guru berhasil dihapus" });
});

exports.searchGuru = asyncHandler(async (req, res) => {
  const keyword = `%${(req.query.q || req.query.nama || "").toLowerCase()}%`;
  const data = await Guru.findAll({
    where: {
      [Op.or]: [
        { nama_lengkap: { [Op.iLike]: keyword } },
        { nip: { [Op.iLike]: keyword } },
      ],
    },
    attributes: [
      "id",
      "nip",
      "nama_lengkap",
      "jabatan",
      "mata_pelajaran",
      "email",
      "no_telepon",
    ],
    order: [["nama_lengkap", "ASC"]],
    limit: 50,
  });
  res.json({ success: true, data });
});
