const { JadwalPiket } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllPiket = asyncHandler(async (req, res) => {
  const data = await JadwalPiket.findAll({ order: [['tanggal', 'DESC']] });
  res.json({ success: true, data });
});

exports.createPiket = asyncHandler(async (req, res) => {
  const { tanggal, guru_id } = req.body;
  if (!tanggal) throw createError(400, 'Field tanggal wajib diisi');

  const piket = await JadwalPiket.create({ tanggal, guru_id: guru_id || null });
  res.status(201).json({ success: true, data: piket });
});

exports.updatePiket = asyncHandler(async (req, res) => {
  const { tanggal, guru_id } = req.body;
  if (!tanggal) throw createError(400, 'Field tanggal wajib diisi');

  const piket = await JadwalPiket.findByPk(req.params.id);
  if (!piket) throw createError(404, 'Jadwal piket tidak ditemukan');

  await piket.update({ tanggal, guru_id: guru_id || null });
  res.json({ success: true, data: piket });
});

exports.deletePiket = asyncHandler(async (req, res) => {
  const piket = await JadwalPiket.findByPk(req.params.id);
  if (!piket) throw createError(404, 'Jadwal piket tidak ditemukan');
  await piket.destroy();
  res.json({ success: true, message: 'Jadwal piket berhasil dihapus' });
});