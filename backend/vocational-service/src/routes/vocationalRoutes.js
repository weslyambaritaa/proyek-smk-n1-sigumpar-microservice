const express = require('express');
const router = express.Router();
const pramukaController = require('../controllers/pramukaController');

console.log("Cek Controller Regu:", typeof pramukaController.getAllRegu); // Debugging

// --- REGU & ANGGOTA ---
router.get('/regu', pramukaController.getAllRegu);
router.post('/regu', pramukaController.createRegu);
router.get('/regu/siswa-tersedia', pramukaController.getSiswaTersedia);
router.post('/regu/assign', pramukaController.assignSiswaToRegu);

// --- ABSENSI (Berbasis Regu, bukan Kelas) ---
router.get('/regu/:regu_id/siswa', pramukaController.getSiswaByRegu); 
router.post('/absensi', pramukaController.submitAbsensiPramuka);

module.exports = router;