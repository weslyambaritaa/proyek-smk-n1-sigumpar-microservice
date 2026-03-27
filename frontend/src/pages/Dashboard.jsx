import React, { useState, useEffect } from 'react';
import keycloak from '../keycloak';

const Dashboard = () => {
  // --- 1. State dan Logika Jam Real-time ---
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Memperbarui jam setiap 1 detik (1000 ms)
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Membersihkan interval saat komponen ditutup agar tidak bocor memori
    return () => clearInterval(timer);
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
    <div className="p-6">
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
    </div>
  );
};

export default Dashboard;