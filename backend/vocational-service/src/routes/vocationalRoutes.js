const express = require("express");
const verifyToken = require('../middleware/auth'); // Import middleware
const router = express.Router();
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/vocationalController");

/**
 * Routes untuk resource /todos
 *
 * GET    /todos       => Ambil semua todos (support filter via query params)
 * POST   /todos       => Buat todo baru
 * GET    /todos/:id   => Ambil todo tertentu
 * PUT    /todos/:id   => Update todo tertentu
 * DELETE /todos/:id   => Hapus todo tertentu
 */

router.route("/").get(getAllTodos).post(createTodo);
router.route("/:id").get(getTodoById).put(updateTodo).delete(deleteTodo);

// Tambahkan verifyToken sebelum memanggil fungsi controller
router.get('/', verifyToken, controller.getAll);
router.post('/', verifyToken, controller.create);

module.exports = router;