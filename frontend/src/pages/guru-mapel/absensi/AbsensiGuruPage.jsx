import React, { useState, useEffect, useRef } from 'react';
import { learningApi } from '../../../api/learningApi';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import keycloak from '../../../keycloak';

const AbsensiGuruPage = () => {
  const guruId = keycloak.tokenParsed?.sub;

  const [data, setData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    status: '',
    keterangan: '',
    bukti_foto_url: '',
  });

  const fileInputRef = useRef();

  const fetchData = async () => {
    try {
      if (!guruId) {
        console.warn('guruId tidak tersedia');
        return;
      }
      const res = await learningApi.getAbsensiGuru({
        guru_id: guruId,
        bulan: selectedMonth,
        tahun: selectedYear,
      });
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching absensi guru:', err);
      // Jangan tampilkan error toast untuk first load
      if (data.length > 0) {
        toast.error('Gagal memuat data absensi');
      }
      setData([]);
    }
  };

  useEffect(() => {
    if (!guruId) {
      console.warn('Waiting for guruId to be available');
      return;
    }
    fetchData();
  }, [guruId, selectedMonth, selectedYear]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file harus JPG, PNG, atau GIF');
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5 MB');
      return;
    }

    // Simulasi upload (dalam aplikasi real, upload ke storage service)
    setFormData(prev => ({
      ...prev,
      bukti_foto_url: `/uploads/${file.name}`
    }));
  };

  const handleSubmit = async () => {
    if (!guruId) {
      toast.error('Guru ID tidak tersedia. Silakan login kembali.');
      return;
    }
    
    if (!formData.tanggal || !formData.status) {
      toast.error('Tanggal dan status kehadiran wajib diisi!');
      return;
    }

    if (formData.status === 'Sakit' && !formData.keterangan) {
      toast.error('Keterangan wajib diisi jika status Sakit');
      return;
    }

    if (formData.status === 'Izin' && !formData.keterangan) {
      toast.error('Keterangan wajib diisi jika status Izin');
      return;
    }

    const promise = learningApi.saveAbsensiGuru({
      guru_id: guruId,
      tanggal: formData.tanggal,
      status: formData.status,
      keterangan: formData.keterangan || null,
      bukti_foto_url: formData.bukti_foto_url || null,
    });

    toast.promise(promise, {
      loading: 'Menyimpan absensi...',
      success: 'Absensi berhasil disimpan!',
      error: 'Gagal menyimpan absensi.',
    }).then(() => {
      setIsFormOpen(false);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        status: '',
        keterangan: '',
        bukti_foto_url: '',
      });
      fetchData();
    }).catch((err) => {
      console.error('Error saving:', err);
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Yakin ingin menghapus absensi ini?')) return;

    const promise = learningApi.deleteAbsensiGuru(id);
    toast.promise(promise, {
      loading: 'Menghapus...',
      success: 'Absensi berhasil dihapus!',
      error: 'Gagal menghapus absensi.',
    }).then(() => {
      fetchData();
    }).catch((err) => {
      console.error('Error deleting:', err);
    });
  };

  const statusColors = {
    'Hadir': 'bg-green-100 text-green-800',
    'Sakit': 'bg-yellow-100 text-yellow-800',
    'Alpa': 'bg-red-100 text-red-800',
    'Izin': 'bg-blue-100 text-blue-800',
  };

  const BULAN = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Debug: tampilkan warning jika guruId tidak tersedia
  if (!guruId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">⚠️ Menunggu data autentikasi... Silakan refresh halaman jika masalah berlanjut.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Absensi Mandiri Guru</h1>
          <p className="text-sm text-gray-500 mt-1">Batas waktu pengiriman absensi adalah pukul 07-30 WIB</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>+ Tambah Absensi</Button>
      </div>

      {/* Filter Bulan & Tahun */}
      <div className="flex gap-3 mb-6">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-200"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {BULAN.map((bulan, idx) => (
            idx > 0 && <option key={idx} value={idx}>{bulan}</option>
          ))}
        </select>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-200"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {[2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.filter(d => d.status === 'Hadir').length}
          </div>
          <div className="text-xs text-gray-600 mt-1">HADIR</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter(d => d.status === 'Sakit').length}
          </div>
          <div className="text-xs text-gray-600 mt-1">SAKIT</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.filter(d => d.status === 'Izin').length}
          </div>
          <div className="text-xs text-gray-600 mt-1">IZIN</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {data.filter(d => d.status === 'Alpa').length}
          </div>
          <div className="text-xs text-gray-600 mt-1">ALPA</div>
        </div>
      </div>

      {/* Tabel Absensi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Keterangan</th>
              <th className="px-6 py-4">Bukti Foto</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Belum ada data absensi
                </td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {item.keterangan || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {item.bukti_foto_url ? (
                      <a href={item.bukti_foto_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Lihat Foto
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Absensi</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-sm"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status Kehadiran <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="">-- Pilih Status --</option>
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Keterangan / Catatan
                </label>
                <textarea
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-sm"
                  placeholder="Tulis alasan jika izin/sakit..."
                  rows={3}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Unggah Bukti Foto (Selfie)
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-gray-400 text-sm">
                    {formData.bukti_foto_url ? (
                      <div className="text-green-600 font-semibold">✓ File terpilih</div>
                    ) : (
                      <>
                        <div className="text-2xl mb-1">📸</div>
                        <div>Klik untuk ambil foto atau unggah</div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsFormOpen(false);
                  setFormData({
                    tanggal: new Date().toISOString().split('T')[0],
                    status: '',
                    keterangan: '',
                    bukti_foto_url: '',
                  });
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Kirim Absensi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsensiGuruPage;
