const { JadwalUpacara } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllUpacara = asyncHandler(async (req, res) => {
  const data = await JadwalUpacara.findAll({ order: [['tanggal', 'DESC']] });
  res.json({ success: true, data });
});

exports.createUpacara = asyncHandler(async (req, res) => {
  const { tanggal, petugas } = req.body;
  if (!tanggal || !petugas) throw createError(400, 'Field tanggal dan petugas wajib diisi');

  const upacara = await JadwalUpacara.create({ tanggal, petugas });
  res.status(201).json({ success: true, data: upacara });
});

exports.updateUpacara = asyncHandler(async (req, res) => {
  const { tanggal, petugas } = req.body;
  if (!tanggal || !petugas) throw createError(400, 'Field tanggal dan petugas wajib diisi');

  const upacara = await JadwalUpacara.findByPk(req.params.id);
  if (!upacara) throw createError(404, 'Jadwal upacara tidak ditemukan');

  await upacara.update({ tanggal, petugas });
  res.json({ success: true, data: upacara });
});

exports.deleteUpacara = asyncHandler(async (req, res) => {
  const upacara = await JadwalUpacara.findByPk(req.params.id);
  if (!upacara) throw createError(404, 'Jadwal upacara tidak ditemukan');
  await upacara.destroy();
  res.json({ success: true, message: 'Jadwal upacara berhasil dihapus' });
});