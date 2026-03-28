const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

/**
 * GET /api/students
 * Ambil semua user/student
 */
const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id
 * Ambil satu user berdasarkan ID
 */
const getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students
 * Buat user baru
 */
const createUser = async (req, res, next) => {
  const { id, username, email } = req.body;

  try {
    if (!id || !username || !email) {
      throw createError(400, "id, username, dan email wajib diisi");
    }

    const result = await pool.query(
      "INSERT INTO users (id, username, email) VALUES ($1, $2, $3) RETURNING *",
      [id, username, email]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return next(createError(409, "ID atau email sudah terdaftar"));
    }
    next(err);
  }
};

/**
 * PUT /api/students/:id
 * Update user
 */
const updateUser = async (req, res, next) => {
  const { username, email } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const currentUser = existing.rows[0];
    const updatedUsername = username || currentUser.username;
    const updatedEmail = email || currentUser.email;

    const result = await pool.query(
      `
      UPDATE users
      SET username = $1, email = $2
      WHERE id = $3
      RETURNING *
      `,
      [updatedUsername, updatedEmail, req.params.id]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return next(createError(409, "Email sudah digunakan user lain"));
    }
    next(err);
  }
};

/**
 * DELETE /api/students/:id
 * Hapus user
 */
const deleteUser = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus",
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};