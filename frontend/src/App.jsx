import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/layout/AppShell';
import { hasRole } from './keycloak';
import Dashboard from './pages/dashboard/Dashboard';
import DetailPengumuman from './pages/dashboard/DetailPengumuman';
import KelasPage from './pages/tata-usaha/kelas/KelasPage';
import SiswaPage from './pages/tata-usaha/siswa/SiswaPage';
import ArsipSuratPage from './pages/tata-usaha/arsip-surat/ArsipSuratPage';
import MapelPage from './pages/tata-usaha/mapel/MapelPage';
import PengumumanPage from './pages/tata-usaha/pengumuman/PengumumanPage';
import JadwalPage from './pages/tata-usaha/jadwal/JadwalPage';
import PiketPage from './pages/tata-usaha/piket/PiketPage';
import UpacaraPage from './pages/tata-usaha/upacara/UpacaraPage';
import InputNilaiPage from './pages/guru-mapel/InputNilaiPage';
import AbsensiSiswa from './pages/guru-mapel/absensi-siswa/AbsensiSiswa';
import AbsensiGuruPage from './pages/guru-mapel/AbsensiGuruPage';
import PerangkatPage from './pages/guru-mapel/perangkat/PerangkatPage';
import ReguPage from './pages/pramuka/regu/ReguPage';
import AnggotaReguPage from './pages/pramuka/anggota_regu/AnggotaReguPage';
import AbsensiPramukaPage from './pages/pramuka/absensi/AbsensiPramukaPage';
import AbsensiWaliPage from './pages/wali-kelas/AbsensiWaliPage';
import RekapNilaiWaliPage from './pages/wali-kelas/RekapNilaiWaliPage';
import ParentingPage from './pages/wali-kelas/ParentingPage';
import KebersihanPage from './pages/wali-kelas/KebersihanPage';
import RefleksiPage from './pages/wali-kelas/RefleksiPage';
import LokasiPklPage from './pages/vokasi/LokasiPklPage';
import ProgresPklPage from './pages/vokasi/ProgresPklPage';
import KepsekDashboardPage from './pages/kepala-sekolah/KepsekDashboardPage';
import EvaluasiGuruPage from './pages/kepala-sekolah/EvaluasiGuruPage';

const menuByRole = {
  'tata-usaha': [{ title: 'Tata Usaha', items: [
    { to: '/', label: 'Beranda', icon: '⌂' },
    { to: '/academic/siswa', label: 'Input Data Siswa', icon: '◫' },
    { to: '/academic/kelas', label: 'Input Data Guru', icon: '◫' },
    { to: '/academic/arsip-surat', label: 'Arsip Surat', icon: '▣' },
    { to: '/academic/jadwal', label: 'Jadwal Guru', icon: '▣' },
    { to: '/academic/upacara', label: 'Jadwal Upacara', icon: '▣' },
    { to: '/academic/piket', label: 'Jadwal Piket', icon: '▣' },
    { to: '/academic/pengumuman', label: 'Pengumuman', icon: '•' },
  ] }],
  'guru-mapel': [{ title: 'Guru Mapel', items: [
    { to: '/', label: 'Beranda', icon: '⌂' },
    { to: '/absensi-guru', label: 'Absensi Guru', icon: '◫' },
    { to: '/absensi-siswa', label: 'Absensi Siswa', icon: '◫' },
    { to: '/perangkat-pembelajaran', label: 'Perangkat Pembelajaran', icon: '▣' },
    { to: '/input-nilai', label: 'Input & Kelola Nilai', icon: '✓' },
  ] }],
  'wali-kelas': [{ title: 'Wali Kelas', items: [
    { to: '/', label: 'Beranda', icon: '⌂' },
    { to: '/wali-kelas/absensi-siswa', label: 'Absensi Siswa', icon: '◫' },
    { to: '/wali-kelas/rekap-nilai', label: 'Rekap Nilai', icon: '✓' },
    { to: '/wali-kelas/parenting', label: 'Parenting', icon: '•' },
    { to: '/wali-kelas/kebersihan', label: 'Kebersihan Kelas', icon: '•' },
    { to: '/wali-kelas/refleksi', label: 'Refleksi', icon: '•' },
  ] }],
  pramuka: [{ title: 'Pramuka', items: [
    { to: '/', label: 'Beranda', icon: '⌂' },
    { to: '/vocational/regu', label: 'Manajemen Regu', icon: '◫' },
    { to: '/vocational/anggota-regu', label: 'Plotting Anggota', icon: '◫' },
    { to: '/vocational/absensi', label: 'Absensi Pramuka', icon: '✓' },
  ] }],
  vokasi: [{ title: 'Guru Vokasi', items: [
    { to: '/', label: 'Beranda', icon: '⌂' },
    { to: '/vokasi/lokasi-pkl', label: 'Pelaporan Lokasi PKL', icon: '◫' },
    { to: '/vokasi/progres-pkl', label: 'Pelaporan Progres PKL', icon: '✓' },
  ] }],
  'kepala-sekolah': [{ title: 'Kepala Sekolah', items: [
    { to: '/', label: 'Beranda', icon: '⌂' },
    { to: '/absensi-guru', label: 'Absensi Guru', icon: '◫' },
    { to: '/absensi-siswa', label: 'Absensi Siswa', icon: '◫' },
    { to: '/perangkat-pembelajaran', label: 'Perangkat Ajar', icon: '▣' },
    { to: '/kepsek/evaluasi-guru', label: 'Evaluasi Kinerja Guru', icon: '✓' },
    { to: '/vokasi/progres-pkl', label: 'PKL', icon: '•' },
  ] }],
};

