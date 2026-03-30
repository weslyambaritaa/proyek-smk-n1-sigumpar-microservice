import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import KelasPage from "./pages/tata-usaha/kelas/KelasPage";
import SiswaPage from "./pages/tata-usaha/siswa/SiswaPage";
import keycloak, { hasRole } from "./keycloak";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import PengumumanPage from "./pages/tata-usaha/pengumuman/PengumumanPage";
import NilaiPage from "./pages/guru-mapel/nilai/NilaiPage";
import ArsipSuratPage from "./pages/tata-usaha/arsip-surat/ArsipSuratPage";
import MapelPage from "./pages/tata-usaha/mapel/MapelPage";
import JadwalPage from "./pages/tata-usaha/jadwal/JadwalPage";
import PiketPage from "./pages/tata-usaha/piket/PiketPage";
import UpacaraPage from "./pages/tata-usaha/upacara/UpacaraPage";

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
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
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

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <BrowserRouter>
      <Toaster position="top-center" />

      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-white border-r flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-blue-600">SMK N1 Sigumpar</h1>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <NavLink to="/" className={navClass}>
              🏠 Dashboard
            </NavLink>

            {hasRole("guru-mapel") && (
              <NavDropdown
                title="Guru Mapel"
                icon="📝"
                isOpen={openMenus.guru}
                onClick={() => toggleMenu("guru")}
              >
                <NavLink to="/input-nilai" className={subNavClass}>
                  Input Nilai
                </NavLink>
              </NavDropdown>
            )}

            {hasRole("tata-usaha") && (
              <NavDropdown
                title="Tata Usaha"
                icon="📂"
                isOpen={openMenus.tu}
                onClick={() => toggleMenu("tu")}
              >
                <NavLink to="/academic/kelas" className={subNavClass}>
                  Data Kelas
                </NavLink>
                <NavLink to="/academic/siswa" className={subNavClass}>
                  Data Siswa
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
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm font-semibold truncate">
              {keycloak.tokenParsed?.name}
            </p>
            <button
              onClick={() => keycloak.logout()}
              className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg text-xs"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/academic/kelas" element={<KelasPage />} />
            <Route path="/academic/siswa" element={<SiswaPage />} />
            <Route path="/academic/pengumuman" element={<PengumumanPage />} />
            <Route path="/input-nilai" element={<NilaiPage />} />
            <Route path="/academic/arsip-surat" element={<ArsipSuratPage />} />
            <Route path="/academic/mapel" element={<MapelPage />} />
            <Route path="/academic/jadwal" element={<JadwalPage />} />
            <Route path="/academic/piket" element={<PiketPage />} />
            <Route path="/academic/upacara" element={<UpacaraPage />} />
            <Route path="/input-nilai" element={<NilaiPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

const navClass = ({ isActive }) =>
  `flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold mb-1
   ${isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`;

const subNavClass = ({ isActive }) =>
  `block px-4 py-2 text-xs rounded-lg
   ${isActive ? "text-blue-600 bg-blue-50 font-bold" : "text-gray-500 hover:bg-gray-50"}`;

export default App;
