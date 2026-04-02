const express = require('express');
const router  = express.Router();
const pramukaController = require('../controllers/pramukaController');
const pklController     = require('../controllers/pklController');
const upload = require('../middleware/upload');
const extractIdentity = require('../middleware/extractIdentity');

// ── PRAMUKA: REGU & ANGGOTA ───────────────────────────────────
router.get('/regu',                pramukaController.getAllRegu);
router.post('/regu',               pramukaController.createRegu);
router.get('/regu/siswa-tersedia', pramukaController.getSiswaTersedia);
router.post('/regu/assign',        pramukaController.assignSiswaToRegu);

// ── PRAMUKA: ABSENSI (berbasis regu) ─────────────────────────
router.get('/regu/:regu_id/siswa', pramukaController.getSiswaByRegu);
router.post('/absensi',            pramukaController.submitAbsensiPramuka);

// ── PRAMUKA: UPLOAD LAPORAN ───────────────────────────────────
router.post('/upload', upload.single('file_laporan'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  }
  res.json({ file_url: `/uploads/${req.file.filename}` });
});

// ── PKL: LOKASI ───────────────────────────────────────────────
router.get('/pkl/lokasi',        extractIdentity, pklController.getAllLokasiPKL);
router.post('/pkl/lokasi',       extractIdentity, pklController.createLokasiPKL);
router.put('/pkl/lokasi/:id',    extractIdentity, pklController.updateLokasiPKL);
router.delete('/pkl/lokasi/:id', extractIdentity, pklController.deleteLokasiPKL);

// ── PKL: PROGRES ──────────────────────────────────────────────
router.get('/pkl/progres',        extractIdentity, pklController.getAllProgresPKL);
router.post('/pkl/progres',       extractIdentity, pklController.createProgresPKL);
router.put('/pkl/progres/:id',    extractIdentity, pklController.updateProgresPKL);
router.delete('/pkl/progres/:id', extractIdentity, pklController.deleteProgresPKL);

// ── PKL: NILAI ────────────────────────────────────────────────
router.get('/pkl/nilai',        extractIdentity, pklController.getNilaiPKL);
router.post('/pkl/nilai',       extractIdentity, pklController.saveNilaiPKLBulk);
router.delete('/pkl/nilai/:id', extractIdentity, pklController.deleteNilaiPKL);

module.exports = router;
