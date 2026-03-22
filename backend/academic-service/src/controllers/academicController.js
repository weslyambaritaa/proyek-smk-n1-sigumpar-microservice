const pool = require('../config/db');

// --- KONTROLLER KELAS ---
exports.getAllKelas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kelas ORDER BY tingkat, nama_kelas');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createKelas = async (req, res) => {
  const { nama_kelas, tingkat } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO kelas (nama_kelas, tingkat) VALUES ($1, $2) RETURNING *',
      [nama_kelas, tingkat]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- KONTROLLER SISWA ---
exports.getAllSiswa = async (req, res) => {
  try {
    // Join dengan tabel kelas untuk mendapatkan nama kelasnya langsung
    const query = `
       diplomacy SELECT s.*, k.nama_kelas, k.tingkat 
      FROM siswa s 
      LEFT JOIN kelas k ON s.kelas_id = k.id 
      ORDER BY s.nama_lengkap ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSiswa = async (req, res) => {
  const { nisn, nama_lengkap, kelas_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO siswa (nisn, nama_lengkap, kelas_id) VALUES ($1, $2, $3) RETURNING *',
      [nisn, nama_lengkap, kelas_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Error code untuk Unique Violation (NISN sudah ada)
      return res.status(400).json({ message: "NISN sudah terdaftar" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSiswa = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM siswa WHERE id = $1', [id]);
    res.json({ message: "Data siswa berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};