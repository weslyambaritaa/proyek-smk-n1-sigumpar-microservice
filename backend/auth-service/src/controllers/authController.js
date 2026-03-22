const pool = require("../config/db"); // Pastikan path ke config db benar
const { createError } = require("../middleware/errorHandler");

/**
 * GET /api/auth
 * Mengambil semua data user (hanya untuk role tertentu/admin)
 */
const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, username, nama_lengkap, email, role FROM users ORDER BY id ASC"
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/users/search
 * Mencari user berdasarkan role dan nama (digunakan untuk auto-suggest Wali Kelas)
 * Query params: ?role=wali_kelas&q=nama_guru
 */
const searchUsers = async (req, res, next) => {
  const { q, role } = req.query;

  try {
    // Jika parameter tidak ada, kembalikan array kosong agar frontend tidak error
    if (!q || !role) {
      return res.json([]);
    }

    const result = await pool.query(
      "SELECT id, username, nama_lengkap, email FROM users WHERE role = $1 AND nama_lengkap ILIKE $2 LIMIT 10",
      [role, `%${q}%`]
    );
    
    res.json(result.rows);
  } catch (err) {
    // Menggunakan status 500 jika terjadi kesalahan database
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/auth/:id
 * Mengambil detail satu user berdasarkan ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, username, nama_lengkap, email, role FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      throw createError(404, `User dengan ID '${id}' tidak ditemukan`);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/auth/:id
 * Menghapus akun user
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, username",
      [id]
    );

    if (result.rows.length === 0) {
      throw createError(404, `User dengan ID '${id}' tidak ditemukan`);
    }

    res.json({
      success: true,
      message: "User berhasil dihapus",
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// Export semua fungsi controller
module.exports = {
  getAll,
  searchUsers,
  getUserById,
  deleteUser,
};