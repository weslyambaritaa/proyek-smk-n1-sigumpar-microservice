const { JadwalMengajar, Kelas } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const URUTAN_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

exports.getAllJadwal = asyncHandler(async (req, res) => {
  const data = await JadwalMengajar.findAll({
    include: [{ model: Kelas, as: 'kelas', attributes: ['nama_kelas'] }],
  });

  // Urutkan hari secara custom (tidak bisa lewat Sequelize ORDER untuk CASE)
  data.sort((a, b) => {
    const hariA = URUTAN_HARI.indexOf(a.hari);
    const hariB = URUTAN_HARI.indexOf(b.hari);
    if (hariA !== hariB) return hariA - hariB;
    return a.waktu_mulai > b.waktu_mulai ? 1 : -1;
  });

  res.json({ success: true, data });
});

exports.createJadwal = asyncHandler(async (req, res) => {
  const { guru_id, kelas_id, mata_pelajaran, hari, waktu_mulai, waktu_berakhir } = req.body;
  if (!mata_pelajaran || !hari || !waktu_mulai || !waktu_berakhir) {
    throw createError(400, 'Field mata_pelajaran, hari, waktu_mulai, dan waktu_berakhir wajib diisi');
  }

  const jadwal = await JadwalMengajar.create({
    guru_id: guru_id || null,
    kelas_id: kelas_id || null,
    mata_pelajaran, hari, waktu_mulai, waktu_berakhir,
  });
  res.status(201).json({ success: true, data: jadwal });
});

exports.updateJadwal = asyncHandler(async (req, res) => {
  const { guru_id, kelas_id, mata_pelajaran, hari, waktu_mulai, waktu_berakhir } = req.body;
  if (!mata_pelajaran || !hari || !waktu_mulai || !waktu_berakhir) {
    throw createError(400, 'Field mata_pelajaran, hari, waktu_mulai, dan waktu_berakhir wajib diisi');
  }

  const jadwal = await JadwalMengajar.findByPk(req.params.id);
  if (!jadwal) throw createError(404, 'Jadwal mengajar tidak ditemukan');

  await jadwal.update({
    guru_id: guru_id || null, kelas_id: kelas_id || null,
    mata_pelajaran, hari, waktu_mulai, waktu_berakhir,
  });
  res.json({ success: true, data: jadwal });
});

exports.deleteJadwal = asyncHandler(async (req, res) => {
  const jadwal = await JadwalMengajar.findByPk(req.params.id);
  if (!jadwal) throw createError(404, 'Jadwal mengajar tidak ditemukan');
  await jadwal.destroy();
  res.json({ success: true, message: 'Jadwal mengajar berhasil dihapus' });
});