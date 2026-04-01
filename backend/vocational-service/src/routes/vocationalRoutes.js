const express = require('express');
const router = express.Router();
const pramukaController = require('../controllers/pramukaController');
const upload = require('../middleware/upload');
const pklController = require('../controllers/pklController');

console.log("Cek Controller Regu:", typeof pramukaController.getAllRegu); // Debugging

// --- REGU & ANGGOTA ---
router.get('/regu', pramukaController.getAllRegu);
router.post('/regu', pramukaController.createRegu);
router.get('/regu/siswa-tersedia', pramukaController.getSiswaTersedia);
router.post('/regu/assign', pramukaController.assignSiswaToRegu);

// --- ABSENSI (Berbasis Regu, bukan Kelas) ---
router.get('/regu/:regu_id/siswa', pramukaController.getSiswaByRegu); 
router.post('/absensi', pramukaController.submitAbsensiPramuka);

router.post('/upload', upload.single('file_laporan'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Tidak ada file yang diupload" });
    }
    // Kembalikan URL/Path dari file yang berhasil disimpan
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ file_url: fileUrl });
});


router.get('/pkl/lokasi', pklController.getLokasiPkl);
router.post('/pkl/lokasi', pklController.createLokasiPkl);
router.get('/pkl/progres', pklController.getProgresPkl);
router.post('/pkl/progres', pklController.createProgresPkl);
router.get('/pkl/dashboard', pklController.getDashboardPkl);

module.exports = router;