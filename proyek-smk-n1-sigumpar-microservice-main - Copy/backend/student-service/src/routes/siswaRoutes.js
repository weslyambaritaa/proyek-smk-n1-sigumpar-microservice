const express = require("express");
const router = express.Router();

const { verifikasiToken } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

/**
 * Routes untuk resource Students (via /api/students)
 */

// Route untuk koleksi (GET all, POST new)
router.route("/")
  .get(verifikasiToken, getAllUsers)
  .post(verifikasiToken, createUser);

// Route untuk resource spesifik (GET one, PUT update, DELETE)
router.route("/:id")
  .get(verifikasiToken, getUserById)
  .put(verifikasiToken, updateUser)
  .delete(verifikasiToken, deleteUser);

module.exports = router;