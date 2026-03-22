const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const verifyToken = require('../middleware/auth');

// Rute Kelas
router.get('/kelas', verifyToken, academicController.getAllKelas);
router.post('/kelas', verifyToken, academicController.createKelas);

// Rute Siswa
router.get('/siswa', verifyToken, academicController.getAllSiswa);
router.post('/siswa', verifyToken, academicController.createSiswa);
router.delete('/siswa/:id', verifyToken, academicController.deleteSiswa);

module.exports = router;