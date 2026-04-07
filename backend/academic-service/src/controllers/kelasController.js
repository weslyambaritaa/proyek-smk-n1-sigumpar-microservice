const { Kelas } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllKelas = asyncHandler(async (req, res) => {
  const data = await Kelas.findAll({ order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']] });
  res.json({ success: true, data });
});

exports.createKelas = asyncHandler(async (req, res) => {
  const { nama_kelas, tingkat, wali_kelas_id } = req.body;
  if (!nama_kelas) throw createError(400, 'Field nama_kelas wajib diisi');

  const kelas = await Kelas.create({ nama_kelas, tingkat, wali_kelas_id: wali_kelas_id || null });
  res.status(201).json({ success: true, data: kelas });
});

exports.updateKelas = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama_kelas, tingkat, wali_kelas_id } = req.body;
  if (!nama_kelas) throw createError(400, 'Field nama_kelas wajib diisi');

  const kelas = await Kelas.findByPk(id);
  if (!kelas) throw createError(404, 'Kelas tidak ditemukan');

  await kelas.update({ nama_kelas, tingkat, wali_kelas_id: wali_kelas_id || null });
  res.json({ success: true, data: kelas });
});

exports.deleteKelas = asyncHandler(async (req, res) => {
  const kelas = await Kelas.findByPk(req.params.id);
  if (!kelas) throw createError(404, 'Kelas tidak ditemukan');
  await kelas.destroy();
  res.json({ success: true, message: 'Kelas berhasil dihapus' });
});