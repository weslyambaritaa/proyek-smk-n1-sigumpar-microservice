import { useEffect, useState } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';
import toast from 'react-hot-toast';

// Komponen stat card kecil
const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm`}>
    <div className={`text-3xl p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// Badge kondisi kelas
const KondisiBadge = ({ kondisi }) => {
  const map = {
    sangat_baik: { label: 'Sangat Baik', cls: 'bg-green-100 text-green-700' },
    baik:        { label: 'Baik',        cls: 'bg-blue-100 text-blue-700'  },
    cukup:       { label: 'Cukup',       cls: 'bg-yellow-100 text-yellow-700' },
    kurang:      { label: 'Kurang',      cls: 'bg-red-100 text-red-700'    },
  };
  const { label, cls } = map[kondisi] || { label: kondisi, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
  );
};

const BerandaWaliKelas = () => {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ambil daftar kelas saat mount
  useEffect(() => {
    academicApi.getAllKelas()
      .then(res => {
        setKelasList(res.data);
        if (res.data.length > 0) setSelectedKelasId(String(res.data[0].id));
      })
      .catch(() => toast.error('Gagal memuat daftar kelas'));
  }, []);

  // Ambil data beranda setiap kali kelas berubah
  useEffect(() => {
    if (!selectedKelasId) return;
    setLoading(true);
    waliKelasApi.getBeranda(selectedKelasId)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Gagal memuat data beranda'))
      .finally(() => setLoading(false));
  }, [selectedKelasId]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Beranda Wali Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan kondisi kelas hari ini</p>
        </div>

        {/* Pilih Kelas */}
        <select
          value={selectedKelasId}
          onChange={e => setSelectedKelasId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {kelasList.map(k => (
            <option key={k.id} value={k.id}>
              {k.nama_kelas} — Tingkat {k.tingkat}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      )}

      {!loading && data && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Siswa"
              value={data.statistik.total_siswa}
              icon="🎓"
              color="bg-blue-50"
            />
            <StatCard
              label="Pertemuan Parenting Bulan Ini"
              value={data.statistik.parenting_bulan_ini}
              icon="👨‍👩‍👧"
              color="bg-purple-50"
            />
            <StatCard
              label="Rata-rata Skor Kebersihan"
              value={data.statistik.rata_rata_kebersihan
                ? `${data.statistik.rata_rata_kebersihan} / 100`
                : 'Belum ada'}
              icon="🧹"
              color="bg-green-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Refleksi Terbaru */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-4">📋 Refleksi Terbaru</h2>
              {data.refleksi_terbaru ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(data.refleksi_terbaru.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                    <KondisiBadge kondisi={data.refleksi_terbaru.kondisi_kelas} />
                  </div>
                  {data.refleksi_terbaru.hal_positif && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">✅ Hal Positif</p>
                      <p className="text-sm text-gray-600">{data.refleksi_terbaru.hal_positif}</p>
                    </div>
                  )}
                  {data.refleksi_terbaru.rencana_tindak_lanjut && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">📌 Rencana Tindak Lanjut</p>
                      <p className="text-sm text-gray-600">{data.refleksi_terbaru.rencana_tindak_lanjut}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada catatan refleksi</p>
              )}
            </div>

            {/* Pengumuman Terbaru */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-4">📢 Pengumuman Terbaru</h2>
              {data.pengumuman_terbaru.length > 0 ? (
                <div className="space-y-3">
                  {data.pengumuman_terbaru.map(p => (
                    <div key={p.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-gray-700">{p.judul}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.isi}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada pengumuman</p>
              )}
            </div>

            {/* Parenting Terbaru */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
              <h2 className="text-sm font-bold text-gray-700 mb-4">👨‍👩‍👧 Catatan Parenting Terbaru</h2>
              {data.parenting_terbaru.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                        <th className="pb-2 font-medium">Siswa</th>
                        <th className="pb-2 font-medium">Tanggal</th>
                        <th className="pb-2 font-medium">Topik</th>
                        <th className="pb-2 font-medium">Jenis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.parenting_terbaru.map(p => (
                        <tr key={p.id}>
                          <td className="py-2.5 font-medium text-gray-700">{p.nama_siswa}</td>
                          <td className="py-2.5 text-gray-500">
                            {new Date(p.tanggal).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-2.5 text-gray-600">{p.topik}</td>
                          <td className="py-2.5">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                              {p.jenis_komunikasi?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada catatan parenting</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BerandaWaliKelas;
