const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { verifyToken } = require('../middleware/auth'); // Gunakan destructuring { }

// Rute Kelas
router.get('/kelas', verifyToken, academicController.getAllKelas);
router.post('/kelas', verifyToken, academicController.createKelas);

// Tambahkan :id di rute bawah ini
router.put('/kelas/:id', verifyToken, academicController.updateKelas);
router.delete('/kelas/:id', verifyToken, academicController.deleteKelas);

// Rute Siswa
router.get('/siswa', verifyToken, academicController.getAllSiswa);
router.post('/siswa', verifyToken, academicController.createSiswa);
router.delete('/siswa/:id', verifyToken, academicController.deleteSiswa);

module.exports = router;