const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const ctrl = require('../controllers/learningController');

// ---- Perangkat Pembelajaran ----
// Catatan: multer dijalankan di dalam controller (bukan sebagai middleware route)
// karena Express 5 mengubah cara async error propagation
router.get('/perangkat',                  verifyToken, ctrl.getAllPerangkat);
router.post('/perangkat',                 verifyToken, ctrl.uploadPerangkat);  // multer dihandle di dalam controller
router.get('/perangkat/:id/download',     verifyToken, ctrl.downloadPerangkat);
router.delete('/perangkat/:id',           verifyToken, ctrl.deletePerangkat);

// ---- Nilai Siswa ----
router.get('/nilai',        verifyToken, ctrl.getNilai);
router.post('/nilai/batch', verifyToken, ctrl.saveNilaiBatch);

module.exports = router;
