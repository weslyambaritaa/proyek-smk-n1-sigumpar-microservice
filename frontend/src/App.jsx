import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import keycloak, { hasRole } from "./keycloak";
import { Toaster } from "react-hot-toast";

// --- Dashboard ---
import Dashboard from "./pages/dashboard/Dashboard";
import DetailPengumuman from "./pages/dashboard/DetailPengumuman";

// --- Tata Usaha ---
import KelasPage from "./pages/tata-usaha/kelas/KelasPage";
import SiswaPage from "./pages/tata-usaha/siswa/SiswaPage";
import PengumumanPage from "./pages/tata-usaha/pengumuman/PengumumanPage";
import ArsipSuratPage from "./pages/tata-usaha/arsip-surat/ArsipSuratPage";
import MapelPage from "./pages/tata-usaha/mapel/MapelPage";
import JadwalPage from "./pages/tata-usaha/jadwal/JadwalPage";
import PiketPage from "./pages/tata-usaha/piket/PiketPage";
import UpacaraPage from "./pages/tata-usaha/upacara/UpacaraPage";

// --- Guru Mapel ---
import AbsensiGuruPage from "./pages/guru-mapel/AbsensiGuruPage";
import AbsensiSiswa from "./pages/guru-mapel/absensi-siswa/AbsensiSiswa";
import PerangkatPage from "./pages/guru-mapel/perangkat/PerangkatPage";
import InputNilaiPage from "./pages/guru-mapel/InputNilaiPage";

// --- Wali Kelas ---
import PresensiKelasPage from "./pages/wali-kelas/PresensiKelasPage";
import RekapKehadiranPage from "./pages/wali-kelas/RekapKehadiranPage";
import RekapNilaiPage from "./pages/wali-kelas/RekapNilaiPage";
import ParentingPage from "./pages/wali-kelas/ParentingPage";
import KebersihanKelasPage from "./pages/wali-kelas/KebersihanKelasPage";
import RefleksiPage from "./pages/wali-kelas/RefleksiPage";

// --- Pramuka ---
import ReguPage from "./pages/pramuka/regu/ReguPage";
import AnggotaReguPage from "./pages/pramuka/anggota_regu/AnggotaReguPage";
import AbsensiPramukaPage from "./pages/pramuka/absensi/AbsensiPramukaPage";
import SilabusKegiatanPage from "./pages/pramuka/SilabusKegiatanPage";
import LaporanKegiatanPage from "./pages/pramuka/LaporanKegiatanPage";

// --- Vokasi ---
import LokasiPKLPage from "./pages/vokasi/LokasiPKLPage";
import ProgresPKLPage from "./pages/vokasi/ProgresPKLPage";
import NilaiPKLPage from "./pages/vokasi/NilaiPKLPage";

// --- Kepala Sekolah ---
import RekapAbsensiGuruPage from "./pages/kepala-sekolah/RekapAbsensiGuruPage";
import RekapAbsensiSiswaPage from "./pages/kepala-sekolah/RekapAbsensiSiswaPage";
import PemeriksaanPerangkatPage from "./pages/kepala-sekolah/PemeriksaanPerangkatPage";
import EvaluasiKinerjaPage from "./pages/kepala-sekolah/EvaluasiKinerjaPage";
import PKLKepsekPage from "./pages/kepala-sekolah/PKLKepsekPage";

// ── Role label map ───────────────────────────────────────────
const ROLE_LABELS = {
  "kepala-sekolah": "Kepala Sekolah",
  "guru-mapel":     "Guru Mapel",
  "wali-kelas":     "Wali Kelas",
  "tata-usaha":     "Tata Usaha",
  pramuka:          "Pembina Pramuka",
  vokasi:           "Guru Vokasi",
};

function getPrimaryRole() {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  return Object.keys(ROLE_LABELS).find((r) => roles.includes(r)) || null;
}

// ── NavItem ──────────────────────────────────────────────────
const NavItem = ({ to, icon, label, sub = false }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      [
        "flex items-center gap-3 rounded-lg text-sm transition-all duration-150 leading-tight",
        sub ? "py-2 pl-8 pr-3 text-xs" : "py-2.5 px-3",
        isActive
          ? "bg-white/20 text-white font-semibold"
          : "text-blue-100/75 hover:bg-white/10 hover:text-white",
      ].join(" ")
    }
  >
    {icon && <span className="w-4 text-center text-sm flex-shrink-0">{icon}</span>}
    <span className="leading-tight">{label}</span>
  </NavLink>
);

