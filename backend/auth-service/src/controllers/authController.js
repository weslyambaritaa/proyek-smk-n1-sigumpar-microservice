const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const path = require("path");
const { createError } = require("../middleware/errorHandler");

const DATA_FILE = path.join(__dirname, "../data/users.json");

const readUsers = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
};

const ALLOWED_ROLES = [
  "admin",
  "guru",
  "tatausaha",
  "kepsek",
  "wakasek",
  "walikelas",
  "pramuka",
];

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw createError(400, "Username dan password wajib diisi");
    }

    const users = await readUsers();
    const user = users.find((u) => u.username === username);
    if (!user) {
      throw createError(401, "Username atau password salah");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw createError(401, "Username atau password salah");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const users = await readUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) {
      throw createError(404, "User tidak ditemukan");
    }
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.json({ success: true, message: "Logout berhasil" });
};

// Endpoint admin untuk membuat user baru (memerlukan token admin)
const adminCreateUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !password) {
      throw createError(400, "Name, username, password wajib diisi");
    }
    if (username.length < 3)
      throw createError(400, "Username minimal 3 karakter");
    if (password.length < 6)
      throw createError(400, "Password minimal 6 karakter");
    if (!ALLOWED_ROLES.includes(role)) {
      throw createError(
        400,
        `Role tidak valid. Gunakan salah satu: ${ALLOWED_ROLES.join(", ")}`,
      );
    }

    const users = await readUsers();
    if (users.find((u) => u.username === username)) {
      throw createError(409, "Username sudah digunakan");
    }
    if (email && users.find((u) => u.email === email)) {
      throw createError(409, "Email sudah digunakan");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      username,
      email: email || null,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeUsers(users);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  me,
  logout,
  adminCreateUser,
  readUsers,
  writeUsers,
};
