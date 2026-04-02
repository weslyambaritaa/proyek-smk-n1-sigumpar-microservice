import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import keycloak, { hasRole } from "./keycloak";
import { Toaster } from "react-hot-toast";

import Dashboard from "./pages/dashboard/Dashboard";
import DetailPengumuman from "./pages/dashboard/DetailPengumuman";

import KelasPage from "./pages/tata-usaha/kelas/KelasPage";
import SiswaPage from "./pages/tata-usaha/siswa/SiswaPage";
import PengumumanPage from "./pages/tata-usaha/pengumuman/PengumumanPage";
import ArsipSuratPage from "./pages/tata-usaha/arsip-surat/ArsipSuratPage";
import MapelPage from "./pages/tata-usaha/mapel/MapelPage";
import JadwalPage from "./pages/tata-usaha/jadwal/JadwalPage";
import PiketPage from "./pages/tata-usaha/piket/PiketPage";
import UpacaraPage from "./pages/tata-usaha/upacara/UpacaraPage";

import AbsensiGuruPage from "./pages/guru-mapel/AbsensiGuruPage";
import AbsensiSiswa from "./pages/guru-mapel/absensi-siswa/AbsensiSiswa";
import PerangkatPage from "./pages/guru-mapel/perangkat/PerangkatPage";
import InputNilaiPage from "./pages/guru-mapel/InputNilaiPage";

import PresensiKelasPage from "./pages/wali-kelas/PresensiKelasPage";
import RekapKehadiranPage from "./pages/wali-kelas/RekapKehadiranPage";
import RekapNilaiPage from "./pages/wali-kelas/RekapNilaiPage";
import ParentingPage from "./pages/wali-kelas/ParentingPage";
import KebersihanKelasPage from "./pages/wali-kelas/KebersihanKelasPage";
import RefleksiPage from "./pages/wali-kelas/RefleksiPage";

import ReguPage from "./pages/pramuka/regu/ReguPage";
import AnggotaReguPage from "./pages/pramuka/anggota_regu/AnggotaReguPage";
import AbsensiPramukaPage from "./pages/pramuka/absensi/AbsensiPramukaPage";
import SilabusKegiatanPage from "./pages/pramuka/SilabusKegiatanPage";
import LaporanKegiatanPage from "./pages/pramuka/LaporanKegiatanPage";

import LokasiPKLPage from "./pages/vokasi/LokasiPKLPage";
import ProgresPKLPage from "./pages/vokasi/ProgresPKLPage";
import NilaiPKLPage from "./pages/vokasi/NilaiPKLPage";

import RekapAbsensiGuruPage from "./pages/kepala-sekolah/RekapAbsensiGuruPage";
import RekapAbsensiSiswaPage from "./pages/kepala-sekolah/RekapAbsensiSiswaPage";
import PemeriksaanPerangkatPage from "./pages/kepala-sekolah/PemeriksaanPerangkatPage";
import EvaluasiKinerjaPage from "./pages/kepala-sekolah/EvaluasiKinerjaPage";
import PKLKepsekPage from "./pages/kepala-sekolah/PKLKepsekPage";

const ROLE_LABELS = {
  "kepala-sekolah": "Kepala Sekolah",
  "guru-mapel": "Guru Mapel",
  "wali-kelas": "Wali Kelas",
  "tata-usaha": "Tata Usaha",
  pramuka: "Pembina Pramuka",
  vokasi: "Guru Vokasi",
};

