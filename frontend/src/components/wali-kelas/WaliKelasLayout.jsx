import { NavLink } from 'react-router-dom';
import keycloak from '../../keycloak';

const menuItems = [
  { to: '/wali-kelas', label: 'Beranda', end: true },
  { to: '/wali-kelas/rekap-kehadiran', label: 'Rekap Kehadiran' },
  { to: '/wali-kelas/rekap-nilai', label: 'Rekap Nilai' },
  { to: '/wali-kelas/parenting', label: 'Parenting' },
  { to: '/wali-kelas/kebersihan-kelas', label: 'Kebersihan Kelas' },
  { to: '/wali-kelas/refleksi', label: 'Refleksi' },
];

const WaliKelasLayout = ({ children }) => {
  const namaUser = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Wali Kelas';
  const fotoUser = keycloak.tokenParsed?.picture || null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-gray-200 flex flex-col sticky top-0 h-screen">
        {/* Label role */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs text-gray-500 font-medium">Wali Kelas</p>
        </div>

        {/* Nama sekolah */}
        <div className="px-4 pb-4 border-b border-gray-300">
          <h1 className="text-sm font-bold text-gray-800">SMKN 1 Sigumpar</h1>
        </div>

        {/* Foto & nama user */}
        <div className="flex flex-col items-center py-6 border-b border-gray-300">
          <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-400 mb-2">
            {fotoUser ? (
              <img src={fotoUser} alt={namaUser} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-gray-500">
                {namaUser.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-gray-700">{namaUser}</p>
        </div>

        {/* Menu navigasi */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-1.5 text-sm rounded transition-colors ${
                  isActive
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={() => keycloak.logout()}
            className="w-full py-2 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── KONTEN ── */}
      <div className="flex-1 flex flex-col">
        {/* Header biru */}
        <header className="bg-[#1a5fa8] text-white px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src="/favicon.svg" alt="Logo" className="w-8 h-8" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h1 className="text-xl font-bold tracking-wide">SMK NEGERI 1 SIGUMPAR</h1>
        </header>

        {/* Konten halaman */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default WaliKelasLayout;