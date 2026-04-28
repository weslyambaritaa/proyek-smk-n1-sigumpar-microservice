const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const extractIdentity = require("../middleware/extractIdentity");

// Kebersihan Kelas
router.get("/kebersihan", studentController.getKebersihan);
router.post("/kebersihan", extractIdentity, studentController.createKebersihan);
router.put(
  "/kebersihan/:id",
  extractIdentity,
  studentController.updateKebersihan,
);
router.delete(
  "/kebersihan/:id",
  extractIdentity,
  studentController.deleteKebersihan,
);

// Nilai Siswa
router.get("/nilai", extractIdentity, studentController.getNilaiSiswa);

router.post(
  "/nilai",
  extractIdentity,
  studentController.createOrUpdateNilaiSiswa,
);

router.get("/rekap-nilai", extractIdentity, studentController.getRekapNilai);

// Parenting
router.get("/parenting", studentController.getParenting);
router.post("/parenting", extractIdentity, studentController.createParenting);
router.put(
  "/parenting/:id",
  extractIdentity,
  studentController.updateParenting,
);
router.delete(
  "/parenting/:id",
  extractIdentity,
  studentController.deleteParenting,
);

// Refleksi Wali Kelas
router.get("/refleksi", studentController.getRefleksi);
router.post("/refleksi", extractIdentity, studentController.createRefleksi);
router.put("/refleksi/:id", extractIdentity, studentController.updateRefleksi);
router.delete(
  "/refleksi/:id",
  extractIdentity,
  studentController.deleteRefleksi,
);

// Surat Panggilan Siswa
router.get("/surat-panggilan", studentController.getSuratPanggilan);
router.post(
  "/surat-panggilan",
  extractIdentity,
  studentController.createSuratPanggilan,
);
router.put(
  "/surat-panggilan/:id",
  extractIdentity,
  studentController.updateSuratPanggilan,
);
router.delete(
  "/surat-panggilan/:id",
  extractIdentity,
  studentController.deleteSuratPanggilan,
);

// Rekap Kehadiran / Presensi
router.get(
  "/rekap-kehadiran",
  extractIdentity,
  studentController.getRekapKehadiran,
);

router.post(
  "/rekap-kehadiran",
  extractIdentity,
  studentController.createRekapKehadiran,
);

module.exports = router;
