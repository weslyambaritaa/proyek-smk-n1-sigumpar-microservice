const pool = require("../config/db");

// --- KONTROLLER SISWA ---
// Get All Siswa with Kelas Info
exports.getAllSiswa = async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT 
        s.id_siswa AS id, 
        s.NIS AS nisn, 
        s.namaSiswa AS nama_lengkap, 
        s.id_kelas AS kelas_id, 
        k.nama_kelas 
    FROM siswa s 
    LEFT JOIN kelas k ON s.id_kelas = k.id 
    ORDER BY s.id_siswa DESC
`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Siswa
exports.createSiswa = async (req, res) => {
  const { nisn, nama_lengkap, kelas_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO siswa (NIS, namaSiswa, id_kelas) VALUES ($1, $2, $3) RETURNING *",
      [nisn, nama_lengkap, kelas_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Siswa
exports.updateSiswa = async (req, res) => {
  const { id } = req.params;
  const { nisn, nama_lengkap, kelas_id } = req.body;
  try {
    const result = await pool.query(
      "UPDATE siswa SET nisn = $1, nama_lengkap = $2, kelas_id = $3 WHERE id = $4 RETURNING *",
      [nisn, nama_lengkap, kelas_id, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Siswa
exports.deleteSiswa = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM siswa WHERE id = $1", [id]);
    res.json({ message: "Siswa berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
