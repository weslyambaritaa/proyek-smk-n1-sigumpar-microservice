const express = require("express");
const { verifyToken } = require("../middleware/auth"); // Import middleware
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

// Route untuk koleksi (tanpa ID)
router.route("/").get(getAllUsers).post(createUser);

// Route untuk satu resource (dengan ID)
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
