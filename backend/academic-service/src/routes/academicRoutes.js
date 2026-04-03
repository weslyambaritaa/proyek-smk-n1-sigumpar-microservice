const express = require('express');
const router = express.Router();
const arsipSuratController = require('../controllers/arsipSuratController');
const kelasController = require('../controllers/kelasController');
const pengumumanController = require('../controllers/pengumumanController');
const siswaController = require('../controllers/siswaController');
const mapelController = require('../controllers/mapelController');
const jadwalController = require('../controllers/jadwalController');
const piketController = require('../controllers/piketController');
// const verifyToken = require('../middleware/auth'); 
const upload = require('../middleware/upload');
const upacaraController = require('../controllers/upacaraController');
const nilaiController = require('../controllers/nilaiController');
const extractIdentity = require('../middleware/extractIdentity');
const { createAbsensiSiswa, getAllAbsensiSiswa, getAbsensiSiswaById, updateAbsensiSiswa, deleteAbsensiSiswa } = require('../controllers/absensiSiswaController');
const guruController = require('../controllers/guruController');

// Rute Kelas
router.get('/kelas', extractIdentity, kelasController.getAllKelas);
router.post('/kelas', extractIdentity, kelasController.createKelas);
router.put('/kelas/:id', extractIdentity, kelasController.updateKelas);
router.delete('/kelas/:id', extractIdentity, kelasController.deleteKelas);

// Rute Siswa
router.get('/siswa', extractIdentity, siswaController.getAllSiswa);
router.post('/siswa', extractIdentity, siswaController.createSiswa);
router.put('/siswa/:id', extractIdentity, siswaController.updateSiswa);
router.delete('/siswa/:id', extractIdentity, siswaController.deleteSiswa);

// Rute Pengumuman
router.get('/pengumuman', extractIdentity, pengumumanController.getAllPengumuman);
router.post('/pengumuman', extractIdentity, pengumumanController.createPengumuman);
router.put('/pengumuman/:id', extractIdentity, pengumumanController.updatePengumuman);
router.delete('/pengumuman/:id', extractIdentity, pengumumanController.deletePengumuman);

// Rute Arsip Surat
router.get('/arsip-surat', extractIdentity, arsipSuratController.getAllArsipSurat);
// Gunakan upload.single('file') untuk memproses form-data yang memiliki input field bernama 'file'
router.post('/arsip-surat', extractIdentity, upload.single('file'), arsipSuratController.createArsipSurat);
router.put('/arsip-surat/:id', extractIdentity, upload.single('file'), arsipSuratController.updateArsipSurat);
router.delete('/arsip-surat/:id', extractIdentity, arsipSuratController.deleteArsipSurat);

// Rute Mata Pelajaran
router.get('/mapel', extractIdentity, mapelController.getAllMapel);
router.post('/mapel', extractIdentity, mapelController.createMapel);
router.put('/mapel/:id', extractIdentity, mapelController.updateMapel);
router.delete('/mapel/:id', extractIdentity, mapelController.deleteMapel);

// Rute Jadwal Mengajar
router.get('/jadwal', extractIdentity, jadwalController.getAllJadwal);
router.post('/jadwal', extractIdentity, jadwalController.createJadwal);
router.put('/jadwal/:id', extractIdentity, jadwalController.updateJadwal);
router.delete('/jadwal/:id', extractIdentity, jadwalController.deleteJadwal);

// Rute Jadwal Piket
router.get('/piket', extractIdentity, piketController.getAllPiket);
router.post('/piket', extractIdentity, piketController.createPiket);
router.put('/piket/:id', extractIdentity, piketController.updatePiket);
router.delete('/piket/:id', extractIdentity, piketController.deletePiket);

// Rute Jadwal Upacara
router.get('/upacara', extractIdentity, upacaraController.getAllUpacara);
router.post('/upacara', extractIdentity, upacaraController.createUpacara);
router.put('/upacara/:id', extractIdentity, upacaraController.updateUpacara);
router.delete('/upacara/:id', extractIdentity, upacaraController.deleteUpacara);


// Rute Nilai
router.get('/nilai', extractIdentity, nilaiController.getNilai);
router.get('/nilai/siswa-by-kelas', extractIdentity, nilaiController.getSiswaByKelas);
router.post('/nilai/bulk', extractIdentity, nilaiController.saveNilaiBulk);
router.put('/nilai/:id', extractIdentity, nilaiController.updateNilai);
router.delete('/nilai/:id', extractIdentity, nilaiController.deleteNilai);


// Rute Absensi Siswa
router.post('/absensi-siswa', extractIdentity, createAbsensiSiswa);
router.get('/absensi-siswa', extractIdentity, getAllAbsensiSiswa);
router.get('/absensi-siswa/:id', extractIdentity, getAbsensiSiswaById);
router.put('/absensi-siswa/:id', extractIdentity, updateAbsensiSiswa);
router.delete('/absensi-siswa/:id', extractIdentity, deleteAbsensiSiswa);

// Rute Guru Mapel untuk Absensi
router.get('/teacher/classes', extractIdentity, guruController.getTeacherClasses);
router.get('/teacher/classes/:classId/subjects', extractIdentity, guruController.getSubjectsByClass);
router.get('/classes/:classId/students', extractIdentity, guruController.getClassStudents);
router.get('/attendance/class/:classId', extractIdentity, guruController.getAttendanceByClass);
router.post('/attendance/bulk', extractIdentity, guruController.saveBulkAttendance);

module.exports = router;