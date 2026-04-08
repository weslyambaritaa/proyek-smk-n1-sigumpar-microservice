const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

/**
 * GET /users
 * Ambil semua user. Support query param:
 * - ?search=keyword  => filter username atau email
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM users';
  const params = [];

  if (search) {
    query += ' WHERE LOWER(username) LIKE $1 OR LOWER(email) LIKE $1';
    params.push(`%${search.toLowerCase()}%`);
  }

  query += ' ORDER BY created_at DESC';
  const result = await pool.query(query, params);
  res.json({ success: true, data: result.rows });
});

/**
 * GET /users/:id
 * Ambil satu user berdasarkan ID.
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!result.rows.length) throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * POST /users
 * Buat user baru. ID dikirim dari Keycloak.
 * Body: { id, username, email }
 */
exports.createUser = asyncHandler(async (req, res) => {
  const { id, username, email } = req.body;
  if (!id || !username || !email) throw createError(400, 'Field id, username, dan email wajib diisi');

  const result = await pool.query(
    'INSERT INTO users (id, username, email) VALUES ($1, $2, $3) RETURNING *',
    [id, username, email]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

/**
 * PUT /users/:id
 * Update username dan/atau email user.
 * Body: { username?, email? }
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  if (!username && !email) throw createError(400, 'Minimal satu field (username atau email) harus diisi');

  // Cek user ada
  const existing = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);

  // Cek duplikat email jika email diubah
  if (email && email !== existing.rows[0].email) {
    const emailCheck = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2', [email, req.params.id]);
    if (emailCheck.rows.length) throw createError(409, `Email '${email}' sudah digunakan user lain`);
  }

  const result = await pool.query(
    `UPDATE users
     SET username = COALESCE($1, username),
         email    = COALESCE($2, email)
     WHERE id = $3
     RETURNING *`,
    [username || null, email || null, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
});

/**
 * DELETE /users/:id
 * Hapus user berdasarkan ID.
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
  if (!result.rows.length) throw createError(404, `User dengan ID '${req.params.id}' tidak ditemukan`);
  res.json({ success: true, message: 'User berhasil dihapus', data: result.rows[0] });
});