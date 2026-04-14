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
const guruDataController = require("../controllers/guruDataController");
const absensiSiswaController = require("../controllers/absensiSiswaController");
const cutiController = require("../controllers/cutiController");
const anggaranController = require("../controllers/anggaranController");
const extractIdentity = require("../middleware/extractIdentity");
const serviceClient = require("../utils/serviceClient");

// ─── KELAS ──────────────────────────────────────────────────────────────────
router.get("/kelas", extractIdentity, kelasController.getAllKelas);
router.post("/kelas", extractIdentity, kelasController.createKelas);
router.put("/kelas/:id", extractIdentity, kelasController.updateKelas);
router.delete("/kelas/:id", extractIdentity, kelasController.deleteKelas);

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
router.get("/dashboard", extractIdentity, async (req, res) => {
  try {
    const authToken = req.headers.authorization;

    // Ambil data dari multiple services secara parallel
    const [kelas, siswa, guru, statistik] = await Promise.all([
      serviceClient.getKelas(authToken).catch(() => []),
      serviceClient.getSiswa(null, authToken).catch(() => []),
      serviceClient.getGuru("", authToken).catch(() => []),
      serviceClient.getKepsekStatistik(authToken).catch(() => ({})),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total_kelas: kelas.length,
          total_siswa: siswa.length,
          total_guru: guru.length,
        },
        statistik,
        recent_kelas: kelas.slice(0, 5),
        recent_siswa: siswa.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data dashboard" });
  }
});

// ─── SISWA ──────────────────────────────────────────────────────────────────
router.get("/siswa", extractIdentity, siswaController.getAllSiswa);
router.post("/siswa", extractIdentity, siswaController.createSiswa);
router.put("/siswa/:id", extractIdentity, siswaController.updateSiswa);
router.delete("/siswa/:id", extractIdentity, siswaController.deleteSiswa);

// ─── ABSENSI SISWA ──────────────────────────────────────────────────────────
router.get(
  "/absensi-siswa",
  extractIdentity,
  absensiSiswaController.getDataAbsensiSiswa,
);
router.post(
  "/absensi-siswa",
  extractIdentity,
  absensiSiswaController.simpanAbsensiSiswa,
);

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

// ─── CUTI GURU ──────────────────────────────────────────────────────────────
router.get("/cuti-guru", extractIdentity, cutiController.getAllCuti);
router.post("/cuti-guru", extractIdentity, cutiController.createCuti);
router.put("/cuti-guru/:id", extractIdentity, cutiController.updateCuti);
router.delete("/cuti-guru/:id", extractIdentity, cutiController.deleteCuti);

// ─── ANGGARAN ───────────────────────────────────────────────────────────────
router.get("/anggaran", extractIdentity, anggaranController.getAllAnggaran);
router.post("/anggaran", extractIdentity, anggaranController.createAnggaran);
router.put("/anggaran/:id", extractIdentity, anggaranController.updateAnggaran);
router.delete(
  "/anggaran/:id",
  extractIdentity,
  anggaranController.deleteAnggaran,
);

// ─── KEPSEK: STATISTIK ──────────────────────────────────────────────────────
router.get("/kepsek/statistik", extractIdentity, async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const result = await serviceClient.getKepsekStatistik(authToken);
    res.json(result);
  } catch (error) {
    console.error("Kepsek statistik error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil statistik kepsek" });
  }
});

// ─── WALI KELAS: PARENTING ──────────────────────────────────────────────────
router.get("/wali/parenting", extractIdentity, async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const { kelas_id } = req.query;
    // Get parenting data from student service
    const result = await serviceClient.callService(
      "student",
      "/api/student/wali/parenting",
      "GET",
      {
        headers: { Authorization: authToken },
        params: kelas_id ? { kelas_id } : {},
      },
    );
    res.json(result);
  } catch (error) {
    console.error("Wali parenting error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data parenting" });
  }
});

