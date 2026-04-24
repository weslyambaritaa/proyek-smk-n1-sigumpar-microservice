const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authController = require("../controllers/authController");

// ========================================================
// RUTE VERIFIKASI UNTUK NGINX / API GATEWAY
// ========================================================
router.get("/verify", verifyToken, (req, res) => {
  try {
    const user = req.user || {};
    const userId = user.id || user.sub || "unknown_id";
    const userRole = user.role || "user";

    res.setHeader("X-User-Id", userId);
    res.setHeader("X-User-Role", userRole);

    res.status(200).send("OK");
  } catch (err) {
    console.error("Error in /verify route:", err);
    res.status(500).json({ message: "Verification Failed" });
  }
});

// ========================================================
// RUTE USER GENERAL
// ========================================================
// Semua user, bisa filter: /api/auth?role=wali-kelas
router.get("/", verifyToken, authController.getAll);

// Search user, bisa filter: /api/auth/users/search?q=nama&role=wali-kelas
router.get("/users/search", verifyToken, authController.searchUsers);

module.exports = router;
