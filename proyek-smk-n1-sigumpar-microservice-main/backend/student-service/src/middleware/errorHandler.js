/**
 * Middleware: Global Error Handler
 *
 * Menangani semua error yang di-throw dengan next(error).
 * Dipasang di akhir chain middleware Express.
 *
 * @param {Error} err   - Objek error yang diterima
 * @param {Request} req  - Objek request Express
 * @param {Response} res - Objek response Express
 * @param {Function} next - Fungsi next (wajib ada agar Express tahu ini error handler)
 */
const errorHandler = (err, req, res, next) => {
  // Log error ke console untuk debugging
  console.error(`[ERROR] ${err.message}`);

  // Gunakan status code dari error jika ada, default ke 500
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Hanya tampilkan stack trace di environment development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Helper: Membuat error dengan status code custom
 *
 * Contoh penggunaan:
 *   throw createError(404, "User tidak ditemukan");
 *
 * @param {number} statusCode - HTTP status code
 * @param {string} message    - Pesan error
 * @returns {Error}
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { errorHandler, createError };