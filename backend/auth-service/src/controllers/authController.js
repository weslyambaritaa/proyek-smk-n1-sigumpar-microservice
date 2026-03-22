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

const syncUserFromToken = async (userData) => {
  const { sub, preferred_username, name, email, role } = userData;
  
  // sub adalah ID unik dari Keycloak
  await pool.query(
    `INSERT INTO users (id, username, nama_lengkap, email, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
        nama_lengkap = EXCLUDED.nama_lengkap,
        role = EXCLUDED.role`,
    [sub, preferred_username, name, email, role]
  );
};

// EKSPOR HARUS JELAS
module.exports = {
    getAll,
    searchUsers,
    syncUserFromToken
};