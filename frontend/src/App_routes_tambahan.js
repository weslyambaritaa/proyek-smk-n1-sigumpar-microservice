// ════════════════════════════════════════════════════════════════════════════
// TAMBAHKAN ke App.jsx
// ════════════════════════════════════════════════════════════════════════════

// 1. Import di bagian atas App.jsx (setelah import yang sudah ada):

import WakakurJadwalPage       from "./pages/wakil-kepala-sekolah/WakakurJadwalPage";
import WakakurAbsensiGuruPage  from "./pages/wakil-kepala-sekolah/WakakurAbsensiGuruPage";
import WakakurPerangkatPage    from "./pages/wakil-kepala-sekolah/WakakurPerangkatPage";
import WakakurParentingPage    from "./pages/wakil-kepala-sekolah/WakakurParentingPage";
import WakakurLaporanPage      from "./pages/wakil-kepala-sekolah/WakakurLaporanPage";

// ── Halaman CRUD baru Wakil Kepsek ──
import PengecekanPerangkatPage from "./pages/wakil-kepala-sekolah/perangkat-pembelajaran/PengecekanPerangkatPage";
import DetailPerangkatGuruPage from "./pages/wakil-kepala-sekolah/perangkat-pembelajaran/DetailPerangkatGuruPage";
import SupervisiPage           from "./pages/wakil-kepala-sekolah/supervisi/SupervisiPage";
import ProgramKerjaPage        from "./pages/wakil-kepala-sekolah/program-kerja/ProgramKerjaPage";


// 2. Tambahkan <NavLink> di sidebar (di dalam blok hasRole("wakil-kepala-sekolah")):
//
//   <NavLink to="/wakakur/jadwal"         className={subNavClass}>📅 Jadwal</NavLink>
//   <NavLink to="/wakakur/absensi-guru"   className={subNavClass}>📋 Absensi Guru</NavLink>
//   <NavLink to="/wakakur/perangkat"      className={subNavClass}>📁 Monitoring Perangkat</NavLink>
//   <NavLink to="/wakakur/pengecekan"     className={subNavClass}>✅ Pengecekan Perangkat</NavLink>
//   <NavLink to="/wakakur/supervisi"      className={subNavClass}>🔍 Supervisi Guru</NavLink>
//   <NavLink to="/wakakur/program-kerja"  className={subNavClass}>📅 Program Kerja</NavLink>
//   <NavLink to="/wakakur/parenting"      className={subNavClass}>👨‍👩‍👧 Parenting</NavLink>
//   <NavLink to="/wakakur/laporan"        className={subNavClass}>📊 Laporan</NavLink>


// 3. Tambahkan <Route> di dalam <Routes>:

// Monitoring (read-only, sudah ada)
// <Route path="/wakakur/jadwal"       element={<WakakurJadwalPage />} />
// <Route path="/wakakur/absensi-guru" element={<WakakurAbsensiGuruPage />} />
// <Route path="/wakakur/perangkat"    element={<WakakurPerangkatPage />} />
// <Route path="/wakakur/parenting"    element={<WakakurParentingPage />} />
// <Route path="/wakakur/laporan"      element={<WakakurLaporanPage />} />

// CRUD baru ──────────────────────────────────────────────────────────────────
// <Route path="/wakakur/pengecekan"            element={<PengecekanPerangkatPage />} />
// <Route path="/wakakur/perangkat-guru/:guruId" element={<DetailPerangkatGuruPage />} />
// <Route path="/wakakur/supervisi"             element={<SupervisiPage />} />
// <Route path="/wakakur/program-kerja"         element={<ProgramKerjaPage />} />
