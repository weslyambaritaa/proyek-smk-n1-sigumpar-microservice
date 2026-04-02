const pool = require('../config/db');

exports.getAllSiswa = async (req, res) => {
  try {
    const { kelas_id } = req.query;
    let query = `SELECT s.*, k.nama_kelas FROM siswa s LEFT JOIN kelas k ON s.kelas_id = k.id WHERE 1=1`;
    const params = [];
    if (kelas_id) { query += ` AND s.kelas_id = $1`; params.push(kelas_id); }
    query += ` ORDER BY s.nama_lengkap ASC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSiswa = async (req, res) => {
  const { nisn, nama_lengkap, kelas_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO siswa (nisn, nama_lengkap, kelas_id) VALUES ($1, $2, $3) RETURNING *',
      [nisn, nama_lengkap, kelas_id || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSiswa = async (req, res) => {
  const { id } = req.params;
  const { nisn, nama_lengkap, kelas_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE siswa SET nisn=$1, nama_lengkap=$2, kelas_id=$3 WHERE id=$4 RETURNING *',
      [nisn, nama_lengkap, kelas_id || null, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSiswa = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM siswa WHERE id=$1', [id]);
    res.json({ success: true, message: 'Siswa berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
