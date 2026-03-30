const express = require("express");
const router = express.Router();
const pklController = require("../controllers/pklController");
const proyekController = require("../controllers/proyekController");
const nilaiController = require("../controllers/nilaiController");
const extractIdentity = require("../middleware/extractIdentity");

// ============================================================
// STATISTIK DASHBOARD
// ============================================================
router.get("/statistik", extractIdentity, pklController.getStatistik);

// ============================================================
// PROGRAM KEAHLIAN
// ============================================================
router.get(
  "/program-keahlian",
  extractIdentity,
  pklController.getAllProgramKeahlian,
);

// ============================================================
// PKL SUBMISSIONS — CRUD Lengkap
// ============================================================
router.get("/pkl", extractIdentity, pklController.getAllPKL);
router.get("/pkl/:id", extractIdentity, pklController.getPKLById);
router.post("/pkl", extractIdentity, pklController.createPKL);
router.put("/pkl/:id", extractIdentity, pklController.updatePKL);
router.delete("/pkl/:id", extractIdentity, pklController.deletePKL);

// ============================================================
// VALIDASI / APPROVE PKL
// ============================================================
router.post("/approve", extractIdentity, pklController.approvePKL);

// ============================================================
// MONITORING PKL
// ============================================================
router.get("/monitoring", extractIdentity, pklController.getAllMonitoring);
router.post("/monitoring", extractIdentity, pklController.addMonitoring);

// ============================================================
// INPUT NILAI PKL
// ============================================================
router.post("/input-nilai", extractIdentity, pklController.inputNilai);

// ============================================================
// PROYEK VOKASI — CRUD Lengkap
// ============================================================
router.get("/proyek", extractIdentity, proyekController.getAllProyek);
router.get("/proyek/:id", extractIdentity, proyekController.getProyekById);
router.post("/proyek", extractIdentity, proyekController.createProyek);
router.put("/proyek/:id", extractIdentity, proyekController.updateProyek);
router.delete("/proyek/:id", extractIdentity, proyekController.deleteProyek);

// Anggota proyek
router.get(
  "/proyek/:id/anggota",
  extractIdentity,
  proyekController.getAnggotaProyek,
);
router.post(
  "/proyek/:id/anggota",
  extractIdentity,
  proyekController.addAnggotaProyek,
);
router.delete(
  "/proyek/anggota/:anggotaId",
  extractIdentity,
  proyekController.deleteAnggotaProyek,
);

// ============================================================
// NILAI KOMPETENSI KEJURUAN — CRUD Lengkap
// ============================================================
router.get("/nilai", extractIdentity, nilaiController.getAllNilai);
router.get("/nilai/:id", extractIdentity, nilaiController.getNilaiById);
router.post("/nilai", extractIdentity, nilaiController.createNilai);
router.put("/nilai/:id", extractIdentity, nilaiController.updateNilai);
router.delete("/nilai/:id", extractIdentity, nilaiController.deleteNilai);

module.exports = router;
