const express = require("express");
const router = express.Router();
const vocationalController = require("../controllers/vocationalController");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

// Rute PKL
router.get("/pkl", verifyToken, vocationalController.getAllPKL);
router.put(
  "/pkl/validate/:id",
  verifyToken,
  vocationalController.validateAndApprovePKL,
);

// Rute Monitoring (Include Progres + Upload)
router.post(
  "/pkl/monitoring",
  verifyToken,
  upload.single("dokumen"),
  vocationalController.createMonitoring,
);

// Rute Penilaian PKL
router.get("/penilaian/stats", verifyToken, penilaianCtrl.getPenilaianStats);
router.post("/penilaian/upsert", verifyToken, penilaianCtrl.upsertPenilaian);

module.exports = router;
