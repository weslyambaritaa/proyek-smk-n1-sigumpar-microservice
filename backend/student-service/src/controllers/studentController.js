const { Op } = require('sequelize');
const { User } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/students — ambil semua user, support ?search=
const getAllUsers = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.search) {
    const kw = `%${req.query.search}%`;
    where[Op.or] = [
      { username: { [Op.iLike]: kw } },
      { email:    { [Op.iLike]: kw } },
    ];
  }
  const data = await User.findAll({ where, order: [['created_at', 'DESC']] });
  res.json({ success: true, data });
});

// GET /api/students/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
  res.json({ success: true, data: user });
});

// POST /api/students — id dikirim dari Keycloak
// Body: { id, username, email }
const createUser = asyncHandler(async (req, res) => {
  const { id, username, email } = req.body;
  if (!id || !username || !email) throw createError(400, 'Field id, username, dan email wajib diisi');

  const user = await User.create({ id, username, email });
  res.status(201).json({ success: true, data: user });
});

// PUT /api/students/:id — partial update username dan/atau email
exports.updateUser = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  if (!username && !email) throw createError(400, 'Minimal satu field (username atau email) harus diisi');

  const user = await User.findByPk(req.params.id);
  if (!user) throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);

  // Cek duplikat email jika email diubah
  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email: { [Op.iLike]: email } } });
    if (existing) throw createError(409, `Email '${email}' sudah digunakan user lain`);
  }

  await user.update({
    ...(username && { username }),
    ...(email    && { email }),
  });
  res.json({ success: true, data: user });
});

// DELETE /api/students/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
  await user.destroy();
  res.json({ success: true, message: 'User berhasil dihapus', data: user });
});