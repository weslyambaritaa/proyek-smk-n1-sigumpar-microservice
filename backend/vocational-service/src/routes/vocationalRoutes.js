const express = require('express');
const router = express.Router();
const pramukaController = require('../controllers/pramukaController');

// Debugging: Jika ini log 'undefined', berarti export di controller salah
console.log("Cek Controller:", pramukaController.getAllKelas);

// REGU
router.get('/regu', pramukaController.getAllRegu);
router.post('/regu', pramukaController.createRegu);

// ANGGOTA
router.get('/regu/siswa-tersedia', pramukaController.getSiswaTersedia);
router.post('/regu/assign', pramukaController.assignSiswaToRegu);

// ABSENSI
router.get('/kelas', pramukaController.getAllKelas); // Pastikan fungsi ini ada di controller!
router.get('/absensi/kelas/:kelas_id', pramukaController.getSiswaPramukaByKelas);
router.post('/absensi', pramukaController.submitAbsensiPramuka);

module.exports = router;