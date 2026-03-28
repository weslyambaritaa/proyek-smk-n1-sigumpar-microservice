import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import KelasPage from "./pages/tata-usaha/kelas/KelasPage";
import keycloak, { hasRole } from "./keycloak";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";

// ── Import halaman Wali Kelas ────────────────────────────────────────────────
import WaliKelasLayout from "./components/wali-kelas/WaliKelasLayout";
import BerandaWaliKelas from "./pages/wali-kelas/BerandaWaliKelas";
import RekapKehadiranPage from "./pages/wali-kelas/rekap-kehadiran/RekapKehadiranPage";
import RekapNilaiPage from "./pages/wali-kelas/rekap-nilai/RekapNilaiPage";
import ParentingPage from "./pages/wali-kelas/parenting/ParentingPage";
import KebersihanKelasPage from "./pages/wali-kelas/kebersihan-kelas/KebersihanKelasPage";
import RefleksiPage from "./pages/wali-kelas/refleksi/RefleksiPage";

const NavDropdown = ({ title, icon, children, isOpen, onClick }) => (
  <div className="mb-2">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
    >
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
    </button>
    {isOpen && (
      <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100">{children}</div>
    )}
  </div>
);

// Wrapper: layout wali kelas + halaman di dalamnya
const WaliKelasRoute = ({ children }) => (
  <WaliKelasLayout>{children}</WaliKelasLayout>
);

const App = () => {
  const [openMenus, setOpenMenus] = useState({});
  const toggleMenu = (menuName) =>
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));

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
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />

      <Routes>
        {/* ── Route Wali Kelas (layout sendiri) ── */}
        <Route
          path="/wali-kelas"
          element={<WaliKelasRoute><BerandaWaliKelas /></WaliKelasRoute>}
        />
        <Route
          path="/wali-kelas/rekap-kehadiran"
          element={<WaliKelasRoute><RekapKehadiranPage /></WaliKelasRoute>}
        />
        <Route
          path="/wali-kelas/rekap-nilai"
          element={<WaliKelasRoute><RekapNilaiPage /></WaliKelasRoute>}
        />
        <Route
          path="/wali-kelas/parenting"
          element={<WaliKelasRoute><ParentingPage /></WaliKelasRoute>}
        />
        <Route
          path="/wali-kelas/kebersihan-kelas"
          element={<WaliKelasRoute><KebersihanKelasPage /></WaliKelasRoute>}
        />
        <Route
          path="/wali-kelas/refleksi"
          element={<WaliKelasRoute><RefleksiPage /></WaliKelasRoute>}
        />

        {/* ── Route Umum (layout utama dengan sidebar global) ── */}
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-gray-50">
              <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-gray-100">
                  <h1 className="text-xl font-bold text-blue-600">SMK N1 Sigumpar</h1>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                  <NavLink to="/" className={navClass}>🏠 Dashboard</NavLink>
                  <div className="mt-4 space-y-1">
                    {hasRole("wali-kelas") && (
                      <NavDropdown title="Wali Kelas" icon="🏫" isOpen={openMenus["walas"]} onClick={() => toggleMenu("walas")}>
                        <NavLink to="/wali-kelas" className={subNavClass} end>Beranda</NavLink>
                        <NavLink to="/wali-kelas/rekap-kehadiran" className={subNavClass}>Rekap Kehadiran</NavLink>
                        <NavLink to="/wali-kelas/rekap-nilai" className={subNavClass}>Rekap Nilai</NavLink>
                        <NavLink to="/wali-kelas/parenting" className={subNavClass}>Parenting</NavLink>
                        <NavLink to="/wali-kelas/kebersihan-kelas" className={subNavClass}>Kebersihan Kelas</NavLink>
                        <NavLink to="/wali-kelas/refleksi" className={subNavClass}>Refleksi</NavLink>
                      </NavDropdown>
                    )}
                    {hasRole("tata-usaha") && (
                      <NavDropdown title="Tata Usaha" icon="📂" isOpen={openMenus["tu"]} onClick={() => toggleMenu("tu")}>
                        <NavLink to="/academic/kelas" className={subNavClass}>Data Kelas</NavLink>
                      </NavDropdown>
                    )}
                  </div>
                </nav>
                <div className="p-4 border-t bg-gray-50">
                  <p className="text-sm font-semibold truncate">{keycloak.tokenParsed?.name}</p>
                  <button onClick={() => keycloak.logout()} className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg text-xs hover:bg-red-600 transition-colors">
                    Logout
                  </button>
                </div>
              </aside>
              <main className="flex-1 p-8 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/academic/kelas" element={<KelasPage />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const navClass = ({ isActive }) =>
  `flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 ${
    isActive ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
  }`;

const subNavClass = ({ isActive }) =>
  `block px-4 py-2 text-xs font-medium rounded-lg transition-all ${
    isActive ? "text-blue-600 bg-blue-50 font-bold" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
  }`;

export default App;