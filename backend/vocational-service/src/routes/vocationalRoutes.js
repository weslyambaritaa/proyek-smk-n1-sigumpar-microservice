const express = require('express');
const router  = express.Router();
const pramukaController = require('../controllers/pramukaController');
const pklController     = require('../controllers/pklController');
const upload = require('../middleware/upload');
const extractIdentity = require('../middleware/extractIdentity');

// ── PRAMUKA: REGU & ANGGOTA ───────────────────────────────────────────────
router.get('/regu',                pramukaController.getAllRegu);
router.post('/regu',               pramukaController.createRegu);
router.delete('/regu/:id',         pramukaController.deleteRegu);
router.get('/regu/siswa-tersedia', pramukaController.getSiswaTersedia);
router.post('/regu/assign',        pramukaController.assignSiswaToRegu);
router.get('/regu/:regu_id/siswa', pramukaController.getSiswaByRegu);

// ── PRAMUKA: ABSENSI (per-kelas dari academic, seperti absensi siswa) ─────
router.get('/absensi',  pramukaController.getAbsensiPramuka);
router.post('/absensi', pramukaController.submitAbsensiPramuka);
router.get('/absensi/rekap', pramukaController.getRekapAbsensiPramuka);

// ── PRAMUKA: SILABUS ──────────────────────────────────────────────────────
router.get('/silabus',             pramukaController.getAllSilabus);
router.post('/silabus',            upload.single('file'), pramukaController.createSilabus);
router.delete('/silabus/:id',      pramukaController.deleteSilabus);

// ── PRAMUKA: UPLOAD FILE ──────────────────────────────────────────────────
router.post('/upload', upload.single('file_laporan'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  res.json({ file_url: `/api/vocational/uploads/${req.file.filename}`, file_nama: req.file.originalname });
});

// ── LAPORAN KEGIATAN PRAMUKA ──────────────────────────────────────────────
router.get('/laporan-kegiatan',       pramukaController.getAllLaporanKegiatan);
router.post('/laporan-kegiatan',      upload.single('file_laporan'), pramukaController.createLaporanKegiatan);
router.delete('/laporan-kegiatan/:id', pramukaController.deleteLaporanKegiatan);

// ── VOKASI: PROXY SISWA & KELAS dari Academic Service ────────────────────
router.get('/siswa',  extractIdentity, pklController.getSiswaForVokasi);
router.get('/kelas',  extractIdentity, pklController.getKelasForVokasi);

// ── PKL: LOKASI ───────────────────────────────────────────────────────────
router.get('/pkl/lokasi',        extractIdentity, pklController.getAllLokasiPKL);
router.post('/pkl/lokasi',       extractIdentity, upload.single('foto'), pklController.createLokasiPKL);
router.put('/pkl/lokasi/:id',    extractIdentity, upload.single('foto'), pklController.updateLokasiPKL);
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
