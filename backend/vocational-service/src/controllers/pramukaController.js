const db = require('../config/db');

// ── REGU ──────────────────────────────────────────────────────────────────

exports.getAllRegu = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM kelas_pramuka ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRegu = async (req, res) => {
  const { nama_regu } = req.body;
  if (!nama_regu) return res.status(400).json({ error: 'nama_regu wajib diisi' });
  try {
    const result = await db.query('INSERT INTO kelas_pramuka (nama_regu) VALUES ($1) RETURNING *', [nama_regu]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── ANGGOTA REGU ──────────────────────────────────────────────────────────

exports.getSiswaTersedia = async (req, res) => {
  try {
    // Ambil dari academic service atau return data dari siswa yang belum di-assign
    const result = await db.query(`
      SELECT s.id, s.siswa_id, s.nama_lengkap
      FROM (VALUES (1,'Siswa Pramuka')) AS s(id, siswa_id, nama_lengkap)
      WHERE 1=0
    `); // Placeholder - frontend handles this
    res.json([]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.assignSiswaToRegu = async (req, res) => {
  const { regu_id, siswa_id, nama_lengkap } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO anggota_regu (regu_id, siswa_id, nama_lengkap) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *',
      [regu_id, siswa_id, nama_lengkap || '']
    );
    res.status(201).json(result.rows[0] || { message: 'Sudah ada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getSiswaByRegu = async (req, res) => {
  const { regu_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM anggota_regu WHERE regu_id = $1 ORDER BY nama_lengkap ASC',
      [regu_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── ABSENSI PRAMUKA ───────────────────────────────────────────────────────

exports.submitAbsensiPramuka = async (req, res) => {
  // Support kelas_id (baru) ATAU regu_id (lama)
  const { kelas_id, regu_id, tanggal, deskripsi, file_url, data_absensi } = req.body;
  const kelasOrRegu = kelas_id || regu_id;

  if (!kelasOrRegu || !tanggal || !Array.isArray(data_absensi)) {
    return res.status(400).json({ error: 'kelas_id, tanggal, dan data_absensi wajib diisi' });
  }
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Simpan laporan (regu_id kolom digunakan untuk kelas_id juga agar backward compat)
    await client.query(
      'INSERT INTO laporan_pramuka (regu_id, tanggal, deskripsi, file_url) VALUES ($1, $2, $3, $4)',
      [kelasOrRegu, tanggal, deskripsi || '', file_url || '']
    );
    // Simpan absensi
    for (const item of data_absensi) {
      const { siswa_id, nama_lengkap, status } = item;
      if (!siswa_id) continue;
      await client.query(
        `INSERT INTO absensi_pramuka (regu_id, siswa_id, tanggal, status, nama_lengkap, kelas_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (regu_id, siswa_id, tanggal) DO UPDATE
         SET status = EXCLUDED.status, nama_lengkap = EXCLUDED.nama_lengkap`,
        [kelasOrRegu, siswa_id, tanggal, status || 'Hadir', nama_lengkap || '', kelas_id || kelasOrRegu]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Absensi pramuka berhasil disimpan' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Riwayat absensi pramuka
exports.getAbsensiPramuka = async (req, res) => {
  const { regu_id, kelas_id, tanggal, tanggal_mulai, tanggal_akhir } = req.query;
  const kelasFilter = kelas_id || regu_id;
  try {
    let query = `
      SELECT ap.*, ap.nama_lengkap
      FROM absensi_pramuka ap
      WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (kelasFilter) { query += ` AND ap.regu_id = $${idx++}`; params.push(kelasFilter); }
    if (tanggal) { query += ` AND ap.tanggal = $${idx++}`; params.push(tanggal); }
    if (tanggal_mulai) { query += ` AND ap.tanggal >= $${idx++}`; params.push(tanggal_mulai); }
    if (tanggal_akhir) { query += ` AND ap.tanggal <= $${idx++}`; params.push(tanggal_akhir); }
    query += ' ORDER BY ap.tanggal DESC, ap.id ASC';
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── SILABUS PRAMUKA ───────────────────────────────────────────────────────

exports.getAllSilabus = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM silabus_pramuka ORDER BY tanggal DESC, id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createSilabus = async (req, res) => {
  const { tingkat_kelas, judul_kegiatan, tanggal } = req.body;
  let file_url = null;
  if (req.file) file_url = `/uploads/${req.file.filename}`;
  try {
    const result = await db.query(
      'INSERT INTO silabus_pramuka (tingkat_kelas, judul_kegiatan, tanggal, file_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [tingkat_kelas || null, judul_kegiatan, tanggal || new Date().toISOString().slice(0,10), file_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteSilabus = async (req, res) => {
  try {
    await db.query('DELETE FROM silabus_pramuka WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRegu = async (req, res) => {
  try {
    await db.query('DELETE FROM kelas_pramuka WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRekapAbsensiPramuka = async (req, res) => {
  const { tanggal_mulai, tanggal_akhir, regu_id } = req.query;
  try {
    let query = `
      SELECT
        ar.siswa_id, ar.nama_lengkap, k.nama_regu,
        COUNT(CASE WHEN ap.status = 'Hadir' THEN 1 END) AS hadir,
        COUNT(CASE WHEN ap.status = 'Izin'  THEN 1 END) AS izin,
        COUNT(CASE WHEN ap.status = 'Sakit' THEN 1 END) AS sakit,
        COUNT(CASE WHEN ap.status = 'Alpa'  THEN 1 END) AS alpa,
        COUNT(ap.id) AS total
      FROM anggota_regu ar
      JOIN kelas_pramuka k ON ar.regu_id = k.id
      LEFT JOIN absensi_pramuka ap ON ap.siswa_id = ar.siswa_id AND ap.regu_id = ar.regu_id
        AND ($2::DATE IS NULL OR ap.tanggal >= $2)
        AND ($3::DATE IS NULL OR ap.tanggal <= $3)
      WHERE 1=1
    `;
    const params = [null, tanggal_mulai || null, tanggal_akhir || null];
    let idx = 4;
    if (regu_id) { query += ` AND ar.regu_id = $${idx++}`; params.push(regu_id); params[0] = regu_id; }
    query += ' GROUP BY ar.siswa_id, ar.nama_lengkap, k.nama_regu ORDER BY k.nama_regu, ar.nama_lengkap';
    const result = await db.query(query, params.filter((_, i) => i !== 0 || regu_id));
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
