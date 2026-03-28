const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const verifyToken = require('../middleware/auth'); 
const upload = require('../middleware/upload');

// Rute Kelas
router.get('/kelas', verifyToken, academicController.getAllKelas);
router.post('/kelas', verifyToken, academicController.createKelas);

// Tambahkan :id di rute bawah ini
router.put('/kelas/:id', verifyToken, academicController.updateKelas);
router.delete('/kelas/:id', verifyToken, academicController.deleteKelas);

// Rute Siswa
router.get('/siswa', verifyToken, academicController.getAllSiswa);
router.post('/siswa', verifyToken, academicController.createSiswa);
router.put('/siswa/:id', verifyToken, academicController.updateSiswa);
router.delete('/siswa/:id', verifyToken, academicController.deleteSiswa);

// Rute Pengumuman
router.get('/pengumuman', verifyToken, academicController.getAllPengumuman);
router.post('/pengumuman', verifyToken, academicController.createPengumuman);
router.put('/pengumuman/:id', verifyToken, academicController.updatePengumuman);
router.delete('/pengumuman/:id', verifyToken, academicController.deletePengumuman);

// Rute Arsip Surat
router.get('/arsip-surat', verifyToken, academicController.getAllArsipSurat);
// Gunakan upload.single('file') untuk memproses form-data yang memiliki input field bernama 'file'
router.post('/arsip-surat', verifyToken, upload.single('file'), academicController.createArsipSurat);
router.put('/arsip-surat/:id', verifyToken, upload.single('file'), academicController.updateArsipSurat);
router.delete('/arsip-surat/:id', verifyToken, academicController.deleteArsipSurat);

// TETAP EXPORT ROUTER, JANGAN UBAH INI
module.exports = router;