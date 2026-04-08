const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getKepsekDashboard = asyncHandler(async (_req, res) => {
  const [absensi, perangkat, evaluasi] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM absensi_guru'),
    pool.query('SELECT COUNT(*)::int AS total FROM perangkat_pembelajaran'),
    pool.query(`SELECT COUNT(*)::int AS selesai,
                  COALESCE(ROUND(AVG(COALESCE(skor,0))),0)::int AS rata
                FROM evaluasi_kinerja_guru
                WHERE LOWER(COALESCE(status,'')) LIKE '%selesai%'`),
  ]);
  res.json({
    success: true,
    data: {
      absensiGuru:     absensi.rows[0].total,
      perangkat:       perangkat.rows[0].total,
      evaluasiSelesai: evaluasi.rows[0].selesai,
      rataSkor:        evaluasi.rows[0].rata,
    },
  });
});

exports.getEvaluasiGuru = asyncHandler(async (_req, res) => {
  const result = await pool.query('SELECT * FROM evaluasi_kinerja_guru ORDER BY id DESC');
  res.json({ success: true, data: result.rows });
});

exports.saveEvaluasiGuru = asyncHandler(async (req, res) => {
  const { guru_nama, mapel, semester, status, skor, catatan } = req.body;
  if (!guru_nama || !mapel || !semester || !status) {
    throw createError(400, 'Field guru_nama, mapel, semester, dan status wajib diisi');
  }
  const result = await pool.query(
    `INSERT INTO evaluasi_kinerja_guru (guru_nama, mapel, semester, status, skor, catatan)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [guru_nama, mapel, semester, status, skor || null, catatan || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});