const fs = require("fs");
const path = require("path");
const { createError } = require("../middleware/errorHandler");
const pool = require("../config/db");

const DATA_FILE = path.join(__dirname, "../data/users.json");
const SISWA_FILE = path.join(__dirname, "../data/siswa.json");

const readUsers = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw || "[]");
};

const writeUsers = (users) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
    next(err);
  }
};

const getUserById = (req, res, next) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const { id, username, email } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO users (id, username, email) VALUES ($1, $2, $3) RETURNING *",
      [id, username, email]
    );
    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateUser = (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

const deleteUser = (req, res, next) => {
  try {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === req.params.id);

    if (index === -1) {
      throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
    }

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