const express = require("express");
const router = express.Router();
const extractIdentity = require("../middleware/extractIdentity");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/studentController");
const guruController = require("../controllers/guruController");
const waliKelasController = require("../controllers/waliKelasController");
const nilaiController = require("../controllers/nilaiController");
const absensiSiswaController = require("../controllers/absensiSiswaController");
const upload = require("../middleware/upload");

router.get("/", extractIdentity, getAllUsers);
router.post("/", extractIdentity, createUser);
router.get("/:id", extractIdentity, getUserById);
router.put("/:id", extractIdentity, updateUser);
router.delete("/:id", extractIdentity, deleteUser);

// ─── WALI KELAS ──────────────────────────────────────────────────────────────
router.get(
  "/wali/parenting",
  extractIdentity,
  waliKelasController.getParenting,
);
router.post(
  "/wali/parenting",
  extractIdentity,
  upload.single("foto"),
  waliKelasController.createParenting,
);
router.get(
  "/wali/kebersihan",
  extractIdentity,
  waliKelasController.getRekapKebersihan,
);
router.post(
  "/wali/kebersihan",
  extractIdentity,
  upload.single("foto"),
  waliKelasController.createRekapKebersihan,
);
router.get("/wali/refleksi", extractIdentity, waliKelasController.getRefleksi);
router.post(
  "/wali/refleksi",
  extractIdentity,
  waliKelasController.createRefleksi,
);
router.get(
  "/wali/surat-panggilan",
  extractIdentity,
  waliKelasController.getSuratPanggilan,
);
router.post(
  "/wali/surat-panggilan",
  extractIdentity,
  waliKelasController.createSuratPanggilan,
);
router.get(
  "/wali/rekap-kehadiran",
  extractIdentity,
  waliKelasController.getRekapKehadiran,
);
router.get(
  "/wali/rekap-nilai",
  extractIdentity,
  waliKelasController.getRekapNilai,
);

// ─── ABSENSI SISWA ───────────────────────────────────────────────────────────
router.post(
  "/absensi-siswa",
  extractIdentity,
  absensiSiswaController.createAbsensiSiswa,
);
router.get(
  "/absensi-siswa",
  extractIdentity,
  absensiSiswaController.getAllAbsensiSiswa,
);
router.get(
  "/absensi-siswa/:id",
  extractIdentity,
  absensiSiswaController.getAbsensiSiswaById,
);
router.put(
  "/absensi-siswa/:id",
  extractIdentity,
  absensiSiswaController.updateAbsensiSiswa,
);
router.delete(
  "/absensi-siswa/:id",
  extractIdentity,
  absensiSiswaController.deleteAbsensiSiswa,
);

// ─── GURU / ABSENSI SISWA ───────────────────────────────────────────────────
router.get("/teacher/classes", guruController.getTeacherClasses);
router.get(
  "/teacher/classes/:classId/subjects",
  guruController.getSubjectsByClass,
);
router.get("/classes/:classId/students", guruController.getClassStudents);
router.get("/attendance/class/:classId", guruController.getAttendanceByClass);
router.post("/attendance/bulk", guruController.saveBulkAttendance);

// ─── NILAI ───────────────────────────────────────────────────────────────────
router.get("/nilai", nilaiController.getNilai);
router.get("/nilai/siswa-by-kelas", nilaiController.getSiswaByKelas);
router.post("/nilai/bulk", nilaiController.saveNilaiBulk);
router.put("/nilai/:id", nilaiController.updateNilai);
router.delete("/nilai/:id", nilaiController.deleteNilai);
router.get("/nilai/export-excel", nilaiController.exportNilaiExcel);

module.exports = router;
