const { Pengumuman } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllPengumuman = asyncHandler(async (req, res) => {
  const data = await Pengumuman.findAll({ order: [['id', 'DESC']] });
  res.json({ success: true, data });
});

exports.createPengumuman = asyncHandler(async (req, res) => {
  const { judul, isi } = req.body;
  if (!judul || !isi) throw createError(400, 'Field judul dan isi wajib diisi');

  const pengumuman = await Pengumuman.create({ judul, isi });
  res.status(201).json({ success: true, data: pengumuman });
});

exports.updatePengumuman = asyncHandler(async (req, res) => {
  const { judul, isi } = req.body;
  if (!judul || !isi) throw createError(400, 'Field judul dan isi wajib diisi');

  const pengumuman = await Pengumuman.findByPk(req.params.id);
  if (!pengumuman) throw createError(404, 'Pengumuman tidak ditemukan');

  await pengumuman.update({ judul, isi });
  res.json({ success: true, data: pengumuman });
});

exports.deletePengumuman = asyncHandler(async (req, res) => {
  const pengumuman = await Pengumuman.findByPk(req.params.id);
  if (!pengumuman) throw createError(404, 'Pengumuman tidak ditemukan');
  await pengumuman.destroy();
  res.json({ success: true, message: 'Pengumuman berhasil dihapus' });
});