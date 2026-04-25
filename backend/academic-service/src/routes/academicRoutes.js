const express = require("express");
const router = express.Router();
const arsipSuratController = require("../controllers/arsipSuratController");
const kelasController = require("../controllers/kelasController");
const pengumumanController = require("../controllers/pengumumanController");
const siswaController = require("../controllers/siswaController");
const mapelController = require("../controllers/mapelController");
const jadwalController = require("../controllers/jadwalController");
const piketController = require("../controllers/piketController");
const upload = require("../middleware/upload");
const upacaraController = require("../controllers/upacaraController");
const nilaiController = require("../controllers/nilaiController");
const extractIdentity = require("../middleware/extractIdentity");
const {
  createAbsensiSiswa,
  getAllAbsensiSiswa,
  getAbsensiSiswaById,
  updateAbsensiSiswa,
  deleteAbsensiSiswa,
} = require("../controllers/absensiSiswaController");
const guruController = require("../controllers/guruController");
const guruDataController = require("../controllers/guruDataController");
const kepsekController = require("../controllers/kepsekController");
const waliKelasController = require("../controllers/waliKelasController");
const wakilMonitoringController = require("../controllers/wakilKepsekMonitoringController");

// ─── KELAS ──────────────────────────────────────────────────────────────────
router.get("/kelas", extractIdentity, kelasController.getAllKelas);
router.post("/kelas", extractIdentity, kelasController.createKelas);
router.put("/kelas/:id", extractIdentity, kelasController.updateKelas);
router.delete("/kelas/:id", extractIdentity, kelasController.deleteKelas);

// ─── SISWA ──────────────────────────────────────────────────────────────────
router.get("/siswa", extractIdentity, siswaController.getAllSiswa);
router.post("/siswa", extractIdentity, siswaController.createSiswa);
router.put("/siswa/:id", extractIdentity, siswaController.updateSiswa);
router.delete("/siswa/:id", extractIdentity, siswaController.deleteSiswa);

// ─── GURU (Tata Usaha kelola data guru) ─────────────────────────────────────
router.get("/guru", extractIdentity, guruDataController.getAllGuru);
router.post("/guru", extractIdentity, guruDataController.createGuru);
router.put("/guru/:id", extractIdentity, guruDataController.updateGuru);
router.delete("/guru/:id", extractIdentity, guruDataController.deleteGuru);
router.get("/guru/search", extractIdentity, guruDataController.searchGuru);

// ─── PENGUMUMAN ──────────────────────────────────────────────────────────────
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

// ─── ARSIP SURAT ─────────────────────────────────────────────────────────────
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
// Preview arsip surat (stream file ke browser)
router.get(
  "/arsip-surat/:id/preview",
  extractIdentity,
  arsipSuratController.previewArsipSurat,
);

// ─── MATA PELAJARAN ──────────────────────────────────────────────────────────
router.get("/mapel", extractIdentity, mapelController.getAllMapel);
router.post("/mapel", extractIdentity, mapelController.createMapel);
router.put("/mapel/:id", extractIdentity, mapelController.updateMapel);
router.delete("/mapel/:id", extractIdentity, mapelController.deleteMapel);

// ─── JADWAL ──────────────────────────────────────────────────────────────────
router.get("/jadwal", extractIdentity, jadwalController.getAllJadwal);
router.post("/jadwal", extractIdentity, jadwalController.createJadwal);
router.put("/jadwal/:id", extractIdentity, jadwalController.updateJadwal);
router.delete("/jadwal/:id", extractIdentity, jadwalController.deleteJadwal);

// ─── PIKET ───────────────────────────────────────────────────────────────────
router.get("/piket", extractIdentity, piketController.getAllPiket);
router.post("/piket", extractIdentity, piketController.createPiket);
router.put("/piket/:id", extractIdentity, piketController.updatePiket);
router.delete("/piket/:id", extractIdentity, piketController.deletePiket);

// ─── UPACARA ─────────────────────────────────────────────────────────────────
router.get("/upacara", extractIdentity, upacaraController.getAllUpacara);
router.post("/upacara", extractIdentity, upacaraController.createUpacara);
router.put("/upacara/:id", extractIdentity, upacaraController.updateUpacara);
router.delete("/upacara/:id", extractIdentity, upacaraController.deleteUpacara);