const MENU_GROUPS = [
  {
    key: "kepala-sekolah",
    label: "Kepala Sekolah",
    icon: "🧑‍💼",
    items: [
      { to: "/kepsek/absensi-guru", label: "Absensi Guru", icon: "" },
      { to: "/kepsek/absensi-siswa", label: "Absensi Siswa", icon: "" },
      { to: "/kepsek/perangkat-ajar", label: "Pemeriksaan Perangkat Ajar", icon: "" },
      { to: "/kepsek/evaluasi-kinerja", label: "Evaluasi Kinerja Guru", icon: "" },
      { to: "/kepsek/pkl", label: "Monitoring PKL", icon: "" },
    ],
  },
  {
    key: "guru-mapel",
    label: "Guru Mapel",
    icon: "🧑‍🏫",
    items: [
      { to: "/absensi-guru", label: "Absensi Guru", icon: "" },
      { to: "/absensi-siswa", label: "Absensi Siswa", icon: "" },
      { to: "/perangkat-pembelajaran", label: "Perangkat Pembelajaran", icon: "" },
      { to: "/input-nilai", label: "Input Nilai", icon: "" },
    ],
  },
  {
    key: "wali-kelas",
    label: "Wali Kelas",
    icon: "🏫",
    items: [
      { to: "/wali/absensi-siswa", label: "Presensi Kelas", icon: "" },
      { to: "/wali/rekap-kehadiran", label: "Rekap Kehadiran", icon: "" },
      { to: "/wali/rekap-nilai", label: "Rekap Nilai", icon: "" },
      { to: "/wali/parenting", label: "Parenting", icon: "" },
      { to: "/wali/kebersihan-kelas", label: "Kebersihan Kelas", icon: "" },
      { to: "/wali/refleksi", label: "Refleksi", icon: "" },
    ],
  },
  {
    key: "tata-usaha",
    label: "Tata Usaha",
    icon: "🗂️",
    items: [
      { to: "/academic/kelas", label: "Data Kelas", icon: "" },
      { to: "/academic/siswa", label: "Data Siswa", icon: "" },
      { to: "/academic/pengumuman", label: "Pengumuman", icon: "" },
      { to: "/academic/arsip-surat", label: "Arsip Surat", icon: "" },
      { to: "/academic/mapel", label: "Mata Pelajaran", icon: "" },
      { to: "/academic/jadwal", label: "Jadwal Mengajar", icon: "" },
      { to: "/academic/piket", label: "Jadwal Piket", icon: "" },
      { to: "/academic/upacara", label: "Jadwal Upacara", icon: "" },
    ],
  },
  {
    key: "pramuka",
    label: "Pembina Pramuka",
    icon: "⛺",
    items: [
      { to: "/vocational/absensi", label: "Absensi Siswa", icon: "" },
      { to: "/pramuka/silabus", label: "Silabus & Kegiatan", icon: "" },
      { to: "/pramuka/laporan", label: "Laporan Kegiatan", icon: "" },
    ],
  },
  {
    key: "vokasi",
    label: "Guru Vokasi",
    icon: "🏭",
    items: [
      { to: "/vokasi/lokasi-pkl", label: "Lokasi PKL", icon: "" },
      { to: "/vokasi/progres-pkl", label: "Progres PKL", icon: "" },
      { to: "/vokasi/nilai-pkl", label: "Nilai PKL", icon: "" },
    ],
  },
];

function getPrimaryRole() {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  return Object.keys(ROLE_LABELS).find((role) => roles.includes(role)) || null;
}

function NavItem({ to, icon, label, sub = false }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg transition-all duration-150",
          sub ? "py-2 pl-10 pr-3 text-[13px]" : "py-2.5 px-3 text-sm",
          isActive
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")
      }
    >
      {icon ? <span className="w-4 text-center flex-shrink-0">{icon}</span> : <span className="w-4" />}
      <span className="leading-tight">{label}</span>
    </NavLink>
  );
}

function NavGroup({ label, icon, items, isOpen, onToggle, active }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={[
          "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
          active ? "text-slate-900 bg-slate-100 font-semibold" : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
      >
        <span className="flex items-center gap-3">
          <span className="w-4 text-center flex-shrink-0">{icon}</span>
          <span>{label}</span>
        </span>
        <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="mt-1 ml-3 border-l border-slate-200 pl-1 space-y-0.5">
          {items.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} sub />
          ))}
        </div>
      )}
    </div>
  );
}

