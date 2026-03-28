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

// --- KONTROLLER SISWA ---
// Get All Siswa with Kelas Info
exports.getAllSiswa = async (req, res) => {
    try {
        const result = await pool.query(`
    SELECT s.*, k.nama_kelas 
    FROM siswa s 
    LEFT JOIN kelas k ON s.kelas_id = k.id 
    ORDER BY s.id DESC
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
            "INSERT INTO siswa (nisn, nama_lengkap, kelas_id) VALUES ($1, $2, $3) RETURNING *",
            [nisn, nama_lengkap, kelas_id]
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
            [nisn, nama_lengkap, kelas_id, id]
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

// ==========================================
// --- KONTROLLER PENGUMUMAN ---
// ==========================================

// Get All Pengumuman
exports.getAllPengumuman = async (req, res) => {
    try {
        // Mengambil data pengumuman dan mengurutkannya dari yang paling baru
        const result = await pool.query('SELECT * FROM pengumuman ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Pengumuman
exports.createPengumuman = async (req, res) => {
    const { judul, isi } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO pengumuman (judul, isi) VALUES ($1, $2) RETURNING *",
            [judul, isi]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Pengumuman
exports.updatePengumuman = async (req, res) => {
    const { id } = req.params;
    const { judul, isi } = req.body;
    try {
        const result = await pool.query(
            "UPDATE pengumuman SET judul = $1, isi = $2 WHERE id = $3 RETURNING *",
            [judul, isi, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Pengumuman tidak ditemukan" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Pengumuman
exports.deletePengumuman = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM pengumuman WHERE id = $1", [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Pengumuman tidak ditemukan" });
        }

        res.json({ message: "Pengumuman berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};