const express = require("express");
const router = express.Router();
const absensiGuruController = require("../controllers/absensiGuruController");
const verifyToken = require("../middleware/auth"); // sesuaikan path middleware auth
const upload = require("../middleware/upload"); // jika ada upload foto

// Terapkan auth untuk semua endpoint di sini
router.use(verifyToken);

router.get("/", absensiGuruController.getAllAbsensiGuru);
router.get("/:id", absensiGuruController.getAbsensiGuruById);
router.post(
  "/",
  upload.single("foto"),
  absensiGuruController.createAbsensiGuru,
);
router.put(
  "/:id",
  upload.single("foto"),
  absensiGuruController.updateAbsensiGuru,
);
router.delete("/:id", absensiGuruController.deleteAbsensiGuru);

module.exports = router;
