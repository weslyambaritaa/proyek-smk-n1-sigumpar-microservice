import React from 'react';
import { NavLink } from 'react-router-dom';
import keycloak, { hasRole } from '../../keycloak';

const roleGroups = [
  { key: 'kepala-sekolah', label: 'Kepala', path: '/' },
  { key: 'waka-sekolah', label: 'Wakil', path: '/' },
  { key: 'pramuka', label: 'Pembina', path: '/pramuka/regu' },
  { key: 'wali-kelas', label: 'Wali', path: '/wali-kelas/absensi-siswa' },
  { key: 'guru-mapel', label: 'Guru', path: '/guru-mapel/input-nilai' },
  { key: 'tata-usaha', label: 'Tata', path: '/academic/siswa' },
  { key: 'vokasi', label: 'Guru', path: '/vokasi/lokasi-pkl' },
];

const iconMap = {
  beranda: '⌂',
  data: '◫',
  nilai: '✓',
  laporan: '▣',
  settings: '•',
};

export default function AppShell({ menuGroups, children }) {
  const userName = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Pengguna';
  const firstInitial = userName?.trim()?.charAt(0)?.toUpperCase() || 'P';
  return (
    <div className="min-h-screen bg-[#f3f4f7] flex">
      <aside className="w-[280px] bg-[#0f4f86] text-white flex flex-col shadow-2xl">
        <div className="h-20 px-6 flex items-center justify-between bg-[#0d4678] border-b border-white/10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-white/90">Sistem Informasi</div>
            <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-white/90">Akademik</div>
          </div>
          <div className="text-3xl leading-none">≡</div>
        </div>

        <div className="px-6 py-5 bg-[#123f6a] border-b border-white/10">
          <div className="text-xs uppercase tracking-[0.2em] text-white/55 mb-2">Pengguna Aktif</div>
          <div className="font-bold text-2xl leading-tight">{userName}</div>
          <div className="mt-2 text-sm uppercase tracking-[0.2em] text-[#7eb4ff]">{(menuGroups?.[0]?.title || 'Pengguna').replace(/-/g, ' ')}</div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-2">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold tracking-[0.16em] uppercase transition ${isActive ? 'bg-white text-[#0f4f86] shadow-lg' : 'text-white/85 hover:bg-white/10'}`}
                >
                  <span className="w-6 text-center text-base">{item.icon || iconMap[item.iconKey] || '•'}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-white/10 p-4 bg-[#113f6c]">
            <div className="text-center text-[10px] uppercase tracking-[0.22em] text-white/50 mb-3 italic">SMK N 1 Sigumpar</div>
            <div className="grid grid-cols-2 gap-2">
              {roleGroups.map((role) => (
                <a key={role.key} href={role.path} className={`rounded-xl border px-3 py-2 text-center text-[11px] uppercase tracking-[0.16em] ${hasRole(role.key) ? 'bg-white text-[#0f4f86] border-white font-bold' : 'border-white/15 text-white/60'}`}>
                  {role.label}
                </a>
              ))}
            </div>
          </div>
          <button onClick={() => keycloak.logout()} className="mt-4 w-full rounded-2xl px-4 py-3 text-left text-sm font-bold tracking-[0.16em] uppercase text-[#ff8ca0] hover:bg-white/10">Keluar</button>
        </div>
      </aside>

      <section className="flex-1 min-w-0">
        <header className="h-20 bg-[#0f5b98] text-white flex items-center px-8 shadow-sm sticky top-0 z-20">
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-lg font-bold mr-4">{firstInitial}</div>
          <div className="text-4xl font-bold tracking-tight">SMK NEGERI 1 SIGUMPAR</div>
        </header>
        <main className="p-8">{children}</main>
      </section>
    </div>
  );
}
