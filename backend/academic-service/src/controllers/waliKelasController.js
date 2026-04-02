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
