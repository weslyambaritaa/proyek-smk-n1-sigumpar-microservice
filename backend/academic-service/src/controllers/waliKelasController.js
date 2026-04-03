const pool = require('../config/db');

// ─── PARENTING ─────────────────────────────────────────────────────────────

exports.getParenting = async (req, res) => {
  try {
    const { kelas_id, wali_id } = req.query;
    let query = 'SELECT * FROM parenting_log WHERE 1=1';
    const params = [];
    let idx = 1;
    if (kelas_id) { query += ` AND kelas_id = $${idx++}`; params.push(kelas_id); }
    if (wali_id)  { query += ` AND wali_id = $${idx++}`;  params.push(wali_id); }
    query += ' ORDER BY tanggal DESC, id DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getParenting]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createParenting = async (req, res) => {
  try {
    const { tanggal, kehadiran_ortu, agenda, ringkasan, kelas_id, wali_id } = req.body;
    let foto_url = null;
    if (req.file) {
      foto_url = `/api/academic/uploads/${req.file.filename}`;
    }
    const result = await pool.query(
      `INSERT INTO parenting_log (kelas_id, wali_id, tanggal, kehadiran_ortu, agenda, ringkasan, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [kelas_id || null, wali_id || null, tanggal || new Date().toISOString().slice(0,10),
       kehadiran_ortu || 0, agenda || '', ringkasan || '', foto_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[createParenting]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── KEBERSIHAN KELAS ─────────────────────────────────────────────────────

exports.getKebersihan = async (req, res) => {
  try {
    const { kelas_id } = req.query;
    let query = 'SELECT * FROM kebersihan_kelas WHERE 1=1';
    const params = [];
    if (kelas_id) { query += ` AND kelas_id = $1`; params.push(kelas_id); }
    query += ' ORDER BY tanggal DESC, id DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getKebersihan]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createKebersihan = async (req, res) => {
  try {
    const { kelas_id, tanggal, penilaian, catatan } = req.body;
    let foto_url = null;
    if (req.file) {
      foto_url = `/api/academic/uploads/${req.file.filename}`;
    }
    const result = await pool.query(
      `INSERT INTO kebersihan_kelas (kelas_id, tanggal, penilaian, catatan, foto_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [kelas_id || null, tanggal || new Date().toISOString().slice(0,10),
       penilaian || '{}', catatan || '', foto_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[createKebersihan]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── REFLEKSI ──────────────────────────────────────────────────────────────

exports.getRefleksi = async (req, res) => {
  try {
    const { kelas_id, wali_id } = req.query;
    let query = 'SELECT * FROM refleksi_wali_kelas WHERE 1=1';
    const params = [];
    let idx = 1;
    if (kelas_id) { query += ` AND kelas_id = $${idx++}`; params.push(kelas_id); }
    if (wali_id)  { query += ` AND wali_id = $${idx++}`;  params.push(wali_id); }
    query += ' ORDER BY tanggal DESC, id DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getRefleksi]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createRefleksi = async (req, res) => {
  try {
    const { kelas_id, wali_id, tanggal, capaian, tantangan, rencana } = req.body;
    const result = await pool.query(
      `INSERT INTO refleksi_wali_kelas (kelas_id, wali_id, tanggal, capaian, tantangan, rencana)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [kelas_id || null, wali_id || null, tanggal || new Date().toISOString().slice(0,10),
       capaian || '', tantangan || '', rencana || '']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[createRefleksi]', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── REKAP NILAI WALI KELAS ────────────────────────────────────────────────
// Menampilkan nilai siswa dari guru mapel, difilter berdasarkan kelas_id

exports.getRekapNilaiWali = async (req, res) => {
  const { kelas_id, mapel_id, tahun_ajar } = req.query;
  if (!kelas_id) {
    return res.status(400).json({ success: false, message: 'kelas_id wajib diisi' });
  }
  try {
    const query = `
      SELECT
        s.id AS siswa_id,
        s.nisn,
        s.nama_lengkap,
        k.nama_kelas,
        m.nama_mapel,
        n.mapel_id,
        n.tahun_ajar,
        COALESCE(n.nilai_tugas, 0)   AS nilai_tugas,
        COALESCE(n.nilai_kuis, 0)    AS nilai_kuis,
        COALESCE(n.nilai_uts, 0)     AS nilai_uts,
        COALESCE(n.nilai_uas, 0)     AS nilai_uas,
        COALESCE(n.nilai_praktik, 0) AS nilai_praktik,
        CASE
          WHEN n.id IS NOT NULL THEN
            ROUND((
              n.nilai_tugas * 0.15 +
              n.nilai_kuis  * 0.15 +
              n.nilai_uts   * 0.20 +
              n.nilai_uas   * 0.30 +
              n.nilai_praktik * 0.20
            )::numeric, 2)
          ELSE 0
        END AS nilai_akhir
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN nilai_siswa n
        ON n.siswa_id = s.id
        AND n.kelas_id = $1
        AND ($2::INTEGER IS NULL OR n.mapel_id = $2::INTEGER)
        AND ($3::VARCHAR IS NULL OR n.tahun_ajar = $3)
      LEFT JOIN mata_pelajaran m ON n.mapel_id = m.id
      WHERE s.kelas_id = $1
      ORDER BY s.nama_lengkap ASC, m.nama_mapel ASC
    `;
    const result = await pool.query(query, [
      kelas_id,
      mapel_id || null,
      tahun_ajar || null,
    ]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getRekapNilaiWali]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── REKAP ABSENSI WALI KELAS ─────────────────────────────────────────────

exports.getRekapAbsensiWali = async (req, res) => {
  const { kelas_id, bulan, tahun } = req.query;
  if (!kelas_id) {
    return res.status(400).json({ success: false, message: 'kelas_id wajib diisi' });
  }
  try {
    const query = `
      SELECT
        s.id AS siswa_id,
        s.nisn,
        s.nama_lengkap,
        k.nama_kelas,
        COUNT(CASE WHEN ab.status = 'Hadir'    THEN 1 END) AS hadir,
        COUNT(CASE WHEN ab.status = 'Sakit'    THEN 1 END) AS sakit,
        COUNT(CASE WHEN ab.status = 'Izin'     THEN 1 END) AS izin,
        COUNT(CASE WHEN ab.status = 'Alpa'     THEN 1 END) AS alpa,
        COUNT(CASE WHEN ab.status = 'Terlambat' THEN 1 END) AS terlambat,
        COUNT(ab.id) AS total_pertemuan
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN absensi_siswa ab ON ab.siswa_id = s.id
        AND ($2::INTEGER IS NULL OR EXTRACT(MONTH FROM ab.tanggal) = $2)
        AND ($3::INTEGER IS NULL OR EXTRACT(YEAR  FROM ab.tanggal) = $3)
      WHERE s.kelas_id = $1
      GROUP BY s.id, s.nisn, s.nama_lengkap, k.nama_kelas
      ORDER BY s.nama_lengkap ASC
    `;
    const result = await pool.query(query, [
      kelas_id,
      bulan ? parseInt(bulan) : null,
      tahun ? parseInt(tahun) : null,
    ]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getRekapAbsensiWali]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
