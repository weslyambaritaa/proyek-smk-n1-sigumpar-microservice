import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../../keycloak';
import { academicApi } from '../../api/academicApi';
import axiosInstance from '../../api/axiosInstance';

const ROLE_LABELS = {
  'kepala-sekolah': 'Kepala Sekolah',
  'guru-mapel':     'Guru Mapel',
  'wali-kelas':     'Wali Kelas',
  'tata-usaha':     'Tata Usaha',
  pramuka:          'Pembina Pramuka',
  vokasi:           'Guru Vokasi',
};

const ROLE_DESCRIPTIONS = {
  'kepala-sekolah': 'kepala sekolah',
  'guru-mapel':     'guru mata pelajaran',
  'wali-kelas':     'wali kelas',
  'tata-usaha':     'tata usaha',
  pramuka:          'pembina pramuka',
  vokasi:           'guru vokasi',
};

const Dashboard = () => {
  const [time,            setTime]            = useState(new Date());
  const [pengumumanList,  setPengumumanList]   = useState([]);
  const [statistik,       setStatistik]        = useState(null);
  const [currentPage,     setCurrentPage]      = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch pengumuman
  useEffect(() => {
  academicApi.getAllPengumuman()
    .then((r) => {
      const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setPengumumanList(data);
    })
    .catch(() => {
      setPengumumanList([]);
    });
}, []);

  // Fetch statistik (kepala sekolah only)
  useEffect(() => {
    const roles = keycloak.tokenParsed?.realm_access?.roles || [];
    if (roles.includes('kepala-sekolah')) {
      axiosInstance.get('/api/academic/kepsek/statistik')
        .then((r) => setStatistik(r.data?.data || null))
        .catch(() => {});
    }
  }, []);

  const formatTime = (d) =>
    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;

  const formatDate = (str) => {
    if (!str) return '';
    const d = new Date(str);
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
  };

  // User info
  const userName  = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Pengguna';
  const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  const appRoles  = Object.keys(ROLE_LABELS);
  const foundRole = appRoles.find((r) => userRoles.includes(r)) || '';
  const roleLabel = ROLE_LABELS[foundRole]    || 'Pengguna';
  const roleDesc  = ROLE_DESCRIPTIONS[foundRole] || 'pengguna';
  const initial   = userName.charAt(0).toUpperCase();

  // Pagination
 const safePengumumanList = Array.isArray(pengumumanList) ? pengumumanList : [];

const indexOfLast  = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentItems = safePengumumanList.slice(indexOfFirst, indexOfLast);
const totalPages   = Math.ceil(safePengumumanList.length / itemsPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Welcome + Clock ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Welcome card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-700">Selamat Datang</p>
            <p className="text-lg font-bold text-gray-900 truncate">{userName}</p>
            <p className="text-sm text-gray-500 mt-1">
              Anda login sebagai {roleDesc} pada sistem informasi SMK N 1 Sigumpar.
            </p>
          </div>
        </div>

        {/* Clock card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Waktu Sekarang</p>
          <p className="text-4xl font-bold font-mono text-gray-800 tracking-wider">{formatTime(time)}</p>
          <p className="text-sm text-gray-400 mt-2">
            {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Statistik (Kepala Sekolah only) ── */}
      {statistik && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Siswa', val: statistik.total_siswa, icon: '👥', color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Total Kelas', val: statistik.total_kelas, icon: '🏫', color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Total Guru',  val: statistik.total_guru,  icon: '👨‍🏫', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Mata Pelajaran', val: statistik.total_mapel, icon: '📚', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(({ label, val, icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-5 flex items-center gap-4`}>
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{val ?? '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pengumuman ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-base font-bold text-gray-800">Pengumuman Terbaru</h2>
          {pengumumanList.length > 0 && (
            <span className="text-xs font-semibold text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
              {pengumumanList.length} pengumuman
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/pengumuman/${item.id}`, { state: { pengumuman: item } })}
                className="flex gap-6 px-6 py-5 hover:bg-gray-50 cursor-pointer group transition-colors"
              >
                <div className="w-28 flex-shrink-0 pt-0.5">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(item.created_at || item.tanggal)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.isi || item.deskripsi}
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-300 group-hover:text-blue-400 transition-colors">
                  →
                </div>
              </div>
            ))
          ) : (
            <div className="py-14 text-center text-gray-400">
              <div className="text-4xl mb-3">📢</div>
              <p className="font-medium">Belum ada pengumuman aktif saat ini.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-xs text-gray-500">
              Menampilkan {indexOfFirst + 1}–{Math.min(indexOfLast, pengumumanList.length)} dari {pengumumanList.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
              >← Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setCurrentPage(n)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg border transition-colors ${
                    currentPage === n ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >{n}</button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
              >Selanjutnya →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
