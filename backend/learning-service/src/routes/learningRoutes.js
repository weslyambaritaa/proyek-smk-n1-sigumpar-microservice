const express = require("express");
const router = express.Router();

const extractIdentity = require("../middleware/extractIdentity");
const learningController = require("../controllers/learningController");

router.use(extractIdentity);

// Absensi Guru
router
  .route("/absensi-guru")
  .get(learningController.getAllAbsensiGuru)
  .post(learningController.createAbsensiGuru);

router
  .route("/absensi-guru/:id")
  .get(learningController.getAbsensiGuruById)
  .put(learningController.updateAbsensiGuru)
  .delete(learningController.deleteAbsensiGuru);

// Catatan Mengajar
router
  .route("/catatan-mengajar")
  .get(learningController.getCatatanMengajar)
  .post(learningController.createCatatanMengajar);

router
  .route("/catatan-mengajar/:id")
  .get(learningController.getCatatanMengajarById)
  .put(learningController.updateCatatanMengajar)
  .delete(learningController.deleteCatatanMengajar);

// Evaluasi Guru
router
  .route("/evaluasi-guru")
  .get(learningController.getEvaluasiGuru)
  .post(learningController.createEvaluasiGuru);

router
  .route("/evaluasi-guru/:id")
  .get(learningController.getEvaluasiGuruById)
  .put(learningController.updateEvaluasiGuru)
  .delete(learningController.deleteEvaluasiGuru);

// Perangkat Pembelajaran
router
  .route("/perangkat")
  .get(learningController.getAllPerangkat)
  .post(learningController.uploadPerangkat);

router.get("/perangkat/:id/download", learningController.downloadPerangkat);
router.get("/perangkat/:id/view", learningController.downloadPerangkat);
router.delete("/perangkat/:id", learningController.deletePerangkat);

router.put(
  "/perangkat/:id/review-kepsek",
  learningController.reviewPerangkatKepsek,
);
router.put(
  "/perangkat/:id/review-wakasek",
  learningController.reviewPerangkatWakasek,
);

router.get(
  "/perangkat/:id/riwayat-review",
  learningController.getRiwayatReview,
);
router.get("/perangkat/:id/versi", learningController.getVersiDokumen);

module.exports = router;