router.post("/wali/parenting", extractIdentity, async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const result = await serviceClient.callService(
      "student",
      "/api/student/wali/parenting",
      "POST",
      {
        data: req.body,
        headers: { Authorization: authToken },
      },
    );
    res.json(result);
  } catch (error) {
    console.error("Create parenting error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan data parenting" });
  }
});

// ─── NILAI SISWA (PLACEHOLDER - TO BE IMPLEMENTED) ──────────────────────────
router.get("/nilai", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement nilai endpoints - this is a placeholder
    res
      .status(501)
      .json({ success: false, message: "Endpoint nilai belum diimplementasi" });
  } catch (error) {
    console.error("Nilai error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data nilai" });
  }
});

router.get("/nilai/siswa-by-kelas", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement nilai endpoints - this is a placeholder
    res
      .status(501)
      .json({ success: false, message: "Endpoint nilai belum diimplementasi" });
  } catch (error) {
    console.error("Nilai siswa by kelas error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal mengambil data nilai siswa by kelas",
      });
  }
});

router.post("/nilai/bulk", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement nilai endpoints - this is a placeholder
    res
      .status(501)
      .json({ success: false, message: "Endpoint nilai belum diimplementasi" });
  } catch (error) {
    console.error("Nilai bulk error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan nilai bulk" });
  }
});

router.put("/nilai/:id", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement nilai endpoints - this is a placeholder
    res
      .status(501)
      .json({ success: false, message: "Endpoint nilai belum diimplementasi" });
  } catch (error) {
    console.error("Update nilai error:", error);
    res.status(500).json({ success: false, message: "Gagal mengupdate nilai" });
  }
});

router.delete("/nilai/:id", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement nilai endpoints - this is a placeholder
    res
      .status(501)
      .json({ success: false, message: "Endpoint nilai belum diimplementasi" });
  } catch (error) {
    console.error("Delete nilai error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus nilai" });
  }
});

router.get("/nilai/export-excel", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement nilai endpoints - this is a placeholder
    res
      .status(501)
      .json({ success: false, message: "Endpoint nilai belum diimplementasi" });
  } catch (error) {
    console.error("Export nilai error:", error);
    res.status(500).json({ success: false, message: "Gagal export nilai" });
  }
});

// ─── WALI KELAS: REKAP NILAI & ABSENSI ──────────────────────────────────────
router.get("/wali/rekap-nilai", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement wali rekap nilai - this is a placeholder
    res
      .status(501)
      .json({
        success: false,
        message: "Endpoint wali rekap nilai belum diimplementasi",
      });
  } catch (error) {
    console.error("Wali rekap nilai error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil rekap nilai wali" });
  }
});

router.get("/wali/rekap-absensi", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement wali rekap absensi - this is a placeholder
    res
      .status(501)
      .json({
        success: false,
        message: "Endpoint wali rekap absensi belum diimplementasi",
      });
  } catch (error) {
    console.error("Wali rekap absensi error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil rekap absensi wali" });
  }
});

// ─── KEPSEK: REKAP ABSENSI SISWA ────────────────────────────────────────────
router.get("/kepsek/rekap-absensi-siswa", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement kepsek rekap absensi siswa - this is a placeholder
    res
      .status(501)
      .json({
        success: false,
        message: "Endpoint kepsek rekap absensi siswa belum diimplementasi",
      });
  } catch (error) {
    console.error("Kepsek rekap absensi siswa error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal mengambil rekap absensi siswa kepsek",
      });
  }
});

// ─── KEPSEK: REKAP NILAI ────────────────────────────────────────────────────
router.get("/kepsek/rekap-nilai", extractIdentity, async (req, res) => {
  try {
    // TODO: Implement kepsek rekap nilai - this is a placeholder
    res
      .status(501)
      .json({
        success: false,
        message: "Endpoint kepsek rekap nilai belum diimplementasi",
      });
  } catch (error) {
    console.error("Kepsek rekap nilai error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil rekap nilai kepsek" });
  }
});

module.exports = router;
