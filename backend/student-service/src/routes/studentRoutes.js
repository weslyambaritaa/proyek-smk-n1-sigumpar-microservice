const express = require("express");
const verifyToken = require('../middleware/auth'); // Import middleware
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/studentController");

/**
 * Routes untuk resource /users
 *
 * Mengikuti konvensi RESTful API:
 * GET    /users       => Ambil semua users
 * POST   /users       => Buat user baru
 * GET    /users/:id   => Ambil user tertentu
 * PUT    /users/:id   => Update user tertentu
 * DELETE /users/:id   => Hapus user tertentu
 */

// Route untuk koleksi (tanpa ID)
router.route("/").get(getAllUsers).post(createUser);

// Route untuk satu resource (dengan ID)
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

// Tambahkan verifyToken sebelum memanggil fungsi controller
router.get('/', verifyToken, controller.getAll);
router.post('/', verifyToken, controller.create);

module.exports = router;