const firstRole = ['kepala-sekolah','vokasi','wali-kelas','guru-mapel','pramuka','tata-usaha'].find((r) => hasRole(r)) || 'tata-usaha';

export default function App(){
  const home = hasRole('kepala-sekolah') ? <KepsekDashboardPage /> : <Dashboard />;
  return <BrowserRouter><Toaster position="top-center" /><AppShell menuGroups={menuByRole[firstRole] || menuByRole['tata-usaha']}><Routes>
    <Route path="/" element={home} />
    <Route path="/pengumuman/:id" element={<DetailPengumuman />} />
    <Route path="/academic/kelas" element={<KelasPage />} />
    <Route path="/academic/siswa" element={<SiswaPage />} />
    <Route path="/academic/pengumuman" element={<PengumumanPage />} />
    <Route path="/academic/arsip-surat" element={<ArsipSuratPage />} />
    <Route path="/academic/mapel" element={<MapelPage />} />
    <Route path="/academic/jadwal" element={<JadwalPage />} />
    <Route path="/academic/piket" element={<PiketPage />} />
    <Route path="/academic/upacara" element={<UpacaraPage />} />
    <Route path="/input-nilai" element={<InputNilaiPage />} />
    <Route path="/absensi-siswa" element={<AbsensiSiswa />} />
    <Route path="/absensi-guru" element={<AbsensiGuruPage />} />
    <Route path="/perangkat-pembelajaran" element={<PerangkatPage />} />
    <Route path="/vocational/regu" element={<ReguPage />} />
    <Route path="/vocational/anggota-regu" element={<AnggotaReguPage />} />
    <Route path="/vocational/absensi" element={<AbsensiPramukaPage />} />
    <Route path="/wali-kelas/absensi-siswa" element={<AbsensiWaliPage />} />
    <Route path="/wali-kelas/rekap-nilai" element={<RekapNilaiWaliPage />} />
    <Route path="/wali-kelas/parenting" element={<ParentingPage />} />
    <Route path="/wali-kelas/kebersihan" element={<KebersihanPage />} />
    <Route path="/wali-kelas/refleksi" element={<RefleksiPage />} />
    <Route path="/vokasi/lokasi-pkl" element={<LokasiPklPage />} />
    <Route path="/vokasi/progres-pkl" element={<ProgresPklPage />} />
    <Route path="/kepsek/evaluasi-guru" element={<EvaluasiGuruPage />} />
  </Routes></AppShell></BrowserRouter>
}
