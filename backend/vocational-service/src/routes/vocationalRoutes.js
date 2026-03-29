const express = require("express");
const router = express.Router();
const vocationalController = require("../controllers/vocationalController");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

// ── REKAPITULASI PKL ──────────────────────────────────────────
router.get("/pkl", verifyToken, vocationalController.getAllPKL);
router.put(
  "/pkl/validate/:id",
  verifyToken,
  vocationalController.validateAndApprovePKL,
);

// ── MONITORING & PROGRES ──────────────────────────────────────
router.get(
  "/pkl/monitoring",
  verifyToken,
  vocationalController.getAllMonitoring,
);
router.post(
  "/pkl/monitoring",
  verifyToken,
  upload.single("dokumen"),
  vocationalController.createMonitoring,
);

// ── PENILAIAN PKL ──────────────────────────────────────────────
// PERBAIKAN: semua menggunakan vocationalController (bukan penilaianCtrl yang undefined)
router.get(
  "/penilaian/stats",
  verifyToken,
  vocationalController.getPenilaianStats,
);
router.post(
  "/penilaian/upsert",
  verifyToken,
  vocationalController.upsertPenilaian,
);
router.get(
  "/penilaian/:submission_id",
  verifyToken,
  vocationalController.getPenilaianById,
);

module.exports = router;
