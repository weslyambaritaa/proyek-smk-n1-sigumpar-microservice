const express = require("express");
const router = express.Router();
const vocationalController = require("../controllers/vocationalController");
const { extractIdentity } = require("../middleware/extractIdentity");

// Semua rute ini memerlukan login (middleware extractIdentity)
router.post("/approve", extractIdentity, vocationalController.approvePKL);
router.post(
  "/monitoring",
  extractIdentity,
  vocationalController.updateMonitoring,
);
router.post(
  "/input-nilai",
  extractIdentity,
  vocationalController.inputNilaiPKL,
);

module.exports = router;