function AppShell() {
  const location = useLocation();

  const visibleGroups = useMemo(
    () => MENU_GROUPS.filter((group) => hasRole(group.key)),
    []
  );

  const [open, setOpen] = useState(() =>
    Object.fromEntries(visibleGroups.map((group) => [group.key, true]))
  );

  const toggleGroup = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const userName =
    keycloak.tokenParsed?.name ||
    keycloak.tokenParsed?.preferred_username ||
    "Pengguna";

  const primaryRole = getPrimaryRole();
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : "Pengguna";

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { padding: "16px 24px", fontSize: "14px", maxWidth: "500px", fontWeight: "500" },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />

      <div className="flex min-h-screen bg-slate-100">
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
          <div className="px-6 py-6 border-b border-slate-200">
            <h1 className="text-3xl font-black tracking-tight text-blue-700">SMK N1 Sigumpar</h1>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
            <NavItem to="/" icon="🏠" label="Dashboard" />

            {visibleGroups.map((group) => {
              const active = group.items.some((item) => location.pathname.startsWith(item.to));
              const isOpen = open[group.key] || active;
              return (
                <NavGroup
                  key={group.key}
                  label={group.label}
                  icon={group.icon}
                  items={group.items}
                  active={active}
                  isOpen={isOpen}
                  onToggle={() => toggleGroup(group.key)}
                />
              );
            })}
          </nav>

          <div className="border-t border-slate-200 px-4 py-4 space-y-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
            </div>
            <button
              onClick={() => keycloak.logout()}
              className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center shadow-sm">
            <span className="text-sm font-semibold text-slate-700">Sistem Informasi Akademik</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pengumuman/:id" element={<DetailPengumuman />} />

              <Route path="/academic/kelas" element={<KelasPage />} />
              <Route path="/academic/siswa" element={<SiswaPage />} />
              <Route path="/academic/pengumuman" element={<PengumumanPage />} />
              <Route path="/academic/arsip-surat" element={<ArsipSuratPage />} />
              <Route path="/academic/mapel" element={<MapelPage />} />
              <Route path="/academic/jadwal" element={<JadwalPage />} />
              <Route path="/academic/piket" element={<PiketPage />} />
              <Route path="/academic/upacara" element={<UpacaraPage />} />

              <Route path="/absensi-guru" element={<AbsensiGuruPage />} />
              <Route path="/absensi-siswa" element={<AbsensiSiswa />} />
              <Route path="/perangkat-pembelajaran" element={<PerangkatPage />} />
              <Route path="/input-nilai" element={<InputNilaiPage />} />

              <Route path="/wali/absensi-siswa" element={<PresensiKelasPage />} />
              <Route path="/wali/rekap-kehadiran" element={<RekapKehadiranPage />} />
              <Route path="/wali/rekap-nilai" element={<RekapNilaiPage />} />
              <Route path="/wali/parenting" element={<ParentingPage />} />
              <Route path="/wali/kebersihan-kelas" element={<KebersihanKelasPage />} />
              <Route path="/wali/refleksi" element={<RefleksiPage />} />

              <Route path="/vocational/regu" element={<ReguPage />} />
              <Route path="/vocational/anggota-regu" element={<AnggotaReguPage />} />
              <Route path="/vocational/absensi" element={<AbsensiPramukaPage />} />
              <Route path="/pramuka/silabus" element={<SilabusKegiatanPage />} />
              <Route path="/pramuka/laporan" element={<LaporanKegiatanPage />} />

              <Route path="/vokasi/lokasi-pkl" element={<LokasiPKLPage />} />
              <Route path="/vokasi/progres-pkl" element={<ProgresPKLPage />} />
              <Route path="/vokasi/nilai-pkl" element={<NilaiPKLPage />} />

              <Route path="/kepsek/absensi-guru" element={<RekapAbsensiGuruPage />} />
              <Route path="/kepsek/absensi-siswa" element={<RekapAbsensiSiswaPage />} />
              <Route path="/kepsek/perangkat-ajar" element={<PemeriksaanPerangkatPage />} />
              <Route path="/kepsek/evaluasi-kinerja" element={<EvaluasiKinerjaPage />} />
              <Route path="/kepsek/pkl" element={<PKLKepsekPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
