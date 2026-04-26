const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// ─── REKAP KEBERSIHAN KELAS ─────────────────────────────
router.get("/kebersihan", studentController.getKebersihan);
router.post("/kebersihan", studentController.createKebersihan);
router.put("/kebersihan/:id", studentController.updateKebersihan);
router.delete("/kebersihan/:id", studentController.deleteKebersihan);

// ─── CATATAN PARENTING ──────────────────────────────────
router.get("/parenting", studentController.getParenting);
router.post("/parenting", studentController.createParenting);
router.put("/parenting/:id", studentController.updateParenting);
router.delete("/parenting/:id", studentController.deleteParenting);

// ─── REFLEKSI WALI KELAS ────────────────────────────────
router.get("/refleksi", studentController.getRefleksi);
router.post("/refleksi", studentController.createRefleksi);
router.put("/refleksi/:id", studentController.updateRefleksi);
router.delete("/refleksi/:id", studentController.deleteRefleksi);

// ─── SURAT PANGGILAN SISWA ──────────────────────────────
router.get("/surat-panggilan", studentController.getSuratPanggilan);
router.post("/surat-panggilan", studentController.createSuratPanggilan);
router.put("/surat-panggilan/:id", studentController.updateSuratPanggilan);
router.delete("/surat-panggilan/:id", studentController.deleteSuratPanggilan);

// ─── REKAP KEHADIRAN SISWA ──────────────────────────────
router.get("/rekap-kehadiran", studentController.getRekapKehadiran);
router.post("/rekap-kehadiran", studentController.createRekapKehadiran);

// ─── REKAP NILAI SISWA ──────────────────────────────────
router.get("/rekap-nilai", studentController.getRekapNilai);

module.exports = router;
