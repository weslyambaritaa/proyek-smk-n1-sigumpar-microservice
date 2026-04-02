const pool = require('../config/db');

/**
 * GET /api/academic/kepsek/rekap-absensi-siswa
 * Rekap absensi semua siswa dengan filter opsional
 * Query params: kelas_id, bulan (YYYY-MM), tanggal (YYYY-MM-DD)
 */
exports.getRekapAbsensiSiswa = async (req, res) => {
  const { kelas_id, bulan, tanggal } = req.query;

  try {
    let query = `
      SELECT
        s.id          AS siswa_id,
        s.nama_lengkap,
        s.nisn,
        k.nama_kelas,
        COUNT(*)      AS total,
        COUNT(*) FILTER (WHERE a.status = 'hadir')     AS hadir,
        COUNT(*) FILTER (WHERE a.status = 'sakit')     AS sakit,
        COUNT(*) FILTER (WHERE a.status = 'izin')      AS izin,
        COUNT(*) FILTER (WHERE a.status = 'alpa')      AS alpa,
        COUNT(*) FILTER (WHERE a.status = 'terlambat') AS terlambat
      FROM absensi_siswa a
      JOIN siswa s ON a.siswa_id = s.id
      JOIN kelas k ON s.kelas_id = k.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (kelas_id) { query += ` AND s.kelas_id = $${idx++}`; params.push(kelas_id); }
    if (tanggal)  { query += ` AND a.tanggal = $${idx++}`;  params.push(tanggal); }
    if (bulan)    { query += ` AND TO_CHAR(a.tanggal,'YYYY-MM') = $${idx++}`; params.push(bulan); }

    query += ` GROUP BY s.id, s.nama_lengkap, s.nisn, k.nama_kelas ORDER BY k.nama_kelas, s.nama_lengkap`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getRekapAbsensiSiswa]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/academic/kepsek/rekap-nilai
 * Rekap nilai rata-rata per kelas
 */
exports.getRekapNilai = async (req, res) => {
  const { kelas_id, tahun_ajar } = req.query;

  try {
    let query = `
      SELECT
        k.id         AS kelas_id,
        k.nama_kelas,
        m.nama_mapel,
        COUNT(DISTINCT n.siswa_id)                  AS jumlah_siswa,
        ROUND(AVG(n.nilai_tugas),2)                 AS avg_tugas,
        ROUND(AVG(n.nilai_uts),2)                   AS avg_uts,
        ROUND(AVG(n.nilai_uas),2)                   AS avg_uas,
        ROUND(AVG(
          n.nilai_tugas * 0.15 + n.nilai_kuis * 0.15 +
          n.nilai_uts   * 0.20 + n.nilai_uas  * 0.30 +
          n.nilai_praktik * 0.20
        ),2)                                         AS avg_akhir
      FROM nilai_siswa n
      JOIN kelas k          ON n.kelas_id = k.id
      JOIN mata_pelajaran m ON n.mapel_id  = m.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (kelas_id)   { query += ` AND n.kelas_id = $${idx++}`;   params.push(kelas_id); }
    if (tahun_ajar) { query += ` AND n.tahun_ajar = $${idx++}`; params.push(tahun_ajar); }

    query += ` GROUP BY k.id, k.nama_kelas, m.id, m.nama_mapel ORDER BY k.nama_kelas, m.nama_mapel`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getRekapNilai]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/academic/kepsek/statistik
 * Statistik umum untuk dashboard kepala sekolah
 */
exports.getStatistikUmum = async (req, res) => {
  try {
    const [siswa, kelas, guru, mapel] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM siswa'),
      pool.query('SELECT COUNT(*) AS total FROM kelas'),
      pool.query('SELECT COUNT(DISTINCT guru_mapel_id) AS total FROM mata_pelajaran WHERE guru_mapel_id IS NOT NULL'),
      pool.query('SELECT COUNT(*) AS total FROM mata_pelajaran'),
    ]);

    res.json({
      success: true,
      data: {
        total_siswa: parseInt(siswa.rows[0].total),
        total_kelas: parseInt(kelas.rows[0].total),
        total_guru:  parseInt(guru.rows[0].total),
        total_mapel: parseInt(mapel.rows[0].total),
      },
    });
  } catch (err) {
    console.error('[getStatistikUmum]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
