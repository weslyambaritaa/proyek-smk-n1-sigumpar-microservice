const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const controller = require("../controllers/studentController");

// lookup dependency ke academic service
router.get("/kelas", controller.getKelasLookup);
router.get("/siswa", controller.getSiswaLookup);

// parenting
router.get("/parenting", controller.getParenting);
router.post("/parenting", upload.single("foto"), controller.createParenting);
router.put("/parenting/:id", upload.single("foto"), controller.updateParenting);
router.delete("/parenting/:id", controller.deleteParenting);

// kebersihan kelas
router.get("/kebersihan", controller.getKebersihan);
router.post("/kebersihan", upload.single("foto"), controller.createKebersihan);
router.put(
  "/kebersihan/:id",
  upload.single("foto"),
  controller.updateKebersihan,
);
router.delete("/kebersihan/:id", controller.deleteKebersihan);

// refleksi
router.get("/refleksi", controller.getRefleksi);
router.post("/refleksi", controller.createRefleksi);
router.put("/refleksi/:id", controller.updateRefleksi);
router.delete("/refleksi/:id", controller.deleteRefleksi);

// surat panggilan siswa
router.get("/surat-panggilan", controller.getSuratPanggilan);
router.post("/surat-panggilan", controller.createSuratPanggilan);
router.put("/surat-panggilan/:id", controller.updateSuratPanggilan);
router.delete("/surat-panggilan/:id", controller.deleteSuratPanggilan);

// rekap
router.get("/rekap-kehadiran", controller.getRekapKehadiran);
router.get("/rekap-nilai", controller.getRekapNilai);

module.exports = router;
