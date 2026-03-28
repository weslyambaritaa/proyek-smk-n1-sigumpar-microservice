const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// HAPUS kurung kurawal {} di sini (Opsi 1)
const verifyToken = require('../middleware/auth'); 

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

// TETAP EXPORT ROUTER, JANGAN UBAH INI
module.exports = router;