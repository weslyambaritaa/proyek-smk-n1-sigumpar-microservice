import React, { useState, useEffect } from 'react';
import keycloak from '../keycloak';
import { academicApi } from '../api/academicApi';

const Dashboard = () => {
  // --- 1. State dan Logika Jam Real-time ---
  const [time, setTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Memperbarui jam setiap 1 detik (1000 ms)
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Membersihkan interval saat komponen ditutup agar tidak bocor memori
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data untuk role tertentu
  useEffect(() => {
    const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
    const privilegedRoles = ['kepala-sekolah', 'waka-sekolah', 'wali-kelas', 'guru-mapel'];

    // Hanya fetch data dashboard jika user memiliki role yang relevan
    if (userRoles.some(role => privilegedRoles.includes(role))) {
      setLoading(true);
      academicApi.getDashboard()
        .then(response => {
          setDashboardData(response.data);
        })
        .catch(error => {
          console.error('Error fetching dashboard data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // Format jam menjadi hh:mm:ss (menambahkan angka 0 di depan jika < 10)
  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // --- 2. Data Pengguna dari Keycloak ---
  const userName = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Pengguna';
  
  const appRoles = ['kepala-sekolah', 'waka-sekolah', 'guru-mapel', 'wali-kelas', 'tata-usaha', 'pramuka', 'vokasi'];
  const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  
  // Format nama role (contoh: "wali-kelas" menjadi "Wali Kelas")
  const displayRoles = userRoles
    .filter(role => appRoles.includes(role))
    .map(role => role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

  return (
    <div className="p-6 space-y-6">
      {/* Header dengan jam */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex justify-between items-start">
        
        {/* Bagian Kiri: Ucapan Selamat Datang & Role */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Selamat Datang,</h1>
          <h2 className="text-xl text-gray-600 mb-6">{userName}</h2>
          
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">Role Anda:</span>
            <div className="flex flex-wrap gap-2">
              {displayRoles.length > 0 ? (
                displayRoles.map((role, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm border border-gray-300 font-medium">
                    {role}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm border border-gray-300 font-medium">
                  Pengguna Umum
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Jam Real-time */}
        <div className="text-3xl font-mono font-semibold text-gray-800 bg-gray-50 px-5 py-3 rounded-lg border border-gray-200 shadow-inner tracking-widest">
          {formatTime(time)}
        </div>

      </div>

      {/* Dashboard Statistik - hanya tampil untuk role tertentu */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Siswa */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalSiswa || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">👨‍🎓</span>
              </div>
            </div>
          </div>

          {/* Total Guru */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Guru</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalGuru || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">👨‍🏫</span>
              </div>
            </div>
          </div>

          {/* Total Kelas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Kelas</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalKelas || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">🏫</span>
              </div>
            </div>
          </div>

          {/* Total Mata Pelajaran */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mata Pelajaran</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalMapel || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Memuat data dashboard...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;