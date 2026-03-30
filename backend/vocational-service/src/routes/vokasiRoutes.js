const express = require('express');
const router = express.Router();
const lokasiController = require('../controllers/lokasiController');
const progresController = require('../controllers/progresController');
const upload = require('../middleware/upload');
const extractIdentity = require('../middleware/extractIdentity');

// ── PKL Lokasi ─────────────────────────────────────────────
router.get('/lokasi', extractIdentity, lokasiController.getAllLokasi);
router.post('/lokasi', extractIdentity, upload.single('foto_lokasi'), lokasiController.createLokasi);
router.put('/lokasi/:id', extractIdentity, upload.single('foto_lokasi'), lokasiController.updateLokasi);
router.delete('/lokasi/:id', extractIdentity, lokasiController.deleteLokasi);

// ── PKL Progres ─────────────────────────────────────────────
router.get('/progres', extractIdentity, progresController.getAllProgres);
router.get('/progres/siswa-list', extractIdentity, progresController.getSiswaList);
router.post('/progres', extractIdentity, upload.single('foto_bukti'), progresController.createProgres);
router.put('/progres/:id', extractIdentity, upload.single('foto_bukti'), progresController.updateProgres);
router.delete('/progres/:id', extractIdentity, progresController.deleteProgres);

module.exports = router;
