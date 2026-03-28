const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

const getAllUsers = async (req, res, next) => {
  try {
    const { kelas, search } = req.query;

    let query = `
      SELECT id, username, email, nis, kelas, created_at
      FROM users
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;

    if (kelas) {
      query += ` AND kelas = $${idx++}`;
      values.push(kelas);
    }

    if (search) {
      query += ` AND (
        LOWER(username) LIKE LOWER($${idx})
        OR LOWER(COALESCE(nis, '')) LIKE LOWER($${idx})
      )`;
      values.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, nis, kelas, created_at FROM users WHERE id = $1",
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

const createUser = async (req, res, next) => {
  const { id, username, email, nis, kelas } = req.body;

  try {
    if (!id || !username || !email) {
      throw createError(400, "id, username, dan email wajib diisi");
    }

    const result = await pool.query(
      `
      INSERT INTO users (id, username, email, nis, kelas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, nis, kelas, created_at
      `,
      [id, username, email, nis || null, kelas || null]
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

const updateUser = async (req, res, next) => {
  const { username, email, nis, kelas } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const currentUser = existing.rows[0];

    const result = await pool.query(
      `
      UPDATE users
      SET
        username = $1,
        email = $2,
        nis = $3,
        kelas = $4
      WHERE id = $5
      RETURNING id, username, email, nis, kelas, created_at
      `,
      [
        username || currentUser.username,
        email || currentUser.email,
        nis ?? currentUser.nis,
        kelas ?? currentUser.kelas,
        req.params.id,
      ]
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

const deleteUser = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, username, email, nis, kelas, created_at",
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