import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
// import UsersPage from "./pages/UsersPage";
// import TodosPage from "./pages/TodosPage";
import KelasPage from "./pages/tata-usaha/kelas/KelasPage";
import SiswaPage from "./pages/tata-usaha/siswa/SiswaPage";
import keycloak, { hasRole } from "./keycloak";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import PengumumanPage from "./pages/tata-usaha/pengumuman/PengumumanPage";
import ArsipSuratPage from "./pages/tata-usaha/arsip-surat/ArsipSuratPage";

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
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
  // State untuk mengontrol dropdown mana yang sedang terbuka
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <BrowserRouter>
      {/* === TOAST NOTIFIKASI BESAR & DI TENGAH === */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Styling khusus agar toast lebih besar
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

          <nav className="flex-1 p-4 overflow-y-auto">
            {/* Dashboard umum */}
            <NavLink to="/" className={navClass}>
              🏠 Dashboard
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
                  <NavLink to="/laporan-tahunan" className={subNavClass}>
                    Laporan Tahunan
                  </NavLink>
                  {/* Tambah menu kepsek di sini */}
                </NavDropdown>
              )}

              {/* Dropdown Waka Sekolah */}
              {hasRole("waka-sekolah") && (
                <NavDropdown
                  title="Waka Sekolah"
                  icon="👨‍🏫"
                  isOpen={openMenus["waka"]}
                  onClick={() => toggleMenu("waka")}
                >
                  <NavLink to="/kurikulum" className={subNavClass}>
                    Kurikulum
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
                  <NavLink to="/presensi-kelas" className={subNavClass}>
                    Presensi Kelas
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
                  {/* <NavLink to="/users" className={subNavClass}>Data Siswa</NavLink>
                  <NavLink to="/todos" className={subNavClass}>Administrasi</NavLink> */}
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
                  <NavLink to="/nilai-pramuka" className={subNavClass}>
                    Nilai Pramuka
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
                  <NavLink to="/proyek-vokasi" className={subNavClass}>
                    Proyek Siswa
                  </NavLink>
                </NavDropdown>
              )}
            </div>
          </nav>

          {/* Profil User di Bawah Sidebar */}
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm font-semibold truncate">
              {keycloak.tokenParsed?.name}
            </p>
            <button
              onClick={() => keycloak.logout()}
              className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg text-xs hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* === KONTEN UTAMA === */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* <Route path="/users" element={<UsersPage />} />
            <Route path="/todos" element={<TodosPage />} /> */}
            <Route path="/academic/kelas" element={<KelasPage />} />
            <Route path="/academic/siswa" element={<SiswaPage />} />
            <Route path="/academic/pengumuman" element={<PengumumanPage />} />
            <Route path="/academic/arsip-surat" element={<ArsipSuratPage />} />
            {/* Route lainnya bisa ditambahkan di sini */}
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
