const express = require("express");

// ===== Controller Absensi Siswa (destructuring) =====
const {
  createAbsensiSiswa,
  getAllAbsensiSiswa,
  getAbsensiSiswaById,
  updateAbsensiSiswa,
  deleteAbsensiSiswa,
} = require("../controllers/absensiSiswaController");

// ===== Controller Lain =====
const arsipSuratController = require("../controllers/arsipSuratController");
const kelasController = require("../controllers/kelasController");
const pengumumanController = require("../controllers/pengumumanController");
const siswaController = require("../controllers/siswaController");
const mapelController = require("../controllers/mapelController");
const jadwalController = require("../controllers/jadwalController");
const piketController = require("../controllers/piketController");
const upacaraController = require("../controllers/upacaraController");
const guruController = require("../controllers/guruController");

// ===== Middleware =====
const extractIdentity = require("../middleware/extractIdentity");
const upload = require("../middleware/upload");

const router = express.Router();

// ==============================================
// Rute Absensi Siswa (menggunakan extractIdentity)
// ==============================================
router.post("/absensi-siswa", extractIdentity, createAbsensiSiswa);
router.get("/absensi-siswa", extractIdentity, getAllAbsensiSiswa);
router.get("/absensi-siswa/:id", extractIdentity, getAbsensiSiswaById);
router.put("/absensi-siswa/:id", extractIdentity, updateAbsensiSiswa);
router.delete("/absensi-siswa/:id", extractIdentity, deleteAbsensiSiswa);

// ==============================================
// Rute Kelas
// ==============================================
router.get("/kelas", extractIdentity, kelasController.getAllKelas);
router.post("/kelas", extractIdentity, kelasController.createKelas);
router.put("/kelas/:id", extractIdentity, kelasController.updateKelas);
router.delete("/kelas/:id", extractIdentity, kelasController.deleteKelas);

// ==============================================
// Rute Siswa
// ==============================================
router.get("/siswa", extractIdentity, siswaController.getAllSiswa);
router.post("/siswa", extractIdentity, siswaController.createSiswa);
router.put("/siswa/:id", extractIdentity, siswaController.updateSiswa);
router.delete("/siswa/:id", extractIdentity, siswaController.deleteSiswa);

// ==============================================
// Rute Pengumuman
// ==============================================
router.get(
  "/pengumuman",
  extractIdentity,
  pengumumanController.getAllPengumuman,
);
router.post(
  "/pengumuman",
  extractIdentity,
  pengumumanController.createPengumuman,
);
router.put(
  "/pengumuman/:id",
  extractIdentity,
  pengumumanController.updatePengumuman,
);
router.delete(
  "/pengumuman/:id",
  extractIdentity,
  pengumumanController.deletePengumuman,
);

// ==============================================
// Rute Arsip Surat (dengan upload file)
// ==============================================
router.get(
  "/arsip-surat",
  extractIdentity,
  arsipSuratController.getAllArsipSurat,
);
router.post(
  "/arsip-surat",
  extractIdentity,
  upload.single("file"),
  arsipSuratController.createArsipSurat,
);
router.put(
  "/arsip-surat/:id",
  extractIdentity,
  upload.single("file"),
  arsipSuratController.updateArsipSurat,
);
router.delete(
  "/arsip-surat/:id",
  extractIdentity,
  arsipSuratController.deleteArsipSurat,
);

// ==============================================
// Rute Guru
// ==============================================
router.get(
  "/teacher/classes",
  extractIdentity,
  guruController.getTeacherClasses,
);
router.get(
  "/teacher/classes/:classId/subjects",
  extractIdentity,
  guruController.getSubjectsByClass,
);
router.get(
  "/classes/:classId/students",
  extractIdentity,
  guruController.getClassStudents,
);
router.get(
  "/attendance/class/:classId",
  extractIdentity,
  guruController.getAttendanceByClass,
);
router.post(
  "/attendance/bulk",
  extractIdentity,
  guruController.saveBulkAttendance,
);

// ==============================================
// Rute Mata Pelajaran
// ==============================================
router.get("/mapel", extractIdentity, mapelController.getAllMapel);
router.post("/mapel", extractIdentity, mapelController.createMapel);
router.put("/mapel/:id", extractIdentity, mapelController.updateMapel);
router.delete("/mapel/:id", extractIdentity, mapelController.deleteMapel);

// ==============================================
// Rute Jadwal Mengajar
// ==============================================
router.get("/jadwal", extractIdentity, jadwalController.getAllJadwal);
router.post("/jadwal", extractIdentity, jadwalController.createJadwal);
router.put("/jadwal/:id", extractIdentity, jadwalController.updateJadwal);
router.delete("/jadwal/:id", extractIdentity, jadwalController.deleteJadwal);

// ==============================================
// Rute Piket
// ==============================================
router.get("/piket", extractIdentity, piketController.getAllPiket);
router.post("/piket", extractIdentity, piketController.createPiket);
router.put("/piket/:id", extractIdentity, piketController.updatePiket);
router.delete("/piket/:id", extractIdentity, piketController.deletePiket);

// ==============================================
// Rute Upacara
// ==============================================
router.get("/upacara", extractIdentity, upacaraController.getAllUpacara);
router.post("/upacara", extractIdentity, upacaraController.createUpacara);
router.put("/upacara/:id", extractIdentity, upacaraController.updateUpacara);
router.delete("/upacara/:id", extractIdentity, upacaraController.deleteUpacara);

module.exports = router;
