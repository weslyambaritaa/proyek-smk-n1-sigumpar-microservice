import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useState } from "react";
import KelasPage from "./pages/tata-usaha/kelas/KelasPage";
import PerangkatPage from "./pages/guru-mapel/perangkat/PerangkatPage";
import NilaiPage from "./pages/guru-mapel/nilai/NilaiPage";
import keycloak, { hasRole } from "./keycloak";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";

const NavDropdown = ({ title, icon, children, isOpen, onClick }) => (
  <div className="mb-1">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
    >
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <span className={`text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
        ▼
      </span>
    </button>
    {isOpen && (
      <div className="ml-9 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-1">
        {children}
      </div>
    )}
  </div>
);

const App = () => {
  const [openMenus, setOpenMenus] = useState({ guru: true });

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
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
            boxShadow: "0 20px 25px -5px rgba(0,0,0,.1),0 10px 10px -5px rgba(0,0,0,.04)",
          },
          success: { duration: 3000 },
          error:   { duration: 4000 },
        }}
      />

      <div className="flex min-h-screen bg-gray-50">
        {/* ── SIDEBAR ── */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
          {/* Header biru */}
          <div className="p-5 border-b border-blue-800 bg-blue-700">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-0.5">
              Sistem Informasi Akademik
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              SMK Negeri 1 Sigumpar
            </h1>
          </div>

          {/* Info user */}
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
            <p className="text-xs text-blue-400 font-semibold uppercase">Pengguna Aktif</p>
            <p className="text-sm font-bold text-blue-800 truncate">
              {keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username}
            </p>
            <p className="text-xs text-blue-500 capitalize">
              {(keycloak.tokenParsed?.realm_access?.roles || [])
                .find((r) =>
                  ["kepala-sekolah","waka-sekolah","guru-mapel","wali-kelas","tata-usaha","pramuka","vokasi"].includes(r)
                )
                ?.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Pengguna"}
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 overflow-y-auto space-y-1">
            <NavLink to="/" className={navClass}>
              🏠 Beranda
            </NavLink>

            {hasRole("kepala-sekolah") && (
              <NavDropdown title="Kepala Sekolah" icon="👨‍💼"
                isOpen={openMenus["kepsek"]} onClick={() => toggleMenu("kepsek")}>
                <NavLink to="/laporan-tahunan" className={subNavClass}>Laporan Tahunan</NavLink>
              </NavDropdown>
            )}

            {hasRole("waka-sekolah") && (
              <NavDropdown title="Waka Sekolah" icon="👨‍🏫"
                isOpen={openMenus["waka"]} onClick={() => toggleMenu("waka")}>
                <NavLink to="/kurikulum" className={subNavClass}>Kurikulum</NavLink>
              </NavDropdown>
            )}

            {/* ── GURU MAPEL ── */}
            {hasRole("guru-mapel") && (
              <NavDropdown title="Guru Mapel" icon="📝"
                isOpen={openMenus["guru"]} onClick={() => toggleMenu("guru")}>
                <NavLink to="/guru/perangkat-pembelajaran" className={subNavClass}>
                  Perangkat Pembelajaran
                </NavLink>
                <NavLink to="/guru/input-nilai" className={subNavClass}>
                  Input & Kelola Nilai
                </NavLink>
              </NavDropdown>
            )}

            {hasRole("wali-kelas") && (
              <NavDropdown title="Wali Kelas" icon="🏫"
                isOpen={openMenus["walas"]} onClick={() => toggleMenu("walas")}>
                <NavLink to="/presensi-kelas" className={subNavClass}>Presensi Kelas</NavLink>
              </NavDropdown>
            )}

            {hasRole("tata-usaha") && (
              <NavDropdown title="Tata Usaha" icon="📂"
                isOpen={openMenus["tu"]} onClick={() => toggleMenu("tu")}>
                <NavLink to="/academic/kelas" className={subNavClass}>Data Kelas</NavLink>
              </NavDropdown>
            )}

            {hasRole("pramuka") && (
              <NavDropdown title="Pramuka" icon="⛺"
                isOpen={openMenus["pramuka"]} onClick={() => toggleMenu("pramuka")}>
                <NavLink to="/nilai-pramuka" className={subNavClass}>Nilai Pramuka</NavLink>
              </NavDropdown>
            )}

            {hasRole("vokasi") && (
              <NavDropdown title="Vokasi" icon="🛠️"
                isOpen={openMenus["vokasi"]} onClick={() => toggleMenu("vokasi")}>
                <NavLink to="/proyek-vokasi" className={subNavClass}>Proyek Siswa</NavLink>
              </NavDropdown>
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => keycloak.logout()}
              className="w-full bg-red-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* ── KONTEN ── */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/"                          element={<Dashboard />} />
            <Route path="/academic/kelas"            element={<KelasPage />} />
            <Route path="/guru/perangkat-pembelajaran" element={<PerangkatPage />} />
            <Route path="/guru/input-nilai"          element={<NilaiPage />} />

            {/* ── Redirect dari route lama ── */}
            <Route path="/input-nilai"               element={<Navigate to="/guru/input-nilai" replace />} />
            <Route path="/perangkat-pembelajaran"    element={<Navigate to="/guru/perangkat-pembelajaran" replace />} />
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
