const pool = require("../config/db");

// 1. Ambil Semua User dari Keycloak
const getAll = async (req, res, next) => {
    try {
        // Keycloak menyimpan data user di tabel "user_entity"
        const result = await pool.query("SELECT id, username, email FROM user_entity ORDER BY username ASC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// 2. Pencarian Wali Kelas dari Keycloak
const searchUsers = async (req, res, next) => {
    const { q } = req.query;
    try {
        if (!q) return res.json([]);
        
        // Cari berdasarkan username di tabel user_entity
        const result = await pool.query(
            "SELECT id, username AS nama_lengkap FROM user_entity WHERE username ILIKE $1 LIMIT 10",
            [`%${q}%`]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Fungsi Sinkronisasi (Dikosongkan)
// Karena kita sudah membaca langsung dari Keycloak DB, 
// kita tidak perlu lagi menyimpan ulang datanya saat user login.
const syncUserFromToken = async (userData) => {
    // Tidak melakukan apa-apa
    return true; 
};

module.exports = {
    getAll,
    searchUsers,
    syncUserFromToken
};