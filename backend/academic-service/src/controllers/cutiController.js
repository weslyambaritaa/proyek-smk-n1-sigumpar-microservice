const pool = require('../config/db');

// ─── CUTI GURU ─────────────────────────────────────────────────────────────
exports.getAllCuti = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, g.nama_lengkap as nama_guru
      FROM cuti_guru c
      LEFT JOIN guru g ON c.guru_id = g.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createCuti = async (req, res) => {
  const { guru_id, jenis_cuti, tanggal_mulai, tanggal_selesai, alasan } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cuti_guru (guru_id, jenis_cuti, tanggal_mulai, tanggal_selesai, alasan) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [guru_id, jenis_cuti, tanggal_mulai, tanggal_selesai, alasan]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateCuti = async (req, res) => {
  const { id } = req.params;
  const { status, approved_by } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cuti_guru SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, approved_by, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cuti not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteCuti = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cuti_guru WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cuti not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};