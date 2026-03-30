import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../../keycloak';
import { academicApi } from '../../api/academicApi';

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [pengumumanList, setPengumumanList] = useState([]);
  const navigate = useNavigate();

  // --- State untuk Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Logika Jam Real-time ---
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // --- Fetch Data Pengumuman ---
  useEffect(() => {
    const fetchPengumuman = async () => {
      try {
        const response = await academicApi.getAllPengumuman();
        setPengumumanList(response.data || []);
      } catch (error) {
        console.error("Gagal mengambil data pengumuman", error);
      }
    };
    fetchPengumuman();
  }, []);

  // --- Logika Perhitungan Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPengumuman = pengumumanList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pengumumanList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Data Pengguna dari Keycloak ---
  const userName = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Pengguna';
  const appRoles = ['kepala-sekolah', 'waka-sekolah', 'guru-mapel', 'wali-kelas', 'tata-usaha', 'pramuka', 'vokasi'];
  const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  
  const displayRoles = userRoles
    .filter(role => appRoles.includes(role))
    .map(role => role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

  // --- Format Tanggal ---
  const formatListDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Bagian Atas: Profil User & Jam */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang, {userName}</h1>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-500 text-sm font-medium">Role Anda:</span>
            <div className="flex flex-wrap gap-2">
              {displayRoles.length > 0 ? (
                displayRoles.map((role, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200 font-semibold">
                    {role}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-300 font-medium">
                  Pengguna Umum
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xl font-mono font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-inner tracking-wider">
          {formatTime(time)}
        </div>
      </div>

      {/* Bagian Bawah: Daftar Pengumuman (Bentuk List) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Pengumuman Terbaru</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* Ubah map agar memaparkan currentPengumuman sahaja */}
          {currentPengumuman.length > 0 ? (
            currentPengumuman.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/pengumuman/${item.id}`, { state: { pengumuman: item } })}
                className="flex flex-col md:flex-row gap-2 md:gap-8 p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                {/* Kolom Tanggal */}
                <div className="md:w-32 flex-shrink-0 pt-1">
                  <span className="text-sm font-medium text-gray-500">
                    {formatListDate(item.created_at || item.tanggal)}
                  </span>
                </div>
                
                {/* Kolom Konten */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.judul}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {item.isi || item.deskripsi}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              Belum ada pengumuman saat ini.
            </div>
          )}
        </div>

        {/* Kontrol Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
            <span className="text-sm text-gray-500">
              Memaparkan <span className="font-medium text-gray-700">{indexOfFirstItem + 1}</span> hingga <span className="font-medium text-gray-700">{Math.min(indexOfLastItem, pengumumanList.length)}</span> daripada <span className="font-medium text-gray-700">{pengumumanList.length}</span> pengumuman
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
                  currentPage === 1 
                    ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Sebelumnya
              </button>
              
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
                      currentPage === number
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
                  currentPage === totalPages 
                    ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;