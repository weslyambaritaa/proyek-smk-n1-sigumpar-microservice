import { useEffect, useState } from 'react';
import keycloak from '../../../keycloak';
import axiosInstance from '../../../api/axiosInstance';

const BerandaWaliKelas = () => {
  const namaUser = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Wali Kelas';
  const [pengumuman, setPengumuman] = useState([]);

  useEffect(() => {
    // Ambil pengumuman dari academic-service
    axiosInstance.get('/api/academic/pengumuman')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setPengumuman(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Fallback data dummy jika endpoint belum ada
        setPengumuman([
          { id: 1, judul: 'Pengumuman Kenaikan Pangkat Guru Maret 2026' },
          { id: 2, judul: 'Pembaruan Data Kepegawaian Semester Genap' },
          { id: 3, judul: 'Imbauan Ketertiban dan Disiplin Sekolah' },
        ]);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Selamat datang */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">
          Selamat Datang {namaUser}!
        </h2>
      </div>

      {/* Pengumuman */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pengumuman</h2>
        {pengumuman.length === 0 ? (
          <p className="text-sm text-gray-400">Tidak ada pengumuman saat ini.</p>
        ) : (
          <ul className="space-y-2">
            {pengumuman.map((item) => (
              <li key={item.id} className="text-sm text-gray-600">
                {item.judul}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BerandaWaliKelas;