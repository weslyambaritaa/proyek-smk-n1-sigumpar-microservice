const { JadwalMengajar, Kelas, ParentingLog, WakilPerangkatPembelajaran, Guru } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const sequelize = require('../config/db');

const URUTAN_HARI = { Senin:1, Selasa:2, Rabu:3, Kamis:4, Jumat:5, Sabtu:6 };

exports.getJadwalMonitoring = asyncHandler(async (req, res) => {
  const { hari, kelas_id, guru_id, mapel } = req.query;
  const where = {};
  if (hari)     where.hari         = hari;
  if (kelas_id) where.kelas_id     = kelas_id;
  if (guru_id)  where.guru_id      = guru_id;
  if (mapel)    where.mata_pelajaran = { [Op.iLike]: `%${mapel}%` };

  const rows = await JadwalMengajar.findAll({
    where,
    include: [{ model: Kelas, as: 'kelas', attributes: ['nama_kelas'] }],
  });

  rows.sort((a, b) => {
    const hA = URUTAN_HARI[a.hari] ?? 7;
    const hB = URUTAN_HARI[b.hari] ?? 7;
    if (hA !== hB) return hA - hB;
    return a.waktu_mulai > b.waktu_mulai ? 1 : -1;
  });

  // Deteksi bentrok jadwal guru
  const bentrokIds = new Set();
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i], b = rows[j];
      if (!a.guru_id || a.guru_id !== b.guru_id || a.hari !== b.hari) continue;
      if (a.waktu_mulai < b.waktu_berakhir && b.waktu_mulai < a.waktu_berakhir) {
        bentrokIds.add(a.id); bentrokIds.add(b.id);
      }
    }
  }

  const data = rows.map((r) => ({ ...r.toJSON(), is_bentrok: bentrokIds.has(r.id) }));
  res.json({ success: true, total: data.length, bentrok: bentrokIds.size, data });
});

exports.getRekapJadwalPerHari = asyncHandler(async (req, res) => {
  const rows = await sequelize.query(
    `SELECT hari, COUNT(*) AS total_jam, COUNT(DISTINCT guru_id) AS total_guru, COUNT(DISTINCT kelas_id) AS total_kelas
     FROM jadwal_mengajar GROUP BY hari
     ORDER BY CASE hari WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3
       WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 WHEN 'Sabtu' THEN 6 ELSE 7 END`,
    { type: QueryTypes.SELECT }
  );
  res.json({ success: true, data: rows });
});

exports.getParentingMonitoring = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.kelas_id) where.kelas_id = req.query.kelas_id;

  const data = await ParentingLog.findAll({
    where,
    include: [{ model: Kelas, foreignKey: 'kelas_id', attributes: ['nama_kelas'] }],
    order: [['tanggal', 'DESC'], ['id', 'DESC']],
  });
  res.json({ success: true, data });
});

exports.getLaporanRingkas = asyncHandler(async (req, res) => {
  const [jadwalRes, kelasRes, guruRes, parentingRes, perangkatRes] = await Promise.all([
    sequelize.query('SELECT COUNT(*) AS total, COUNT(DISTINCT guru_id) AS guru, COUNT(DISTINCT kelas_id) AS kelas FROM jadwal_mengajar', { type: QueryTypes.SELECT }),
    sequelize.query('SELECT COUNT(*) AS total FROM kelas', { type: QueryTypes.SELECT }),
    sequelize.query('SELECT COUNT(*) AS total FROM guru', { type: QueryTypes.SELECT }),
    sequelize.query('SELECT COUNT(*) AS total FROM parenting_log', { type: QueryTypes.SELECT }),
    sequelize.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='lengkap') AS lengkap FROM wakil_perangkat_pembelajaran", { type: QueryTypes.SELECT })
      .catch(() => [{ total: 0, lengkap: 0 }]),
  ]);

  res.json({
    success: true,
    data: {
      jadwal:    { total_jam: +jadwalRes[0].total, total_guru: +jadwalRes[0].guru, total_kelas: +jadwalRes[0].kelas },
      kelas:     { total: +kelasRes[0].total },
      guru:      { total: +guruRes[0].total },
      perangkat: { total: +perangkatRes[0].total, lengkap: +perangkatRes[0].lengkap },
      parenting: { total: +parentingRes[0].total },
    },
  });
});