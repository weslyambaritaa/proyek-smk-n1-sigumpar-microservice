const express = require("express");
const router = express.Router();

const { verifikasiToken } = require("../middleware/authMiddleware");
const { getKelas } = require("../controllers/kelasController");

router.get("/", verifikasiToken, getKelas);

module.exports = router;