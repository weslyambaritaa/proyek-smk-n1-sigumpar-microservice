const express = require("express");
const {
  createAbsensiSiswa,
  getAllAbsensiSiswa,
  getAbsensiSiswaById,
  updateAbsensiSiswa,
  deleteAbsensiSiswa,
} = require("../controllers/absensiSiswaController");

const router = express.Router();

router.post("/", createAbsensiSiswa);
router.get("/", getAllAbsensiSiswa);
router.get("/:id", getAbsensiSiswaById);
router.put("/:id", updateAbsensiSiswa);
router.delete("/:id", deleteAbsensiSiswa);

module.exports = router;
const arsipSuratController = require("../controllers/arsipSuratController");
const kelasController = require("../controllers/kelasController");
const pengumumanController = require("../controllers/pengumumanController");
const siswaController = require("../controllers/siswaController");
const mapelController = require("../controllers/mapelController");
const jadwalController = require("../controllers/jadwalController");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

// Rute Kelas
router.get("/kelas", verifyToken, kelasController.getAllKelas);
router.post("/kelas", verifyToken, kelasController.createKelas);

// Tambahkan :id di rute bawah ini
router.put("/kelas/:id", verifyToken, kelasController.updateKelas);
router.delete("/kelas/:id", verifyToken, kelasController.deleteKelas);

// Rute Siswa
router.get("/siswa", verifyToken, siswaController.getAllSiswa);
router.post("/siswa", verifyToken, siswaController.createSiswa);
router.put("/siswa/:id", verifyToken, siswaController.updateSiswa);
router.delete("/siswa/:id", verifyToken, siswaController.deleteSiswa);

// Rute Pengumuman
router.get("/pengumuman", verifyToken, pengumumanController.getAllPengumuman);
router.post("/pengumuman", verifyToken, pengumumanController.createPengumuman);
router.put(
  "/pengumuman/:id",
  verifyToken,
  pengumumanController.updatePengumuman,
);
router.delete(
  "/pengumuman/:id",
  verifyToken,
  pengumumanController.deletePengumuman,
);

// Rute Arsip Surat
router.get("/arsip-surat", verifyToken, arsipSuratController.getAllArsipSurat);
// Gunakan upload.single('file') untuk memproses form-data yang memiliki input field bernama 'file'
router.post(
  "/arsip-surat",
  verifyToken,
  upload.single("file"),
  arsipSuratController.createArsipSurat,
);
router.put(
  "/arsip-surat/:id",
  verifyToken,
  upload.single("file"),
  arsipSuratController.updateArsipSurat,
);
router.delete(
  "/arsip-surat/:id",
  verifyToken,
  arsipSuratController.deleteArsipSurat,
);

// Rute Mata Pelajaran
router.get("/mapel", verifyToken, mapelController.getAllMapel);
router.post("/mapel", verifyToken, mapelController.createMapel);
router.put("/mapel/:id", verifyToken, mapelController.updateMapel);
router.delete("/mapel/:id", verifyToken, mapelController.deleteMapel);

router.get("/jadwal", verifyToken, jadwalController.getAllJadwal);
router.post("/jadwal", verifyToken, jadwalController.createJadwal);
router.put("/jadwal/:id", verifyToken, jadwalController.updateJadwal);
router.delete("/jadwal/:id", verifyToken, jadwalController.deleteJadwal);

module.exports = router;
