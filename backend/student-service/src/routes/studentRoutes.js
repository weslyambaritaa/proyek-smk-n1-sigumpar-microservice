const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/studentController");

router.route("/")
  .get(verifyToken, getAllUsers)
  .post(verifyToken, createUser);

router.route("/:id")
  .get(verifyToken, getUserById)
  .put(verifyToken, updateUser)
  .delete(verifyToken, deleteUser);

module.exports = router;