const pool = require('../config/db');

const getAll = (table) => async (_req, res) => {
  const result = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
  res.json({ success: true, data: result.rows });
};
const create = (table, fields) => async (req, res) => {
  const values = fields.map((f) => req.body[f] || null);
  const cols = [...fields, 'tanggal'];
  const finalValues = [...values, req.body.tanggal || new Date().toISOString().slice(0,10)];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const result = await pool.query(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`, finalValues);
  res.status(201).json({ success: true, data: result.rows[0] });
};

module.exports = {
  getParenting: getAll('parenting_log'),
  createParenting: create('parenting_log', ['siswa_nama', 'topik', 'catatan']),
  getKebersihan: getAll('kebersihan_kelas'),
  createKebersihan: create('kebersihan_kelas', ['area', 'status', 'catatan']),
  getRefleksi: getAll('refleksi_wali_kelas'),
  createRefleksi: create('refleksi_wali_kelas', ['judul', 'isi']),
};
