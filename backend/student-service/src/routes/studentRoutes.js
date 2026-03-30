const express = require("express");
const extractIdentity = require("../middleware/extractIdentity");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/studentController");

// Route untuk koleksi (tanpa ID)
router.route("/").get(extractIdentity, getAllUsers).post(extractIdentity, createUser);

// Route untuk satu resource (dengan ID)
router.route("/:id").get(extractIdentity, getUserById).put(extractIdentity, updateUser).delete(extractIdentity, deleteUser);

module.exports = router;
