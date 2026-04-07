const { MataPelajaran, Kelas } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllMapel = asyncHandler(async (req, res) => {
  const data = await MataPelajaran.findAll({
    include: [{ model: Kelas, as: 'kelas', attributes: ['nama_kelas'] }],
    order: [['id', 'DESC']],
  });
  res.json({ success: true, data });
});

exports.createMapel = asyncHandler(async (req, res) => {
  const { nama_mapel, kelas_id, guru_mapel_id } = req.body;
  if (!nama_mapel) throw createError(400, 'Field nama_mapel wajib diisi');

  const mapel = await MataPelajaran.create({
    nama_mapel,
    kelas_id: kelas_id || null,
    guru_mapel_id: guru_mapel_id || null,
  });
  res.status(201).json({ success: true, data: mapel });
});

exports.updateMapel = asyncHandler(async (req, res) => {
  const { nama_mapel, kelas_id, guru_mapel_id } = req.body;
  if (!nama_mapel) throw createError(400, 'Field nama_mapel wajib diisi');

  const mapel = await MataPelajaran.findByPk(req.params.id);
  if (!mapel) throw createError(404, 'Mata pelajaran tidak ditemukan');

  await mapel.update({ nama_mapel, kelas_id: kelas_id || null, guru_mapel_id: guru_mapel_id || null });
  res.json({ success: true, data: mapel });
});

exports.deleteMapel = asyncHandler(async (req, res) => {
  const mapel = await MataPelajaran.findByPk(req.params.id);
  if (!mapel) throw createError(404, 'Mata pelajaran tidak ditemukan');
  await mapel.destroy();
  res.json({ success: true, message: 'Mata pelajaran berhasil dihapus' });
});