const express = require("express");
const router = express.Router();

const extractIdentity = require("../middleware/extractIdentity");
const roleGuard = require("../middleware/roleGuard");
const { uploadPerangkat, uploadFoto } = require("../middleware/upload");

const absensiCtrl       = require("../controllers/absensiGuruController");
const catatanCtrl       = require("../controllers/catatanMengajarController");
const evaluasiCtrl      = require("../controllers/evaluasiGuruController");
const perangkatCtrl     = require("../controllers/perangkatController");
const reviewKepsekCtrl  = require("../controllers/reviewKepsekController");
const reviewWakasekCtrl = require("../controllers/reviewWakasekController");

// ABSENSI GURU
router.get("/absensi/rekap",     extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), absensiCtrl.getRekapAbsensi);
router.get("/absensi/guru-saya", extractIdentity, roleGuard("guru-mapel"), absensiCtrl.getAbsensiSaya);
router.get("/absensi",           extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), absensiCtrl.getAllAbsensi);
router.get("/absensi/:id",       extractIdentity, roleGuard("guru-mapel", "kepala-sekolah", "waka-sekolah"), absensiCtrl.getAbsensiById);
router.post("/absensi",          extractIdentity, roleGuard("guru-mapel"), uploadFoto, absensiCtrl.createAbsensi);
router.put("/absensi/:id",       extractIdentity, roleGuard("guru-mapel"), uploadFoto, absensiCtrl.updateAbsensi);
router.delete("/absensi/:id",    extractIdentity, roleGuard("guru-mapel"), absensiCtrl.deleteAbsensi);

// CATATAN MENGAJAR
router.get("/catatan-mengajar/guru-saya", extractIdentity, roleGuard("guru-mapel"), catatanCtrl.getCatatanSaya);
router.get("/catatan-mengajar",           extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), catatanCtrl.getAllCatatan);
router.get("/catatan-mengajar/:id",       extractIdentity, roleGuard("guru-mapel", "kepala-sekolah", "waka-sekolah"), catatanCtrl.getCatatanById);
router.post("/catatan-mengajar",          extractIdentity, roleGuard("guru-mapel"), catatanCtrl.createCatatan);
router.put("/catatan-mengajar/:id",       extractIdentity, roleGuard("guru-mapel"), catatanCtrl.updateCatatan);
router.delete("/catatan-mengajar/:id",    extractIdentity, roleGuard("guru-mapel"), catatanCtrl.deleteCatatan);

// EVALUASI GURU
router.get("/evaluasi",        extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), evaluasiCtrl.getAllEvaluasi);
router.get("/evaluasi/:id",    extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), evaluasiCtrl.getEvaluasiById);
router.post("/evaluasi",       extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), evaluasiCtrl.createEvaluasi);
router.put("/evaluasi/:id",    extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), evaluasiCtrl.updateEvaluasi);
router.delete("/evaluasi/:id", extractIdentity, roleGuard("kepala-sekolah"), evaluasiCtrl.deleteEvaluasi);

// PERANGKAT PEMBELAJARAN
router.get("/perangkat/dashboard-wakasek",   extractIdentity, roleGuard("waka-sekolah", "kepala-sekolah"), perangkatCtrl.getDashboardWakasek);
router.get("/perangkat/daftar-guru",         extractIdentity, roleGuard("waka-sekolah", "kepala-sekolah"), perangkatCtrl.getDaftarGuruStatus);
router.get("/perangkat/detail-guru/:userId", extractIdentity, roleGuard("waka-sekolah", "kepala-sekolah"), perangkatCtrl.getDetailGuruById);
router.get("/perangkat/guru-saya",           extractIdentity, roleGuard("guru-mapel"), perangkatCtrl.getPerangkatSaya);
router.get("/perangkat",                     extractIdentity, roleGuard("waka-sekolah", "kepala-sekolah"), perangkatCtrl.getAllPerangkat);
router.get("/perangkat/:id",                 extractIdentity, roleGuard("guru-mapel", "waka-sekolah", "kepala-sekolah"), perangkatCtrl.getPerangkatById);
router.post("/perangkat",                    extractIdentity, roleGuard("guru-mapel"), uploadPerangkat, perangkatCtrl.createPerangkat);
router.put("/perangkat/:id",                 extractIdentity, roleGuard("guru-mapel"), uploadPerangkat, perangkatCtrl.updatePerangkat);
router.delete("/perangkat/:id",              extractIdentity, roleGuard("guru-mapel", "waka-sekolah", "kepala-sekolah"), perangkatCtrl.deletePerangkat);

// REVIEW KEPALA SEKOLAH
router.get("/review-kepsek",        extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), reviewKepsekCtrl.getAllReviewKepsek);
router.get("/review-kepsek/:id",    extractIdentity, roleGuard("kepala-sekolah", "waka-sekolah"), reviewKepsekCtrl.getReviewKepsekById);
router.post("/review-kepsek",       extractIdentity, roleGuard("kepala-sekolah"), reviewKepsekCtrl.createReviewKepsek);
router.put("/review-kepsek/:id",    extractIdentity, roleGuard("kepala-sekolah"), reviewKepsekCtrl.updateReviewKepsek);
router.delete("/review-kepsek/:id", extractIdentity, roleGuard("kepala-sekolah"), reviewKepsekCtrl.deleteReviewKepsek);

// REVIEW WAKASEK
router.get("/review-wakasek",        extractIdentity, roleGuard("waka-sekolah", "kepala-sekolah"), reviewWakasekCtrl.getAllReviewWakasek);
router.get("/review-wakasek/:id",    extractIdentity, roleGuard("waka-sekolah", "kepala-sekolah"), reviewWakasekCtrl.getReviewWakasekById);
router.post("/review-wakasek",       extractIdentity, roleGuard("waka-sekolah"), reviewWakasekCtrl.createReviewWakasek);
router.put("/review-wakasek/:id",    extractIdentity, roleGuard("waka-sekolah"), reviewWakasekCtrl.updateReviewWakasek);
router.delete("/review-wakasek/:id", extractIdentity, roleGuard("waka-sekolah"), reviewWakasekCtrl.deleteReviewWakasek);

module.exports = router;