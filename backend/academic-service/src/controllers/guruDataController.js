const pool = require('../config/db');

// Get All Guru
exports.getAllGuru = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM guru ORDER BY nama_lengkap ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Guru
exports.createGuru = async (req, res) => {
    const { nip, nama_lengkap, email, jabatan, mata_pelajaran, no_telepon } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO guru (nip, nama_lengkap, email, jabatan, mata_pelajaran, no_telepon)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nip, nama_lengkap, email || null, jabatan || null, mata_pelajaran || null, no_telepon || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'NIP sudah terdaftar' });
        }
        res.status(500).json({ error: err.message });
    }
};

// Update Guru
exports.updateGuru = async (req, res) => {
    const { id } = req.params;
    const { nip, nama_lengkap, email, jabatan, mata_pelajaran, no_telepon } = req.body;
    try {
        const result = await pool.query(
            `UPDATE guru SET nip=$1, nama_lengkap=$2, email=$3, jabatan=$4, mata_pelajaran=$5, no_telepon=$6
             WHERE id=$7 RETURNING *`,
            [nip, nama_lengkap, email || null, jabatan || null, mata_pelajaran || null, no_telepon || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Guru tidak ditemukan' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Guru
exports.deleteGuru = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM guru WHERE id = $1', [id]);
        res.json({ message: 'Guru berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
