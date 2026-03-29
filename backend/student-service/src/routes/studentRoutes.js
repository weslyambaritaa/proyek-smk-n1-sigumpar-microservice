const express = require("express");
<<<<<<< Updated upstream
const verifyToken = require("../middleware/auth");
=======
const { verifyToken } = require("../middleware/auth"); // Import middleware
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
router.route("/:id")
  .get(verifyToken, getUserById)
  .put(verifyToken, updateUser)
  .delete(verifyToken, deleteUser);

module.exports = router;
=======
// Route untuk koleksi (tanpa ID)
router.route("/").get(getAllUsers).post(createUser);

// Route untuk satu resource (dengan ID)
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
>>>>>>> Stashed changes
