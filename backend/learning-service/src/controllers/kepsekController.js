const { EvaluasiKinerjaGuru, AbsensiGuru, PerangkatPembelajaran } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getKepsekDashboard = asyncHandler(async (_req, res) => {
  const [totalAbsensi, totalPerangkat, evaluasiRows] = await Promise.all([
    AbsensiGuru.count(),
    PerangkatPembelajaran.count(),
    EvaluasiKinerjaGuru.findAll({
      where: {
        status: { [require('sequelize').Op.iLike]: '%selesai%' },
      },
      attributes: ['skor'],
    }),
  ]);

  const totalSelesai = evaluasiRows.length;
  const rataSkor = totalSelesai
    ? Math.round(evaluasiRows.reduce((sum, e) => sum + (e.skor || 0), 0) / totalSelesai)
    : 0;

  res.json({
    success: true,
    data: {
      absensiGuru:     totalAbsensi,
      perangkat:       totalPerangkat,
      evaluasiSelesai: totalSelesai,
      rataSkor,
    },
  });
});

exports.getEvaluasiGuru = asyncHandler(async (_req, res) => {
  const data = await EvaluasiKinerjaGuru.findAll({ order: [['id', 'DESC']] });
  res.json({ success: true, data });
});

exports.saveEvaluasiGuru = asyncHandler(async (req, res) => {
  const { guru_nama, mapel, semester, status, skor, catatan } = req.body;
  if (!guru_nama || !mapel || !semester || !status) {
    throw createError(400, 'Field guru_nama, mapel, semester, dan status wajib diisi');
  }
  const data = await EvaluasiKinerjaGuru.create({
    guru_nama, mapel, semester, status,
    skor:    skor    || null,
    catatan: catatan || null,
  });
  res.status(201).json({ success: true, data });
});