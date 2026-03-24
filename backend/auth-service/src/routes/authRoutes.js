const express = require("express");
const {
  login,
  me,
  logout,
  adminCreateUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);
router.post(
  "/admin/create-user",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminCreateUser,
);

module.exports = router;
