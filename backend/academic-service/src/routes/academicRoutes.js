const express = require('express');
const router = express.Router();
const arsipSuratController = require('../controllers/arsipSuratController');
const kelasController = require('../controllers/kelasController');
const pengumumanController = require('../controllers/pengumumanController');
const siswaController = require('../controllers/siswaController');
const verifyToken = require('../middleware/auth'); 
const upload = require('../middleware/upload');

// Rute Kelas
router.get('/kelas', verifyToken, kelasController.getAllKelas);
router.post('/kelas', verifyToken, kelasController.createKelas);

// Tambahkan :id di rute bawah ini
router.put('/kelas/:id', verifyToken, kelasController.updateKelas);
router.delete('/kelas/:id', verifyToken, kelasController.deleteKelas);

// Rute Siswa
router.get('/siswa', verifyToken, siswaController.getAllSiswa);
router.post('/siswa', verifyToken, siswaController.createSiswa);
router.put('/siswa/:id', verifyToken, siswaController.updateSiswa);
router.delete('/siswa/:id', verifyToken, siswaController.deleteSiswa);

// Rute Pengumuman
router.get('/pengumuman', verifyToken, pengumumanController.getAllPengumuman);
router.post('/pengumuman', verifyToken, pengumumanController.createPengumuman);
router.put('/pengumuman/:id', verifyToken, pengumumanController.updatePengumuman);
router.delete('/pengumuman/:id', verifyToken, pengumumanController.deletePengumuman);

// Rute Arsip Surat
router.get('/arsip-surat', verifyToken, arsipSuratController.getAllArsipSurat);
// Gunakan upload.single('file') untuk memproses form-data yang memiliki input field bernama 'file'
router.post('/arsip-surat', verifyToken, upload.single('file'), arsipSuratController.createArsipSurat);
router.put('/arsip-surat/:id', verifyToken, upload.single('file'), arsipSuratController.updateArsipSurat);
router.delete('/arsip-surat/:id', verifyToken, arsipSuratController.deleteArsipSurat);

// TETAP EXPORT ROUTER, JANGAN UBAH INI
module.exports = router;