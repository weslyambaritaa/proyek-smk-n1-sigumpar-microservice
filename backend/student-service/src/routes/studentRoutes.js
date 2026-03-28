const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const rekapKehadiranController = require('../controllers/rekapKehadiranController');
const rekapNilaiController = require('../controllers/rekapNilaiController');
const parentingController = require('../controllers/parentingController');
const kebersihanKelasController = require('../controllers/kebersihanKelasController');
const refleksiController = require('../controllers/refleksiController');

// =============================================================================
// REKAP KEHADIRAN (read-only)
// GET  /api/students/rekap-kehadiran        -> daftar semua + filter + meta
// GET  /api/students/rekap-kehadiran/:id    -> detail satu siswa
// =============================================================================
router.get('/rekap-kehadiran', verifyToken, rekapKehadiranController.getAllRekapKehadiran);
router.get('/rekap-kehadiran/:id', verifyToken, rekapKehadiranController.getRekapKehadiranById);

// =============================================================================
// REKAP NILAI (read-only)
// GET  /api/students/rekap-nilai            -> daftar semua + filter + meta
// GET  /api/students/rekap-nilai/:id        -> detail nilai per mapel
// =============================================================================
router.get('/rekap-nilai', verifyToken, rekapNilaiController.getAllRekapNilai);
router.get('/rekap-nilai/:id', verifyToken, rekapNilaiController.getRekapNilaiById);

// =============================================================================
// PARENTING (CRUD)
// GET    /api/students/parenting            -> daftar semua
// POST   /api/students/parenting            -> tambah baru
// GET    /api/students/parenting/:id        -> detail
// PUT    /api/students/parenting/:id        -> update
// DELETE /api/students/parenting/:id        -> hapus
// =============================================================================
router
  .route('/parenting')
  .get(verifyToken, parentingController.getAllParenting)
  .post(verifyToken, parentingController.createParenting);

router
  .route('/parenting/:id')
  .get(verifyToken, parentingController.getParentingById)
  .put(verifyToken, parentingController.updateParenting)
  .delete(verifyToken, parentingController.deleteParenting);

// =============================================================================
// KEBERSIHAN KELAS (CRUD)
// GET    /api/students/kebersihan-kelas     -> daftar semua
// POST   /api/students/kebersihan-kelas     -> tambah baru
// GET    /api/students/kebersihan-kelas/:id -> detail
// PUT    /api/students/kebersihan-kelas/:id -> update
// DELETE /api/students/kebersihan-kelas/:id -> hapus
// =============================================================================
router
  .route('/kebersihan-kelas')
  .get(verifyToken, kebersihanKelasController.getAllKebersihanKelas)
  .post(verifyToken, kebersihanKelasController.createKebersihanKelas);

router
  .route('/kebersihan-kelas/:id')
  .get(verifyToken, kebersihanKelasController.getKebersihanKelasById)
  .put(verifyToken, kebersihanKelasController.updateKebersihanKelas)
  .delete(verifyToken, kebersihanKelasController.deleteKebersihanKelas);

// =============================================================================
// REFLEKSI (CRUD)
// GET    /api/students/refleksi             -> daftar semua
// POST   /api/students/refleksi             -> tambah baru
// GET    /api/students/refleksi/:id         -> detail
// PUT    /api/students/refleksi/:id         -> update
// DELETE /api/students/refleksi/:id         -> hapus
// =============================================================================
router
  .route('/refleksi')
  .get(verifyToken, refleksiController.getAllRefleksi)
  .post(verifyToken, refleksiController.createRefleksi);

router
  .route('/refleksi/:id')
  .get(verifyToken, refleksiController.getRefleksiById)
  .put(verifyToken, refleksiController.updateRefleksi)
  .delete(verifyToken, refleksiController.deleteRefleksi);

module.exports = router;