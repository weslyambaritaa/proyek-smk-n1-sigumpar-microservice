const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { createError } = require("../middleware/errorHandler");
const pool = require('../config/db');

// Path absolut ke file data JSON
const DATA_FILE = path.join(__dirname, "../data/users.json");

/**
 * Helper: Membaca semua data user dari file JSON
 * Menggunakan fs.readFileSync karena operasi ini singkat dan
 * tidak perlu async di lingkup microservice sederhana ini.
 *
 * @returns {Array} Array objek user
 */
const readUsers = () => {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
};

/**
 * Helper: Menyimpan array user ke file JSON
 *
 * @param {Array} users - Array objek user yang akan disimpan
 */
const writeUsers = (users) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
};

/**
 * GET /users
 * Mengambil semua data user dengan dukungan query params:
 * - ?search=keyword  => filter berdasarkan nama atau email
 * - ?role=admin      => filter berdasarkan role
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /users/:id
 * Mengambil satu user berdasarkan ID.
 * Melempar 404 jika tidak ditemukan.
 */
const getUserById = (req, res, next) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      // Lempar error custom dengan status 404
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /users
 * Membuat user baru.
 * Melakukan validasi input sebelum menyimpan.
 *
 * Body yang diharapkan:
 * {
 *   "name": "string (wajib)",
 *   "email": "string (wajib, unik)",
 *   "role": "admin | user (opsional, default: user)"
 * }
 */
exports.createUser = async (req, res, next) => {
  const { id, username, email } = req.body; // id dikirim dari Keycloak/Frontend
  try {
    const result = await pool.query(
      'INSERT INTO users (id, username, email) VALUES ($1, $2, $3) RETURNING *',
      [id, username, email]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /users/:id
 * Mengupdate data user berdasarkan ID.
 * Hanya field yang dikirim yang akan diupdate (partial update).
 */
const updateUser = (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const users = readUsers();

    // Cari index user untuk memudahkan update
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    // Jika email diubah, cek duplikasi dengan user lain
    if (email && email !== users[index].email) {
      const emailExists = users.some(
        (u, i) => i !== index && u.email.toLowerCase() === email.toLowerCase()
      );
      if (emailExists) {
        throw createError(409, `Email '${email}' sudah digunakan user lain`);
      }
    }

    // Gabungkan data lama dengan perubahan baru (spread operator)
    users[index] = {
      ...users[index],
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(role && { role }),
      updatedAt: new Date().toISOString(), // Selalu update timestamp
    };

    writeUsers(users);
    res.json({ success: true, data: users[index] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /users/:id
 * Menghapus user berdasarkan ID.
 */
const deleteUser = (req, res, next) => {
  try {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === req.params.id);

    if (index === -1) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    // Hapus user dari array menggunakan splice
    const deleted = users.splice(index, 1)[0];
    writeUsers(users);

    res.json({
      success: true,
      message: "User berhasil dihapus",
      data: deleted,
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