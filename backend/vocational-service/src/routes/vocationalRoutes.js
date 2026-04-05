const express = require('express');
const router  = express.Router();
const pramukaController = require('../controllers/pramukaController');
const pklController     = require('../controllers/pklController');
const extractIdentity = require('../middleware/extractIdentity');

// ── PRAMUKA: REGU & ANGGOTA ───────────────────────────────────────────────
router.get('/regu',                pramukaController.getAllRegu);
router.post('/regu',               pramukaController.createRegu);
router.delete('/regu/:id',         pramukaController.deleteRegu);
router.get('/regu/siswa-tersedia', pramukaController.getSiswaTersedia);
router.post('/regu/assign',        pramukaController.assignSiswaToRegu);
router.get('/regu/:regu_id/siswa', pramukaController.getSiswaByRegu);

// ── PRAMUKA: ABSENSI ──────────────────────────────────────────────────────
router.get('/absensi',       pramukaController.getAbsensiPramuka);
router.post('/absensi',      pramukaController.submitAbsensiPramuka);
router.get('/absensi/rekap', pramukaController.getRekapAbsensiPramuka);

// ── PRAMUKA: SILABUS ──────────────────────────────────────────────────────
router.get('/silabus',                pramukaController.getAllSilabus);
router.post('/silabus',               pramukaController.createSilabus);
router.get('/silabus/:id/view',       pramukaController.downloadSilabus);   // preview inline
router.get('/silabus/:id/download',   pramukaController.downloadSilabus);   // force download
router.delete('/silabus/:id',         pramukaController.deleteSilabus);

// ── LAPORAN KEGIATAN PRAMUKA ──────────────────────────────────────────────
router.get('/laporan-kegiatan',              pramukaController.getAllLaporanKegiatan);
router.post('/laporan-kegiatan',             pramukaController.createLaporanKegiatan);
router.get('/laporan-kegiatan/:id/view',     pramukaController.downloadLaporanKegiatan);
router.get('/laporan-kegiatan/:id/download', pramukaController.downloadLaporanKegiatan);
router.delete('/laporan-kegiatan/:id',       pramukaController.deleteLaporanKegiatan);

// ── VOKASI: PROXY SISWA & KELAS dari Academic Service ────────────────────
router.get('/siswa',  extractIdentity, pklController.getSiswaForVokasi);
router.get('/kelas',  extractIdentity, pklController.getKelasForVokasi);

// ── PKL: LOKASI ───────────────────────────────────────────────────────────
router.get('/pkl/lokasi',        extractIdentity, pklController.getAllLokasiPKL);
router.post('/pkl/lokasi',       extractIdentity, pklController.createLokasiPKL);
router.put('/pkl/lokasi/:id',    extractIdentity, pklController.updateLokasiPKL);
router.delete('/pkl/lokasi/:id', extractIdentity, pklController.deleteLokasiPKL);

// ── PKL: PROGRES ──────────────────────────────────────────────────────────
router.get('/pkl/progres',        extractIdentity, pklController.getAllProgresPKL);
router.post('/pkl/progres',       extractIdentity, pklController.createProgresPKL);
router.put('/pkl/progres/:id',    extractIdentity, pklController.updateProgresPKL);
router.delete('/pkl/progres/:id', extractIdentity, pklController.deleteProgresPKL);

// ── PKL: NILAI ────────────────────────────────────────────────────────────
router.get('/pkl/nilai',        extractIdentity, pklController.getNilaiPKL);
router.post('/pkl/nilai',       extractIdentity, pklController.saveNilaiPKLBulk);
router.delete('/pkl/nilai/:id', extractIdentity, pklController.deleteNilaiPKL);

module.exports = router;
