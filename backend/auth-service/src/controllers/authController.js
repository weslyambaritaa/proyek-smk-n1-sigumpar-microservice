const pool = require("../config/db");

// 1. Fungsi Ambil Semua
const getAll = async (req, res, next) => {
    try {
        const result = await pool.query("SELECT id, username, nama_lengkap, email, role FROM users ORDER BY id ASC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// 2. Fungsi Cari Wali Kelas
const searchUsers = async (req, res, next) => {
    const { q, role } = req.query;
    try {
        if (!q || !role) return res.json([]);
        const result = await pool.query(
            "SELECT id, nama_lengkap FROM users WHERE role = $1 AND nama_lengkap ILIKE $2 LIMIT 10",
            [role, `%${q}%`]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// EKSPOR HARUS JELAS
module.exports = {
    getAll,
    searchUsers
};