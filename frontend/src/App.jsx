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
import AbsensiPramukaPage from "./pages/pramuka/absensi/AbsensiPramukaPage";
import GuruPage from "./pages/tata-usaha/guru/GuruPage";
import SilabusKegiatanPage from "./pages/pramuka/SilabusKegiatanPage";
import LaporanKegiatanPage from "./pages/pramuka/LaporanKegiatanPage";

// --- Vokasi ---
import LokasiPKLPage from "./pages/vokasi/LokasiPKLPage";     // ← versi baru dengan foto preview
import ProgresPKLPage from "./pages/vokasi/ProgresPKLPage";
import NilaiPKLPage from "./pages/vokasi/NilaiPKLPage";

// --- Kepala Sekolah ---
import RekapAbsensiGuruPage from "./pages/kepala-sekolah/RekapAbsensiGuruPage";
import RekapAbsensiSiswaPage from "./pages/kepala-sekolah/RekapAbsensiSiswaPage";
import PemeriksaanPerangkatPage from "./pages/kepala-sekolah/PemeriksaanPerangkatPage";
import EvaluasiKinerjaPage from "./pages/kepala-sekolah/EvaluasiKinerjaPage";
import PKLKepsekPage from "./pages/kepala-sekolah/PKLKepsekPage";

// --- Waka Sekolah ---
import KurikulumPage from "./pages/waka-sekolah/KurikulumPage";

// --- Wakil Kepala Sekolah (Wakakur) — NEW ✨ ---
import WakakurJadwalPage      from "./pages/wakil-kepala-sekolah/WakakurJadwalPage";
import WakakurAbsensiGuruPage from "./pages/wakil-kepala-sekolah/WakakurAbsensiGuruPage";
import WakakurPerangkatPage   from "./pages/wakil-kepala-sekolah/WakakurPerangkatPage";
import WakakurParentingPage   from "./pages/wakil-kepala-sekolah/WakakurParentingPage";
import WakakurLaporanPage     from "./pages/wakil-kepala-sekolah/WakakurLaporanPage";

/**
 * Komponen reusable untuk grup menu per role (Dropdown)
 */