// ─── NILAI ───────────────────────────────────────────────────────────────────
router.get("/nilai", extractIdentity, nilaiController.getNilai);
router.get(
  "/nilai/siswa-by-kelas",
  extractIdentity,
  nilaiController.getSiswaByKelas,
);
router.post("/nilai/bulk", extractIdentity, nilaiController.saveNilaiBulk);
router.put("/nilai/:id", extractIdentity, nilaiController.updateNilai);
router.delete("/nilai/:id", extractIdentity, nilaiController.deleteNilai);
// Export nilai ke Excel
router.get(
  "/nilai/export-excel",
  extractIdentity,
  nilaiController.exportNilaiExcel,
);

// ─── ABSENSI SISWA ───────────────────────────────────────────────────────────
router.post("/absensi-siswa", extractIdentity, createAbsensiSiswa);
router.get("/absensi-siswa", extractIdentity, getAllAbsensiSiswa);
router.get("/absensi-siswa/:id", extractIdentity, getAbsensiSiswaById);
router.put("/absensi-siswa/:id", extractIdentity, updateAbsensiSiswa);
router.delete("/absensi-siswa/:id", extractIdentity, deleteAbsensiSiswa);

// ─── GURU MAPEL (Absensi Siswa & Kelas) ─────────────────────────────────────
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

// ─── MATA PELAJARAN ──────────────────────────────────────────────────────────
router.get("/mapel", extractIdentity, mapelController.getAllMapel);
router.get(
  "/mapel/guru/:guruId",
  extractIdentity,
  mapelController.getMapelByGuru,
);
router.post("/mapel", extractIdentity, mapelController.createMapel);
router.put("/mapel/:id", extractIdentity, mapelController.updateMapel);
router.delete("/mapel/:id", extractIdentity, mapelController.deleteMapel);

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
  waliKelasController.getKebersihan,
);
router.post(
  "/wali/kebersihan",
  extractIdentity,
  upload.single("foto"),
  waliKelasController.createKebersihan,
);
router.get("/wali/refleksi", extractIdentity, waliKelasController.getRefleksi);
router.post(
  "/wali/refleksi",
  extractIdentity,
  waliKelasController.createRefleksi,
);
// Rekap wali kelas (nilai & absensi terintegrasi)
router.get(
  "/wali/rekap-nilai",
  extractIdentity,
  waliKelasController.getRekapNilaiWali,
);
router.get(
  "/wali/rekap-absensi",
  extractIdentity,
  waliKelasController.getRekapAbsensiWali,
);

// ─── KEPALA SEKOLAH ──────────────────────────────────────────────────────────
router.get(
  "/kepsek/rekap-absensi-siswa",
  extractIdentity,
  kepsekController.getRekapAbsensiSiswa,
);
router.get(
  "/kepsek/rekap-nilai",
  extractIdentity,
  kepsekController.getRekapNilai,
);
router.get(
  "/kepsek/statistik",
  extractIdentity,
  kepsekController.getStatistikUmum,
);
// Rekap Nilai Final — status konfirmasi dari Wali Kelas
// PENTING: route spesifik harus didaftarkan SEBELUM route dengan parameter (:siswa_id)
router.get(
  "/kepsek/rekap-nilai-final",
  extractIdentity,
  kepsekController.getRekapNilaiFinal,
);
router.get(
  "/kepsek/rekap-nilai-final/detail-siswa/:siswa_id",
  extractIdentity,
  kepsekController.getDetailNilaiSiswa,
);
router.post(
  "/kepsek/rekap-nilai-final/konfirmasi",
  extractIdentity,
  kepsekController.konfirmasiRekapNilai,
);

// ─── WAKIL KEPALA SEKOLAH — MONITORING ───────────────────────────────────────

// Monitoring Jadwal (read-only, sudah ada deteksi bentrok server-side)
router.get(
  "/wakil/jadwal",
  extractIdentity,
  wakilMonitoringController.getJadwalMonitoring,
);
router.get(
  "/wakil/jadwal/rekap-hari",
  extractIdentity,
  wakilMonitoringController.getRekapJadwalPerHari,
);
router.get(
  "/wakil/parenting-monitoring",
  extractIdentity,
  wakilMonitoringController.getParentingMonitoring,
);
router.get(
  "/wakil/laporan-ringkas",
  extractIdentity,
  wakilMonitoringController.getLaporanRingkas,
);

module.exports = router;
