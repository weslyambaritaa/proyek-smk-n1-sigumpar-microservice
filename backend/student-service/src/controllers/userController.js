const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { createError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");
const pool = require('../config/db');

const DATA_FILE = path.join(__dirname, "../data/users.json");

const readUsers = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeUsers = (users) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");

/**
 * GET /users
 * Mengambil semua data user dari database.
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  res.status(200).json({ status: 'success', data: result.rows });
});

/**
 * GET /users/:id
 * Mengambil satu user berdasarkan ID.
 */
const getUserById = asyncHandler((req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
  }

  res.json({ success: true, data: user });
});

/**
 * POST /users
 * Membuat user baru dari data Keycloak/Frontend.
 */
exports.createUser = asyncHandler(async (req, res) => {
  const { id, username, email } = req.body;
  const result = await pool.query(
    'INSERT INTO users (id, username, email) VALUES ($1, $2, $3) RETURNING *',
    [id, username, email]
  );
  res.status(201).json({ status: 'success', data: result.rows[0] });
});

/**
 * PUT /users/:id
 * Mengupdate data user berdasarkan ID (partial update).
 */
const updateUser = asyncHandler((req, res) => {
  const { name, email, role } = req.body;
  const users = readUsers();

  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
  }

  if (email && email !== users[index].email) {
    const emailExists = users.some(
      (u, i) => i !== index && u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      throw createError(409, `Email '${email}' sudah digunakan user lain`);
    }
  }

  users[index] = {
    ...users[index],
    ...(name && { name: name.trim() }),
    ...(email && { email: email.toLowerCase().trim() }),
    ...(role && { role }),
    updatedAt: new Date().toISOString(),
  };

  writeUsers(users);
  res.json({ success: true, data: users[index] });
});

/**
 * DELETE /users/:id
 * Menghapus user berdasarkan ID.
 */
const deleteUser = asyncHandler((req, res) => {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
  }

  const deleted = users.splice(index, 1)[0];
  writeUsers(users);

  res.json({ success: true, message: "User berhasil dihapus", data: deleted });
});

module.exports = { getAllUsers: exports.getAllUsers, getUserById, createUser: exports.createUser, updateUser, deleteUser };