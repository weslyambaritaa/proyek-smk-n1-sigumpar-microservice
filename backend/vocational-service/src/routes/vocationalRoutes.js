const express       = require("express");
const router        = express.Router();
const multer        = require("multer");
const path          = require("path");
const extractIdentity = require("../middleware/extractIdentity");
const pklCtrl       = require("../controllers/pklController");
const penempatanCtrl = require("../controllers/pklPenempatanController");

// Konfigurasi multer untuk upload foto penempatan
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Semua route PKL memerlukan autentikasi
router.use(extractIdentity);

// --- Submissions ---
router.get("/submissions",              pklCtrl.getAllPKL);
router.post("/submissions",             pklCtrl.createSubmission);
router.put("/submissions/:id/validate", pklCtrl.validateAndApprovePKL);
const express = require('express');
const router = express.Router();
const pramukaController = require('../controllers/pramukaController');
const upload = require('../middleware/upload');

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

// --- Penempatan ---
router.get("/penempatan",  penempatanCtrl.getAll);
router.post("/penempatan", upload.single("foto_lokasi"), penempatanCtrl.create);

module.exports = router;
