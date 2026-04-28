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

// Nilai Siswa
router.get(
  "/nilai/assignments",
  extractIdentity,
  studentController.getGuruMapelAssignments,
);

router.get(
  "/nilai/siswa",
  extractIdentity,
  studentController.getSiswaUntukInputNilai,
);

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

// Absensi siswa oleh guru-mapel berdasarkan jadwal mengajar
router.get(
  "/absensi-mapel/jadwal",
  extractIdentity,
  studentController.getAbsensiMapelJadwal,
);

router.get(
  "/absensi-mapel/assignments",
  extractIdentity,
  studentController.getAbsensiMapelAssignments,
);

router.get(
  "/absensi-mapel/siswa",
  extractIdentity,
  studentController.getAbsensiMapelSiswa,
);

router.get(
  "/absensi-mapel",
  extractIdentity,
  studentController.getAbsensiMapel,
);

router.post(
  "/absensi-mapel",
  extractIdentity,
  studentController.createAbsensiMapel,
);

router.get(
  "/absensi-mapel/rekap",
  extractIdentity,
  studentController.getRekapAbsensiMapel,
);

router.get(
  "/kepala-sekolah/rekap-absensi",
  studentController.getRekapAbsensiKepalaSekolah,
);

module.exports = router;
