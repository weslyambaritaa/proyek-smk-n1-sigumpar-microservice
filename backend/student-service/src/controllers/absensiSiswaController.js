const {
  AbsensiSiswa,
  Siswa,
  MataPelajaran,
  Kelas,
} = require("../models");
const {
  createError,
} = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");
const sequelize = require("../config/db");

const VALID_STATUSES = ["hadir", "sakit", "izin", "alpa", "terlambat"];
const isValidDate = (d) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime());

exports.createAbsensiSiswa = asyncHandler(async (req, res) => {
  const { siswa_id, tanggal, status, keterangan, mapel_id = null } = req.body;
  if (!siswa_id || !tanggal || !status)
    throw createError(400, "Field siswa_id, tanggal, dan status wajib diisi");
  if (!isValidDate(tanggal))
    throw createError(400, "Format tanggal harus YYYY-MM-DD");
  if (!VALID_STATUSES.includes(status))
    throw createError(
      400,
      `Status tidak valid. Pilihan: ${VALID_STATUSES.join(", ")}`,
    );

  // Upsert — gunakan raw query karena Sequelize belum support ON CONFLICT dengan COALESCE
  const [result] = await sequelize.query(
    `INSERT INTO absensi_siswa (siswa_id, tanggal, status, keterangan, mapel_id)
     VALUES (:siswa_id, :tanggal, :status, :keterangan, :mapel_id)
     ON CONFLICT (siswa_id, tanggal, COALESCE(mapel_id, 0))
     DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, updated_at = NOW()
     RETURNING *`,
    {
      replacements: {
        siswa_id,
        tanggal,
        status,
        keterangan: keterangan || null,
        mapel_id,
      },
      type: "SELECT",
    },
  );
  res.status(201).json({ success: true, data: result[0] });
});

exports.getAllAbsensiSiswa = asyncHandler(async (req, res) => {
  const { siswa_id, tanggal, status, mapel_id, kelas_id } = req.query;
  const where = {};
  if (siswa_id) where.siswa_id = siswa_id;
  if (tanggal) where.tanggal = tanggal;
  if (status) where.status = status;
  if (mapel_id) where.mapel_id = mapel_id;

  const siswaWhere = {};
  if (kelas_id) siswaWhere.kelas_id = kelas_id;

  const data = await AbsensiSiswa.findAll({
    where,
    include: [
      {
        model: Siswa,
        as: "siswa",
        attributes: ["nisn", "nama_lengkap", "kelas_id"],
        where: Object.keys(siswaWhere).length ? siswaWhere : undefined,
        include: [{ model: Kelas, as: "kelas", attributes: ["nama_kelas"] }],
      },
      { model: MataPelajaran, as: "mapel", attributes: ["nama_mapel"] },
    ],
    order: [["tanggal", "DESC"]],
  });
  res.json({ success: true, count: data.length, data });
});

exports.getAbsensiSiswaById = asyncHandler(async (req, res) => {
  const absensi = await AbsensiSiswa.findByPk(req.params.id);
  if (!absensi) throw createError(404, "Absensi tidak ditemukan");
  res.json({ success: true, data: absensi });
});

exports.updateAbsensiSiswa = asyncHandler(async (req, res) => {
  const { status, keterangan } = req.body;
  if (!status) throw createError(400, "Field status wajib diisi");
  if (!VALID_STATUSES.includes(status))
    throw createError(
      400,
      `Status tidak valid. Pilihan: ${VALID_STATUSES.join(", ")}`,
    );

  const absensi = await AbsensiSiswa.findByPk(req.params.id);
  if (!absensi) throw createError(404, "Absensi tidak ditemukan");

  await absensi.update({
    status,
    keterangan: keterangan || null,
    updated_at: new Date(),
  });
  res.json({ success: true, data: absensi });
});

exports.deleteAbsensiSiswa = asyncHandler(async (req, res) => {
  const absensi = await AbsensiSiswa.findByPk(req.params.id);
  if (!absensi) throw createError(404, "Absensi tidak ditemukan");
  await absensi.destroy();
  res.json({ success: true, message: "Absensi berhasil dihapus" });
});
