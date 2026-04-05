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

// ─── HELPER: buat tabel konfirmasi jika belum ada (idempotent) ────────────────
const ensureKonfirmasiTable = (client) =>
  (client || pool).query(`
    CREATE TABLE IF NOT EXISTS konfirmasi_rekap_nilai (
      id              SERIAL PRIMARY KEY,
      kelas_id        INTEGER NOT NULL,
      mapel_id        INTEGER,
      tahun_ajar      VARCHAR(20),
      wali_id         INTEGER,
      dikonfirmasi_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (kelas_id, mapel_id, tahun_ajar)
    )
  `);

/**
 * GET /api/academic/kepsek/rekap-nilai-final
 * Rekap nilai final per siswa per mapel — dengan status konfirmasi wali kelas
 * Query params: kelas_id, mapel_id, tahun_ajar
 */
exports.getRekapNilaiFinal = async (req, res) => {
  const { kelas_id, mapel_id, tahun_ajar } = req.query;

  try {
    await ensureKonfirmasiTable();

    let query = `
      SELECT
        s.id           AS siswa_id,
        s.nisn,
        s.nama_lengkap,
        k.id           AS kelas_id,
        k.nama_kelas,
        m.id           AS mapel_id,
        m.nama_mapel,
        n.tahun_ajar,
        COALESCE(n.nilai_tugas,   0) AS nilai_tugas,
        COALESCE(n.nilai_kuis,    0) AS nilai_kuis,
        COALESCE(n.nilai_uts,     0) AS nilai_uts,
        COALESCE(n.nilai_uas,     0) AS nilai_uas,
        COALESCE(n.nilai_praktik, 0) AS nilai_praktik,
        ROUND((
          COALESCE(n.nilai_tugas,   0) * 0.15 +
          COALESCE(n.nilai_kuis,    0) * 0.15 +
          COALESCE(n.nilai_uts,     0) * 0.20 +
          COALESCE(n.nilai_uas,     0) * 0.30 +
          COALESCE(n.nilai_praktik, 0) * 0.20
        )::numeric, 2) AS nilai_akhir,
        CASE WHEN krn.id IS NOT NULL THEN true ELSE false END AS sudah_dikonfirmasi,
        krn.dikonfirmasi_at
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      JOIN nilai_siswa n
        ON n.siswa_id = s.id
       AND n.kelas_id = s.kelas_id
      JOIN mata_pelajaran m ON n.mapel_id = m.id
      LEFT JOIN konfirmasi_rekap_nilai krn
        ON krn.kelas_id   = n.kelas_id
       AND krn.mapel_id   = n.mapel_id
       AND krn.tahun_ajar = n.tahun_ajar
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (kelas_id)   { query += ` AND s.kelas_id = $${idx++}`;   params.push(kelas_id); }
    if (mapel_id)   { query += ` AND n.mapel_id = $${idx++}`;   params.push(mapel_id); }
    if (tahun_ajar) { query += ` AND n.tahun_ajar = $${idx++}`; params.push(tahun_ajar); }
    query += ` ORDER BY k.nama_kelas, s.nama_lengkap, m.nama_mapel`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getRekapNilaiFinal]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/academic/kepsek/rekap-nilai-final/detail-siswa/:siswa_id
 * Detail semua nilai satu siswa (semua mapel) lengkap dengan status verifikasi
 * Query params: tahun_ajar
 */
exports.getDetailNilaiSiswa = async (req, res) => {
  const { siswa_id } = req.params;
  const { tahun_ajar } = req.query;

  try {
    await ensureKonfirmasiTable();

    let query = `
      SELECT
        s.id           AS siswa_id,
        s.nisn,
        s.nama_lengkap,
        k.nama_kelas,
        m.id           AS mapel_id,
        m.nama_mapel,
        n.tahun_ajar,
        COALESCE(n.nilai_tugas,   0) AS nilai_tugas,
        COALESCE(n.nilai_kuis,    0) AS nilai_kuis,
        COALESCE(n.nilai_uts,     0) AS nilai_uts,
        COALESCE(n.nilai_uas,     0) AS nilai_uas,
        COALESCE(n.nilai_praktik, 0) AS nilai_praktik,
        ROUND((
          COALESCE(n.nilai_tugas,   0) * 0.15 +
          COALESCE(n.nilai_kuis,    0) * 0.15 +
          COALESCE(n.nilai_uts,     0) * 0.20 +
          COALESCE(n.nilai_uas,     0) * 0.30 +
          COALESCE(n.nilai_praktik, 0) * 0.20
        )::numeric, 2) AS nilai_akhir,
        CASE WHEN krn.id IS NOT NULL THEN true ELSE false END AS sudah_dikonfirmasi,
        krn.dikonfirmasi_at
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      JOIN nilai_siswa n
        ON n.siswa_id = s.id
       AND n.kelas_id = s.kelas_id
      JOIN mata_pelajaran m ON n.mapel_id = m.id
      LEFT JOIN konfirmasi_rekap_nilai krn
        ON krn.kelas_id   = n.kelas_id
       AND krn.mapel_id   = n.mapel_id
       AND krn.tahun_ajar = n.tahun_ajar
      WHERE s.id = $1
    `;
    const params = [siswa_id];
    let idx = 2;
    if (tahun_ajar) { query += ` AND n.tahun_ajar = $${idx++}`; params.push(tahun_ajar); }
    query += ` ORDER BY m.nama_mapel`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data nilai siswa tidak ditemukan' });
    }

    const { siswa_id: id, nisn, nama_lengkap, nama_kelas } = result.rows[0];
    const nilaiMapel = result.rows.map((r) => ({
      mapel_id:           r.mapel_id,
      nama_mapel:         r.nama_mapel,
      tahun_ajar:         r.tahun_ajar,
      nilai_tugas:        r.nilai_tugas,
      nilai_kuis:         r.nilai_kuis,
      nilai_uts:          r.nilai_uts,
      nilai_uas:          r.nilai_uas,
      nilai_praktik:      r.nilai_praktik,
      nilai_akhir:        r.nilai_akhir,
      sudah_dikonfirmasi: r.sudah_dikonfirmasi,
      dikonfirmasi_at:    r.dikonfirmasi_at,
    }));

    const rata_rata_umum = nilaiMapel.length
      ? Math.round(
          (nilaiMapel.reduce((s, n) => s + Number(n.nilai_akhir), 0) / nilaiMapel.length) * 100
        ) / 100
      : 0;

    res.json({
      success: true,
      data: { siswa_id: id, nisn, nama_lengkap, nama_kelas, nilai_mapel: nilaiMapel, rata_rata_umum },
    });
  } catch (err) {
    console.error('[getDetailNilaiSiswa]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/academic/kepsek/rekap-nilai-final/konfirmasi
 * Dipanggil Wali Kelas untuk menandai rekap nilai sudah dikonfirmasi ke Kepala Sekolah
 * Body: { kelas_id, mapel_id, tahun_ajar }
 */
exports.konfirmasiRekapNilai = async (req, res) => {
  const { kelas_id, mapel_id, tahun_ajar } = req.body;
  const wali_id = req.identity?.id || null;

  if (!kelas_id || !tahun_ajar) {
    return res.status(400).json({ success: false, message: 'kelas_id dan tahun_ajar wajib diisi' });
  }

  try {
    await ensureKonfirmasiTable();

    const result = await pool.query(
      `INSERT INTO konfirmasi_rekap_nilai (kelas_id, mapel_id, tahun_ajar, wali_id, dikonfirmasi_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (kelas_id, mapel_id, tahun_ajar)
       DO UPDATE SET wali_id = EXCLUDED.wali_id, dikonfirmasi_at = NOW()
       RETURNING *`,
      [kelas_id, mapel_id || null, tahun_ajar, wali_id]
    );

    res.json({ success: true, message: 'Rekap nilai berhasil dikonfirmasi', data: result.rows[0] });
  } catch (err) {
    console.error('[konfirmasiRekapNilai]', err);
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