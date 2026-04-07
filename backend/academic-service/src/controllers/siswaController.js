const { Siswa, Kelas } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllSiswa = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.kelas_id) where.kelas_id = req.query.kelas_id;

  const data = await Siswa.findAll({
    where,
    include: [{ model: Kelas, as: 'kelas', attributes: ['nama_kelas'] }],
    order: [['nama_lengkap', 'ASC']],
  });
  res.json({ success: true, data });
});

exports.createSiswa = asyncHandler(async (req, res) => {
  const { nisn, nama_lengkap, kelas_id } = req.body;
  if (!nisn || !nama_lengkap) throw createError(400, 'Field nisn dan nama_lengkap wajib diisi');

  const siswa = await Siswa.create({ nisn, nama_lengkap, kelas_id: kelas_id || null });
  res.status(201).json({ success: true, data: siswa });
});

exports.updateSiswa = asyncHandler(async (req, res) => {
  const { nisn, nama_lengkap, kelas_id } = req.body;
  if (!nisn || !nama_lengkap) throw createError(400, 'Field nisn dan nama_lengkap wajib diisi');

  const siswa = await Siswa.findByPk(req.params.id);
  if (!siswa) throw createError(404, 'Siswa tidak ditemukan');

  await siswa.update({ nisn, nama_lengkap, kelas_id: kelas_id || null });
  res.json({ success: true, data: siswa });
});

exports.deleteSiswa = asyncHandler(async (req, res) => {
  const siswa = await Siswa.findByPk(req.params.id);
  if (!siswa) throw createError(404, 'Siswa tidak ditemukan');
  await siswa.destroy();
  res.json({ success: true, message: 'Siswa berhasil dihapus' });
});