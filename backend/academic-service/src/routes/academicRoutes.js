const express = require('express');
const router = express.Router();
const arsipSuratController = require('../controllers/arsipSuratController');
const kelasController = require('../controllers/kelasController');
const pengumumanController = require('../controllers/pengumumanController');
const siswaController = require('../controllers/siswaController');
const mapelController = require('../controllers/mapelController');
const jadwalController = require('../controllers/jadwalController');
const piketController = require('../controllers/piketController');
// const verifyToken = require('../middleware/auth'); 
const upload = require('../middleware/upload');
const upacaraController = require('../controllers/upacaraController');
const extractIdentity = require('../middleware/extractIdentity');

// === WALI KELAS ===
const parentingController = require('../controllers/parentingController');
const kebersihanController = require('../controllers/kebersihanController');
const refleksiController = require('../controllers/refleksiController');
const berandaWaliKelasController = require('../controllers/berandaWaliKelasController');

// Rute Kelas
router.get('/kelas', extractIdentity, kelasController.getAllKelas);
router.post('/kelas', extractIdentity, kelasController.createKelas);
router.put('/kelas/:id', extractIdentity, kelasController.updateKelas);
router.delete('/kelas/:id', extractIdentity, kelasController.deleteKelas);

// Rute Siswa
router.get('/siswa', extractIdentity, siswaController.getAllSiswa);
router.post('/siswa', extractIdentity, siswaController.createSiswa);
router.put('/siswa/:id', extractIdentity, siswaController.updateSiswa);
router.delete('/siswa/:id', extractIdentity, siswaController.deleteSiswa);

// Rute Pengumuman
router.get('/pengumuman', extractIdentity, pengumumanController.getAllPengumuman);
router.post('/pengumuman', extractIdentity, pengumumanController.createPengumuman);
router.put('/pengumuman/:id', extractIdentity, pengumumanController.updatePengumuman);
router.delete('/pengumuman/:id', extractIdentity, pengumumanController.deletePengumuman);

// Rute Arsip Surat
router.get('/arsip-surat', extractIdentity, arsipSuratController.getAllArsipSurat);
// Gunakan upload.single('file') untuk memproses form-data yang memiliki input field bernama 'file'
router.post('/arsip-surat', extractIdentity, upload.single('file'), arsipSuratController.createArsipSurat);
router.put('/arsip-surat/:id', extractIdentity, upload.single('file'), arsipSuratController.updateArsipSurat);
router.delete('/arsip-surat/:id', extractIdentity, arsipSuratController.deleteArsipSurat);

// Rute Mata Pelajaran
router.get('/mapel', extractIdentity, mapelController.getAllMapel);
router.post('/mapel', extractIdentity, mapelController.createMapel);
router.put('/mapel/:id', extractIdentity, mapelController.updateMapel);
router.delete('/mapel/:id', extractIdentity, mapelController.deleteMapel);

// Rute Jadwal Mengajar
router.get('/jadwal', extractIdentity, jadwalController.getAllJadwal);
router.post('/jadwal', extractIdentity, jadwalController.createJadwal);
router.put('/jadwal/:id', extractIdentity, jadwalController.updateJadwal);
router.delete('/jadwal/:id', extractIdentity, jadwalController.deleteJadwal);

// Rute Jadwal Piket
router.get('/piket', extractIdentity, piketController.getAllPiket);
router.post('/piket', extractIdentity, piketController.createPiket);
router.put('/piket/:id', extractIdentity, piketController.updatePiket);
router.delete('/piket/:id', extractIdentity, piketController.deletePiket);

// Rute Jadwal Upacara
router.get('/upacara', extractIdentity, upacaraController.getAllUpacara);
router.post('/upacara', extractIdentity, upacaraController.createUpacara);
router.put('/upacara/:id', extractIdentity, upacaraController.updateUpacara);
router.delete('/upacara/:id', extractIdentity, upacaraController.deleteUpacara);

// ==========================================
// === RUTE WALI KELAS ===
// ==========================================

// Beranda (dashboard ringkasan)
router.get('/walas/beranda', extractIdentity, berandaWaliKelasController.getBerandaData);

// Parenting
router.get('/walas/parenting', extractIdentity, parentingController.getAllParenting);
router.get('/walas/parenting/:id', extractIdentity, parentingController.getParentingById);
router.post('/walas/parenting', extractIdentity, parentingController.createParenting);
router.put('/walas/parenting/:id', extractIdentity, parentingController.updateParenting);
router.delete('/walas/parenting/:id', extractIdentity, parentingController.deleteParenting);

// Kebersihan Kelas
router.get('/walas/kebersihan', extractIdentity, kebersihanController.getAllKebersihan);
router.get('/walas/kebersihan/rekap/:kelas_id', extractIdentity, kebersihanController.getRekapKebersihan);
router.get('/walas/kebersihan/:id', extractIdentity, kebersihanController.getKebersihanById);
router.post('/walas/kebersihan', extractIdentity, kebersihanController.createKebersihan);
router.put('/walas/kebersihan/:id', extractIdentity, kebersihanController.updateKebersihan);
router.delete('/walas/kebersihan/:id', extractIdentity, kebersihanController.deleteKebersihan);

// Refleksi Kelas
router.get('/walas/refleksi', extractIdentity, refleksiController.getAllRefleksi);
router.get('/walas/refleksi/:id', extractIdentity, refleksiController.getRefleksiById);
router.post('/walas/refleksi', extractIdentity, refleksiController.createRefleksi);
router.put('/walas/refleksi/:id', extractIdentity, refleksiController.updateRefleksi);
router.delete('/walas/refleksi/:id', extractIdentity, refleksiController.deleteRefleksi);

module.exports = router;