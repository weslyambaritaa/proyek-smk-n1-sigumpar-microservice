const express = require("express");
const router = express.Router();
const extractIdentity = require("../middleware/extractIdentity");
const {
  getAllPerangkat,
  uploadPerangkat,
  downloadPerangkat,
  deletePerangkat,
  reviewPerangkat,
  getRiwayatReview,
  getVersiDokumen,
  getLaporanTahunan,
} = require("../controllers/learningController");

const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController");
const {
  getAllAbsensiGuru,
  getAbsensiGuruById,
  createAbsensiGuru,
  updateAbsensiGuru,
  deleteAbsensiGuru,
} = require("../controllers/absensiGuruController");
const kepsekController = require("../controllers/kepsekController");
const wakilKepsekController = require("../controllers/wakilKepsekController");
const wakilKepsekMonitoringController = require("../controllers/wakilKepsekMonitoringController");

router.use(extractIdentity);

// ── TODOS ─────────────────────────────────────────────────────────────────
router.route("/todos").get(getAllTodos).post(createTodo);
router.route("/todos/:id").get(getTodoById).put(updateTodo).delete(deleteTodo);

// ── ABSENSI GURU ──────────────────────────────────────────────────────────
router.route("/absensi-guru").get(getAllAbsensiGuru).post(createAbsensiGuru);
router
  .route("/absensi-guru/:id")
  .get(getAbsensiGuruById)
  .put(updateAbsensiGuru)
  .delete(deleteAbsensiGuru);

// ── PERANGKAT PEMBELAJARAN ────────────────────────────────────────────────
router.route("/perangkat").get(getAllPerangkat).post(uploadPerangkat);
router.get("/perangkat/:id/download", downloadPerangkat);
router.get("/perangkat/:id/view", downloadPerangkat); // alias preview inline
router.delete("/perangkat/:id", deletePerangkat);

// ── KEPSEK: REVIEW PERANGKAT (endpoint baru) ──────────────────────────────
router.put("/perangkat/:id/review", reviewPerangkat); // setujui / tolak / minta revisi
router.get("/perangkat/:id/riwayat-review", getRiwayatReview); // riwayat semua review
router.get("/perangkat/:id/versi", getVersiDokumen); // semua versi upload dokumen

// ── KEPSEK: DASHBOARD & EVALUASI ─────────────────────────────────────────
router.get("/kepsek/dashboard", kepsekController.getKepsekDashboard);
router.get("/kepsek/statistik", kepsekController.getStatistikUmum);
router.get("/kepsek/evaluasi-guru", kepsekController.getEvaluasiGuru);
router.post("/kepsek/evaluasi-guru", kepsekController.saveEvaluasiGuru);

// ── WAKIL KEPSEK: MONITORING PERANGKAT ───────────────────────────────────
router.get(
  "/wakil/perangkat-guru",
  wakilKepsekController.getDaftarGuruPerangkat,
);
router.get(
  "/wakil/perangkat-guru/:guruId",
  wakilKepsekController.getPerangkatByGuru,
);
router.post("/wakil/perangkat", wakilKepsekController.createPerangkat);
router.put("/wakil/perangkat/:id", wakilKepsekController.updatePerangkat);
router.delete("/wakil/perangkat/:id", wakilKepsekController.deletePerangkat);

// ── WAKIL KEPSEK: MONITORING JADWAL & PARENTING ──────────────────────────
router.get(
  "/wakil/jadwal",
  wakilKepsekMonitoringController.getJadwalMonitoring,
);
router.get(
  "/wakil/jadwal/rekap-hari",
  wakilKepsekMonitoringController.getRekapJadwalPerHari,
);
router.get(
  "/wakil/parenting-monitoring",
  wakilKepsekMonitoringController.getParentingMonitoring,
);
router.get(
  "/wakil/laporan-ringkas",
  wakilKepsekMonitoringController.getLaporanRingkas,
);

// ── LAPORAN TAHUNAN ──────────────────────────────────────────────────────
router.get("/kepsek/laporan-tahunan", getLaporanTahunan);

module.exports = router;
