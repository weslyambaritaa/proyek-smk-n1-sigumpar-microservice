const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const extractIdentity = require("../middleware/extractIdentity");
const ctrl = require("../controllers/learningController");
const rekapCtrl = require("../controllers/rekapPerangkatController");

// ---- Perangkat Pembelajaran (Guru) ----
router.get("/perangkat", verifyToken, ctrl.getAllPerangkat);
router.post("/perangkat", verifyToken, ctrl.uploadPerangkat);
router.get("/perangkat/:id/download", verifyToken, ctrl.downloadPerangkat);
router.delete("/perangkat/:id", verifyToken, ctrl.deletePerangkat);

// ---- Nilai Siswa (Guru) ----
router.get("/nilai", verifyToken, ctrl.getNilai);
router.post("/nilai/batch", verifyToken, ctrl.saveNilaiBatch);

// ---- Rekap Perangkat (Kepala Sekolah) ----
router.get("/rekap-perangkat", extractIdentity, rekapCtrl.getAllPerangkat);
router.get(
  "/rekap-perangkat/:id/download",
  extractIdentity,
  rekapCtrl.downloadPerangkat,
);
router.put(
  "/rekap-perangkat/:id/approve",
  extractIdentity,
  rekapCtrl.approvePerangkat,
);
router.put(
  "/rekap-perangkat/:id/reject",
  extractIdentity,
  rekapCtrl.rejectPerangkat,
);

module.exports = router;
