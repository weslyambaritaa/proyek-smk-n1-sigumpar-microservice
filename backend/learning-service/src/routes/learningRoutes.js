const express = require("express");
const router = express.Router();
const absensiGuruController = require("../controllers/absensiGuruController");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

// =============================================
// Rute Absensi Guru (dengan upload foto)
// =============================================
router.get(
  "/absensi-guru",
  verifyToken,
  absensiGuruController.getAllAbsensiGuru,
);
router.post(
  "/absensi-guru",
  verifyToken,
  upload.single("foto"),
  absensiGuruController.createAbsensiGuru,
);
router.put(
  "/absensi-guru/:id",
  verifyToken,
  upload.single("foto"),
  absensiGuruController.updateAbsensiGuru,
);
router.delete(
  "/absensi-guru/:id",
  verifyToken,
  absensiGuruController.deleteAbsensiGuru,
);
router.get(
  "/absensi-guru/:id",
  verifyToken,
  absensiGuruController.getAbsensiGuruById,
);

module.exports = router;
