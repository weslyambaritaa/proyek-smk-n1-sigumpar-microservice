// ════════════════════════════════════════════════════════════════════════════
// TAMBAHKAN ke file: backend/academic-service/src/routes/academicRoutes.js
//
// Langkah:
//  1. Import controller di bagian atas file:
//     const wakilKepsekCtrl = require('../controllers/wakilKepsekController');
//
//  2. Tambahkan blok route di bawah ini sebelum `module.exports = router;`
// ════════════════════════════════════════════════════════════════════════════

// ── WAKIL KEPALA SEKOLAH ── Statistik Ringkasan ────────────────────────────
router.get('/wakil/statistik', auth, wakilKepsekCtrl.getStatistikWakil);

// ── Perangkat Pembelajaran ─────────────────────────────────────────────────
router.get('/wakil/perangkat-guru',      auth, wakilKepsekCtrl.getDaftarGuruPerangkat);
router.get('/wakil/perangkat-guru/:guruId', auth, wakilKepsekCtrl.getPerangkatByGuru);
router.get('/wakil/perangkat',           auth, wakilKepsekCtrl.getAllPerangkat);
router.post('/wakil/perangkat',          auth, wakilKepsekCtrl.createPerangkat);
router.put('/wakil/perangkat/:id',       auth, wakilKepsekCtrl.updatePerangkat);
router.delete('/wakil/perangkat/:id',    auth, wakilKepsekCtrl.deletePerangkat);

// ── Supervisi Guru ─────────────────────────────────────────────────────────
router.get('/wakil/supervisi',           auth, wakilKepsekCtrl.getAllSupervisi);
router.get('/wakil/supervisi/:id',       auth, wakilKepsekCtrl.getSupervisiById);
router.post('/wakil/supervisi',          auth, wakilKepsekCtrl.createSupervisi);
router.put('/wakil/supervisi/:id',       auth, wakilKepsekCtrl.updateSupervisi);
router.delete('/wakil/supervisi/:id',    auth, wakilKepsekCtrl.deleteSupervisi);

// ── Program Kerja ──────────────────────────────────────────────────────────
router.get('/wakil/program-kerja',       auth, wakilKepsekCtrl.getAllProgramKerja);
router.get('/wakil/program-kerja/:id',   auth, wakilKepsekCtrl.getProgramKerjaById);
router.post('/wakil/program-kerja',      auth, wakilKepsekCtrl.createProgramKerja);
router.put('/wakil/program-kerja/:id',   auth, wakilKepsekCtrl.updateProgramKerja);
router.delete('/wakil/program-kerja/:id', auth, wakilKepsekCtrl.deleteProgramKerja);

// ── Laporan Rekap ──────────────────────────────────────────────────────────
router.get('/wakil/laporan-rekap',       auth, wakilKepsekCtrl.getLaporanRekap);
router.post('/wakil/laporan-rekap',      auth, wakilKepsekCtrl.createLaporanRekap);
router.delete('/wakil/laporan-rekap/:id', auth, wakilKepsekCtrl.deleteLaporanRekap);
