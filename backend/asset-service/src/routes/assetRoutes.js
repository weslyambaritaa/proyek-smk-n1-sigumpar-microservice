const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();

const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/assetController");

router.route("/")
  .get(verifyToken, getAllTodos)
  .post(verifyToken, createTodo);

router.route("/:id")
  .get(verifyToken, getTodoById)
  .put(verifyToken, updateTodo)
  .delete(verifyToken, deleteTodo);

module.exports = router;