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
  const { nama_kelas, tingkat, wali_kelas_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO kelas (nama_kelas, tingkat, wali_kelas_id) VALUES ($1, $2, $3) RETURNING *',
      [nama_kelas, tingkat, wali_kelas_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateKelas = async (req, res) => {
    const { id } = req.params; 
    const { nama_kelas, tingkat, wali_kelas_id } = req.body;

    try {
        const result = await pool.query(
            "UPDATE kelas SET nama_kelas = $1, tingkat = $2, wali_kelas_id = $3 WHERE id = $4 RETURNING *",
            [nama_kelas, tingkat, wali_kelas_id || null, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Kelas tidak ditemukan" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteKelas = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM kelas WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};