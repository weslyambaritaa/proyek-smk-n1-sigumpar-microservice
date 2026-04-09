const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

/**
 * Global Error Handler — ditaruh paling akhir di app.use()
 * Menangani semua error dari controller secara terpusat.
 * Controller TIDAK perlu res.status(500) sendiri-sendiri — cukup next(err).
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // ── Sequelize: Validasi model gagal ──────────────────────────────────────
  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors: messages });
  }

  // ── Sequelize: Data duplikat (unique constraint) ──────────────────────────
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ success: false, message: 'Data sudah ada / duplikat', errors: err.errors.map((e) => e.message) });
  }

  // ── Sequelize: Foreign key tidak valid ────────────────────────────────────
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ success: false, message: 'Referensi data tidak valid (foreign key)' });
  }

  // ── Error custom (dibuat via createError) ─────────────────────────────────
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Membuat error dengan statusCode agar ditangkap errorHandler dengan status yang tepat.
 * Contoh: throw createError(404, 'Siswa tidak ditemukan');
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { errorHandler, createError };