const NavDropdown = ({ title, icon, children, isOpen, onClick }) => {
  return (
    <div className="mb-2">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
      >
        <div className="flex items-center gap-3">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span
          className={`transition-transform duration-200 text-[10px] ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            padding: "20px 30px",
            fontSize: "16px",
            maxWidth: "600px",
            fontWeight: "500",
            textAlign: "center",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />
      <div className="flex min-h-screen bg-gray-50">
        {/* === SIDEBAR === */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-blue-600">SMK N1 Sigumpar</h1>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto shadow-inner">
            {/* Dashboard umum */}
            <NavLink to="/" end className={navClass}>
              <span className="mr-3">🏠</span> Dashboard
            </NavLink>

            <div className="mt-4 space-y-1">
              {/* Dropdown Kepala Sekolah */}
              {hasRole("kepala-sekolah") && (
                <NavDropdown
                  title="Kepala Sekolah"
                  icon="👨‍💼"
                  isOpen={openMenus["kepsek"]}
                  onClick={() => toggleMenu("kepsek")}
                >
                  <NavLink to="/kepsek/absensi-guru" className={subNavClass}>
                    Rekap Absensi Guru
                  </NavLink>
                  <NavLink to="/kepsek/absensi-siswa" className={subNavClass}>
                    Rekap Absensi Siswa
                  </NavLink>
                  <NavLink to="/kepsek/perangkat-ajar" className={subNavClass}>
                    Pemeriksaan Perangkat
                  </NavLink>
                  <NavLink to="/kepsek/evaluasi-kinerja" className={subNavClass}>
                    Evaluasi Kinerja Guru
                  </NavLink>
                  <NavLink to="/kepsek/pkl" className={subNavClass}>
                    PKL
                  </NavLink>
                </NavDropdown>
              )}

              {/* ── Dropdown Waka Sekolah (UPDATED ✨) ── */}
              {hasRole("waka-sekolah") && (
                <NavDropdown
                  title="Waka Sekolah"
                  icon="👨‍🏫"
                  isOpen={openMenus["waka"]}
                  onClick={() => toggleMenu("waka")}
                >
                  <NavLink to="/waka/kurikulum" className={subNavClass}>
                    Kurikulum
                  </NavLink>
                  <NavLink to="/waka/jadwal" className={subNavClass}>
                    📅 Monitoring Jadwal
                  </NavLink>
                  <NavLink to="/waka/absensi-guru" className={subNavClass}>
                    📋 Monitoring Absensi Guru
                  </NavLink>
                  <NavLink to="/waka/perangkat" className={subNavClass}>
                    📁 Monitoring Perangkat
                  </NavLink>
                  <NavLink to="/waka/parenting" className={subNavClass}>
                    👨‍👩‍👧 Monitoring Parenting
                  </NavLink>
                  <NavLink to="/waka/laporan" className={subNavClass}>
                    📊 Laporan Ringkas
                  </NavLink>
                </NavDropdown>
              )}

              {/* Dropdown Guru Mapel */}
              {hasRole("guru-mapel") && (
                <NavDropdown
                  title="Guru Mapel"
                  icon="📝"
                  isOpen={openMenus["guru"]}
                  onClick={() => toggleMenu("guru")}
                >
                  <NavLink to="/input-nilai" className={subNavClass}>
                    Input Nilai
                  </NavLink>
                  <NavLink to="/absensi-siswa" className={subNavClass}>
                    Absensi Siswa
                  </NavLink>
                  <NavLink to="/absensi-guru" className={subNavClass}>
                    Absensi Guru
                  </NavLink>
                  <NavLink to="/perangkat-pembelajaran" className={subNavClass}>
                    RPP / Perangkat
                  </NavLink>
                </NavDropdown>
              )}

              {/* Dropdown Wali Kelas */}
              {hasRole("wali-kelas") && (
                <NavDropdown
                  title="Wali Kelas"
                  icon="🏫"
                  isOpen={openMenus["walas"]}
                  onClick={() => toggleMenu("walas")}
                >
                  <NavLink to="/wali/absensi-siswa" className={subNavClass}>
                    Presensi Kelas
                  </NavLink>
                  <NavLink to="/wali/rekap-kehadiran" className={subNavClass}>
                    Rekap Kehadiran
                  </NavLink>
                  <NavLink to="/wali/rekap-nilai" className={subNavClass}>
                    Rekap Nilai
                  </NavLink>
                  <NavLink to="/wali/parenting" className={subNavClass}>
                    Parenting
                  </NavLink>
                  <NavLink to="/wali/kebersihan-kelas" className={subNavClass}>
                    Kebersihan Kelas
                  </NavLink>
                  <NavLink to="/wali/refleksi" className={subNavClass}>
                    Refleksi
                  </NavLink>
                </NavDropdown>
              )}

              {/* Dropdown Tata Usaha */}
              {hasRole("tata-usaha") && (
                <NavDropdown
                  title="Tata Usaha"
                  icon="📂"
                  isOpen={openMenus["tu"]}
                  onClick={() => toggleMenu("tu")}
                >
                  <NavLink to="/academic/kelas" className={subNavClass}>
                    Data Kelas
                  </NavLink>
                  <NavLink to="/academic/siswa" className={subNavClass}>
                    Data Siswa
                  </NavLink>
                  <NavLink to="/academic/guru" className={subNavClass}>
                    Data Guru
                  </NavLink>
                  <NavLink to="/academic/pengumuman" className={subNavClass}>
                    Pengumuman
                  </NavLink>
                  <NavLink to="/academic/arsip-surat" className={subNavClass}>
                    Arsip Surat
                  </NavLink>
                  <NavLink to="/academic/mapel" className={subNavClass}>
                    Mata Pelajaran
                  </NavLink>
                  <NavLink to="/academic/jadwal" className={subNavClass}>
                    Jadwal Mengajar
                  </NavLink>
                  <NavLink to="/academic/piket" className={subNavClass}>
                    Jadwal Piket
                  </NavLink>
                  <NavLink to="/academic/upacara" className={subNavClass}>
                    Jadwal Upacara
                  </NavLink>
                </NavDropdown>
              )}

              {/* Dropdown Pramuka */}
              {hasRole("pramuka") && (
                <NavDropdown
                  title="Pramuka"
                  icon="⛺"
                  isOpen={openMenus["pramuka"]}
                  onClick={() => toggleMenu("pramuka")}
                >
                  <NavLink to="/vocational/absensi" className={subNavClass}>
                    Absensi Pramuka
                  </NavLink>
                  <NavLink to="/pramuka/silabus" className={subNavClass}>
                    Silabus & Kegiatan
                  </NavLink>
                  <NavLink to="/pramuka/laporan" className={subNavClass}>
                    Laporan Kegiatan
                  </NavLink>
                </NavDropdown>
              )}

              {/* Dropdown Vokasi */}
              {hasRole("vokasi") && (
                <NavDropdown
                  title="Vokasi"
                  icon="🛠️"
                  isOpen={openMenus["vokasi"]}
                  onClick={() => toggleMenu("vokasi")}
                >
                  <NavLink to="/vokasi/lokasi-pkl" className={subNavClass}>
                    Pelaporan Lokasi PKL
                  </NavLink>
                  <NavLink to="/vokasi/progres-pkl" className={subNavClass}>
                    Pelaporan Progres PKL
                  </NavLink>
                  <NavLink to="/vokasi/nilai-pkl" className={subNavClass}>
                    Input Nilai PKL
                  </NavLink>
                </NavDropdown>
              )}
            </div>
          </nav>

          {/* Profil User di Bawah Sidebar */}
          <div className="p-4 border-t bg-gray-50">
            <p className="text-xs text-gray-500 mb-1 italic">Logged in as:</p>
            <p className="text-sm font-bold text-gray-800 truncate mb-3">
              {keycloak.tokenParsed?.name || "User SMK"}
            </p>
            <button
              onClick={() => keycloak.logout()}
              className="w-full bg-red-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
            >
              LOGOUT
            </button>
          </div>
        </aside>

        {/* === KONTEN UTAMA === */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pengumuman/:id" element={<DetailPengumuman />} />

            {/* Tata Usaha */}
            <Route path="/academic/kelas" element={<KelasPage />} />
            <Route path="/academic/siswa" element={<SiswaPage />} />
            <Route path="/academic/guru" element={<GuruPage />} />
            <Route path="/academic/pengumuman" element={<PengumumanPage />} />
            <Route path="/academic/arsip-surat" element={<ArsipSuratPage />} />
            <Route path="/academic/mapel" element={<MapelPage />} />
            <Route path="/academic/jadwal" element={<JadwalPage />} />
            <Route path="/academic/piket" element={<PiketPage />} />
            <Route path="/academic/upacara" element={<UpacaraPage />} />

            {/* Guru Mapel */}
            <Route path="/input-nilai" element={<InputNilaiPage />} />
            <Route path="/absensi-siswa" element={<AbsensiSiswa />} />
            <Route path="/absensi-guru" element={<AbsensiGuruPage />} />
            <Route path="/perangkat-pembelajaran" element={<PerangkatPage />} />

            {/* Wali Kelas */}
            <Route path="/wali/absensi-siswa" element={<PresensiKelasPage />} />
            <Route path="/wali/rekap-kehadiran" element={<RekapKehadiranPage />} />
            <Route path="/wali/rekap-nilai" element={<RekapNilaiPage />} />
            <Route path="/wali/parenting" element={<ParentingPage />} />
            <Route path="/wali/kebersihan-kelas" element={<KebersihanKelasPage />} />
            <Route path="/wali/refleksi" element={<RefleksiPage />} />

            {/* Pramuka */}
            <Route path="/vocational/absensi" element={<AbsensiPramukaPage />} />
            <Route path="/pramuka/silabus" element={<SilabusKegiatanPage />} />
            <Route path="/pramuka/laporan" element={<LaporanKegiatanPage />} />

            {/* Vokasi — LokasiPKLPage versi baru dengan foto preview */}
            <Route path="/vokasi/lokasi-pkl" element={<LokasiPKLPage />} />
            <Route path="/vokasi/progres-pkl" element={<ProgresPKLPage />} />
            <Route path="/vokasi/nilai-pkl" element={<NilaiPKLPage />} />

            {/* Kepala Sekolah */}
            <Route path="/kepsek/absensi-guru" element={<RekapAbsensiGuruPage />} />
            <Route path="/kepsek/absensi-siswa" element={<RekapAbsensiSiswaPage />} />
            <Route path="/kepsek/perangkat-ajar" element={<PemeriksaanPerangkatPage />} />
            <Route path="/kepsek/evaluasi-kinerja" element={<EvaluasiKinerjaPage />} />
            <Route path="/kepsek/pkl" element={<PKLKepsekPage />} />

            {/* Waka Sekolah — existing */}
            <Route path="/waka/kurikulum" element={<KurikulumPage />} />

            {/* ── Wakil Kepala Sekolah (Wakakur) — NEW ✨ ── */}
            <Route path="/waka/jadwal"       element={<WakakurJadwalPage />} />
            <Route path="/waka/absensi-guru" element={<WakakurAbsensiGuruPage />} />
            <Route path="/waka/perangkat"    element={<WakakurPerangkatPage />} />
            <Route path="/waka/parenting"    element={<WakakurParentingPage />} />
            <Route path="/waka/laporan"      element={<WakakurLaporanPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

const navClass = ({ isActive }) =>
  `flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1
  ${isActive ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`;

const subNavClass = ({ isActive }) =>
  `block px-4 py-2 text-xs font-medium rounded-lg transition-all
  ${isActive ? "text-blue-600 bg-blue-50 font-bold" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"}`;

export default App;