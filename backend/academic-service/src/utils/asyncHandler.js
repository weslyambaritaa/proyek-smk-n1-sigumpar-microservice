/**
 * Membungkus fungsi async controller sehingga setiap error otomatis
 * diteruskan ke Express global error handler (next(err)).
 * Menghilangkan kebutuhan try-catch berulang di setiap controller.
 *
 * Penggunaan:
 *   exports.getAll = asyncHandler(async (req, res) => { ... });
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;