// ── NavGroup (collapsible) ───────────────────────────────────
const NavGroup = ({ icon, label, open, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm text-blue-100/75 hover:bg-white/10 hover:text-white transition-all duration-150"
    >
      <span className="flex items-center gap-3">
        <span className="w-4 text-center text-sm flex-shrink-0">{icon}</span>
        <span>{label}</span>
      </span>
      <span className={`text-[9px] opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
    </button>
    {open && <div className="mt-0.5 space-y-0.5">{children}</div>}
  </div>
);

// ── App ──────────────────────────────────────────────────────
const App = () => {
  const [open, setOpen] = useState({});
  const tog = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const userName =
    keycloak.tokenParsed?.name ||
    keycloak.tokenParsed?.preferred_username ||
    "Pengguna";
  const primaryRole = getPrimaryRole();
  const roleLabel   = primaryRole ? ROLE_LABELS[primaryRole] : "Pengguna";

  // Demo role buttons state – which ones are "active" based on Keycloak roles
  const demoRoles = [
    { key: "kepala-sekolah", label: "KEPALA" },
    { key: null,             label: "WAKIL"  },
    { key: "pramuka",        label: "PEMBINA"},
    { key: "wali-kelas",     label: "WALI"   },
    { key: "guru-mapel",     label: "GURU"   },
    { key: "tata-usaha",     label: "TATA"   },
    { key: "vokasi",         label: "GURU"   },
  ];

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { padding: "16px 24px", fontSize: "14px", maxWidth: "500px", fontWeight: "500" },
          success: { duration: 3000 },
          error:   { duration: 4000 },
        }}
      />
      <div className="flex min-h-screen bg-gray-100">

        {/* ═══ SIDEBAR ══════════════════════════════════════ */}
        <aside
          className="w-48 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden"
          style={{ background: "linear-gradient(180deg,#1a3f7a 0%,#12295a 100%)" }}
        >
          {/* Top brand strip */}
          <div className="px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300/70 leading-relaxed">
              Sistem Informasi<br />Akademik
            </p>
          </div>

          {/* Active user */}
          <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-300/60">
              Pengguna Aktif
            </p>
            <p className="text-xs font-bold text-white truncate uppercase mt-0.5">
              {userName}
            </p>
            <p className="text-[10px] font-semibold text-blue-300 uppercase tracking-wide mt-0.5">
              {roleLabel}
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            <NavItem to="/" icon="🏠" label="Beranda" />

            {/* ── Guru Mapel ── */}
            {hasRole("guru-mapel") && (
              <>
                <NavItem to="/absensi-guru"           icon="👤" label="Absensi Guru" />
                <NavItem to="/absensi-siswa"          icon="📋" label="Absensi Siswa" />
                <NavItem to="/perangkat-pembelajaran" icon="📖" label="Perangkat Pembelajaran" />
                <NavItem to="/input-nilai"            icon="✔️" label="Input & Kelola Nilai" />
              </>
            )}

            {/* ── Wali Kelas ── */}
            {hasRole("wali-kelas") && (
              <>
                <NavItem to="/wali/absensi-siswa"    icon="📋" label="Presensi Kelas" />
                <NavItem to="/wali/rekap-kehadiran"  icon="📊" label="Rekap Kehadiran" />
                <NavItem to="/wali/rekap-nilai"      icon="✔️" label="Rekap Nilai" />
                <NavItem to="/wali/parenting"        icon="👥" label="Parenting" />
                <NavItem to="/wali/kebersihan-kelas" icon="🗑️" label="Kebersihan Kelas" />
                <NavItem to="/wali/refleksi"         icon="📝" label="Refleksi" />
              </>
            )}

            {/* ── Pramuka ── */}
            {hasRole("pramuka") && (
              <>
                <NavItem to="/vocational/absensi"  icon="📋" label="Absensi Siswa" />
                <NavItem to="/pramuka/silabus"     icon="📖" label="Silabus & Kegiatan" />
                <NavItem to="/pramuka/laporan"     icon="📝" label="Laporan Kegiatan" />
              </>
            )}

            {/* ── Vokasi ── */}
            {hasRole("vokasi") && (
              <>
                <NavItem to="/vokasi/lokasi-pkl"  icon="📍" label="Pelaporan Lokasi PKL" />
                <NavItem to="/vokasi/progres-pkl" icon="🏠" label="Pelaporan Progres PKL" />
                <NavItem to="/vokasi/nilai-pkl"   icon="✔️" label="Input Nilai PKL" />
              </>
            )}

            {/* ── Kepala Sekolah ── */}
            {hasRole("kepala-sekolah") && (
              <>
                <NavGroup
                  icon="📋" label="Absensi"
                  open={open["kepsek-abs"]} onToggle={() => tog("kepsek-abs")}
                >
                  <NavItem to="/kepsek/absensi-guru"  icon="" label="Absensi Guru"  sub />
                  <NavItem to="/kepsek/absensi-siswa" icon="" label="Absensi Siswa" sub />
                </NavGroup>
                <NavItem to="/kepsek/perangkat-ajar"   icon="📖" label="Perangkat Ajar" />
                <NavItem to="/kepsek/evaluasi-kinerja" icon="✔️" label="Evaluasi Kinerja Guru" />
                <NavItem to="/kepsek/pkl"              icon="🏠" label="PKL" />
              </>
            )}

            {/* ── Tata Usaha ── */}
            {hasRole("tata-usaha") && (
              <>
                <NavItem to="/academic/siswa"       icon="👤" label="Input Data Siswa" />
                <NavItem to="/academic/kelas"       icon="👥" label="Input Data Guru" />
                <NavItem to="/academic/arsip-surat" icon="📂" label="Arsip Surat" />
                <NavItem to="/academic/jadwal"      icon="🗓️" label="Jadwal Guru" />
                <NavItem to="/academic/upacara"     icon="🎖️" label="Jadwal Upacara" />
                <NavItem to="/academic/piket"       icon="🕐" label="Jadwal Piket" />
                <NavItem to="/academic/pengumuman"  icon="📢" label="Pengumuman" />
                <NavItem to="/academic/mapel"       icon="🏠" label="Landing Page" />
              </>
            )}
          </nav>

          {/* Demo role buttons */}
          <div className="px-3 py-2 border-t border-white/10 flex-shrink-0">
            <p className="text-[9px] font-bold text-center uppercase tracking-widest text-blue-300/50 mb-1.5">
              SMK N 1 Sigumpar
            </p>
            <div className="grid grid-cols-2 gap-1 mb-2">
              {demoRoles.map(({ key, label }, i) => {
                const active = key && hasRole(key);
                return (
                  <button
                    key={i}
                    className={`text-[9px] font-bold py-1 rounded border transition-all ${
                      active
                        ? "bg-white text-blue-800 border-white"
                        : "border-white/20 text-white/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <div className="px-3 pb-3 flex-shrink-0">
            <button
              onClick={() => keycloak.logout()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold text-red-300 hover:text-red-200 hover:bg-red-900/30 transition-all"
            >
              <span className="text-xs">➜</span>
              <span>KELUAR</span>
            </button>
          </div>
        </aside>

        {/* ═══ MAIN ═════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header */}
          <header
            className="h-11 flex items-center gap-3 px-5 flex-shrink-0 shadow"
            style={{ background: "linear-gradient(90deg,#1a3f7a 0%,#2563b0 100%)" }}
          >
            <button className="text-white/50 hover:text-white text-lg">☰</button>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-white font-bold text-sm tracking-wide">SMK NEGERI 1 SIGUMPAR</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/"                         element={<Dashboard />} />
              <Route path="/pengumuman/:id"            element={<DetailPengumuman />} />

              {/* Tata Usaha */}
              <Route path="/academic/kelas"            element={<KelasPage />} />
              <Route path="/academic/siswa"            element={<SiswaPage />} />
              <Route path="/academic/pengumuman"       element={<PengumumanPage />} />
              <Route path="/academic/arsip-surat"      element={<ArsipSuratPage />} />
              <Route path="/academic/mapel"            element={<MapelPage />} />
              <Route path="/academic/jadwal"           element={<JadwalPage />} />
              <Route path="/academic/piket"            element={<PiketPage />} />
              <Route path="/academic/upacara"          element={<UpacaraPage />} />

              {/* Guru Mapel */}
              <Route path="/absensi-guru"              element={<AbsensiGuruPage />} />
              <Route path="/absensi-siswa"             element={<AbsensiSiswa />} />
              <Route path="/perangkat-pembelajaran"    element={<PerangkatPage />} />
              <Route path="/input-nilai"               element={<InputNilaiPage />} />

              {/* Wali Kelas */}
              <Route path="/wali/absensi-siswa"        element={<PresensiKelasPage />} />
              <Route path="/wali/rekap-kehadiran"      element={<RekapKehadiranPage />} />
              <Route path="/wali/rekap-nilai"          element={<RekapNilaiPage />} />
              <Route path="/wali/parenting"            element={<ParentingPage />} />
              <Route path="/wali/kebersihan-kelas"     element={<KebersihanKelasPage />} />
              <Route path="/wali/refleksi"             element={<RefleksiPage />} />

              {/* Pramuka */}
              <Route path="/vocational/regu"           element={<ReguPage />} />
              <Route path="/vocational/anggota-regu"   element={<AnggotaReguPage />} />
              <Route path="/vocational/absensi"        element={<AbsensiPramukaPage />} />
              <Route path="/pramuka/silabus"           element={<SilabusKegiatanPage />} />
              <Route path="/pramuka/laporan"           element={<LaporanKegiatanPage />} />

              {/* Vokasi */}
              <Route path="/vokasi/lokasi-pkl"         element={<LokasiPKLPage />} />
              <Route path="/vokasi/progres-pkl"        element={<ProgresPKLPage />} />
              <Route path="/vokasi/nilai-pkl"          element={<NilaiPKLPage />} />

              {/* Kepala Sekolah */}
              <Route path="/kepsek/absensi-guru"       element={<RekapAbsensiGuruPage />} />
              <Route path="/kepsek/absensi-siswa"      element={<RekapAbsensiSiswaPage />} />
              <Route path="/kepsek/perangkat-ajar"     element={<PemeriksaanPerangkatPage />} />
              <Route path="/kepsek/evaluasi-kinerja"   element={<EvaluasiKinerjaPage />} />
              <Route path="/kepsek/pkl"                element={<PKLKepsekPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
