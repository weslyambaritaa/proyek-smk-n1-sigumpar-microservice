const express = require('express');
const router = express.Router();

// Import Controller
const pramukaController = require('../controllers/pramukaController');

// Import Middleware
// Middleware ini digunakan untuk mengekstrak info user (ID, Role, Nama) dari token Keycloak
const extractIdentity = require('../middleware/extractIdentity');

// Terapkan middleware untuk semua route di bawah ini agar aman
router.use(extractIdentity);

// ==========================================
// MANAJEMEN REGU
// ==========================================
// Mendapatkan semua daftar regu
router.get('/regu', pramukaController.getAllRegu);

// Menambahkan regu baru
router.post('/regu', pramukaController.createRegu);


// ==========================================
// PLOTTING ANGGOTA REGU
// ==========================================
// Mendapatkan daftar siswa yang belum memiliki regu
router.get('/regu/siswa-tersedia', pramukaController.getSiswaTersedia);

// Mendapatkan anggota berdasarkan ID Regu tertentu
router.get('/regu/:regu_id/anggota', pramukaController.getAnggotaByRegu);

// Memasukkan satu atau banyak siswa ke dalam regu (Assign)
router.post('/regu/assign', pramukaController.assignSiswaToRegu);


// ==========================================
// ABSENSI KEGIATAN
// ==========================================
// Mendapatkan daftar siswa berdasarkan Kelas untuk keperluan absensi
router.get('/absensi/kelas/:kelas_id', pramukaController.getSiswaPramukaByKelas);

// Menyimpan data absensi baru
router.post('/absensi', pramukaController.submitAbsensiPramuka);

// Melihat riwayat absensi berdasarkan regu (jika diperlukan)
router.get('/absensi/regu/:regu_id', pramukaController.getAbsensiByRegu);


// ==========================================
// LAPORAN & DOKUMENTASI
// ==========================================
// Membuat laporan kegiatan baru
router.post('/laporan', pramukaController.createLaporan);

// Mendapatkan laporan berdasarkan regu
router.get('/laporan/regu/:regu_id', pramukaController.getLaporanByRegu);

module.exports = router;