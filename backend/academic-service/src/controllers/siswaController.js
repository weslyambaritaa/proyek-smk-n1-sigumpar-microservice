const pool = require('../config/db');

// =============================================
// SISWA CONTROLLER
// Kolom DB: id_siswa (UUID), id_kelas (INTEGER), namaSiswa, NIS
// =============================================

// GET semua siswa beserta nama kelas
exports.getAllSiswa = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id_siswa,
        s."NIS"        AS nisn,
        s."namaSiswa"  AS nama_lengkap,
        s.id_kelas     AS kelas_id,
        k.nama_kelas,
        s.created_at,
        s.updated_at
      FROM siswa s
      LEFT JOIN kelas k ON s.id_kelas = k.id
      ORDER BY s."namaSiswa" ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error getAllSiswa:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST buat siswa baru
exports.createSiswa = async (req, res) => {
  // Terima nama_lengkap/nisn (dari frontend) ATAU namaSiswa/NIS (raw)
  const nama = req.body.nama_lengkap ?? req.body.namaSiswa;
  const nis  = req.body.nisn        ?? req.body.NIS;
  const { kelas_id, id_kelas } = req.body;
  const kelasId = kelas_id ?? id_kelas;

  if (!nama || !nis || !kelasId) {
    return res.status(400).json({
      success: false,
      message: 'nama_lengkap, nisn, dan kelas_id wajib diisi',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO siswa ("namaSiswa", "NIS", id_kelas)
       VALUES ($1, $2, $3)
       RETURNING id_siswa, "namaSiswa" AS nama_lengkap, "NIS" AS nisn, id_kelas AS kelas_id`,
      [nama, nis, kelasId]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error createSiswa:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT update siswa
exports.updateSiswa = async (req, res) => {
  const { id } = req.params;
  const nama = req.body.nama_lengkap ?? req.body.namaSiswa;
  const nis  = req.body.nisn        ?? req.body.NIS;
  const { kelas_id, id_kelas } = req.body;
  const kelasId = kelas_id ?? id_kelas;

  try {
    const result = await pool.query(
      `UPDATE siswa
       SET "namaSiswa" = $1, "NIS" = $2, id_kelas = $3, updated_at = NOW()
       WHERE id_siswa = $4
       RETURNING id_siswa, "namaSiswa" AS nama_lengkap, "NIS" AS nisn, id_kelas AS kelas_id`,
      [nama, nis, kelasId, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updateSiswa:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE siswa
exports.deleteSiswa = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM siswa WHERE id_siswa = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }
    res.json({ success: true, message: 'Siswa berhasil dihapus' });
  } catch (err) {
    console.error('Error deleteSiswa:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
