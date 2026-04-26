import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';
// ✅ Sesuai struktur folder: nilai/dialog/DetailNilaiDialog.jsx
import DetailNilaiDialog from './dialog/DetailNilaiDialog';

const RekapNilaiPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKelasLoaded, setIsKelasLoaded] = useState(false);

  // Filter state
  const [filterSemester, setFilterSemester] = useState('');
  const [filterMapel, setFilterMapel] = useState('');
  const [filterNama, setFilterNama] = useState('');
  const [searchNama, setSearchNama] = useState('');

  // Dialog detail
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const semesterOptions = ['Ganjil', 'Genap'];
  const [mapelOptions, setMapelOptions] = useState([]);

  // 🔹 Fetch daftar kelas
  useEffect(() => {
    const loadKelas = async () => {
      try {
        const res = await academicApi.getAllKelas();
        const kelasData = res.data || [];
        setKelasList(kelasData);
        if (kelasData.length > 0) {
          setSelectedKelasId(String(kelasData[0].id));
        } else {
          toast.error('Daftar kelas kosong');
        }
      } catch (err) {
        console.error('Gagal memuat daftar kelas:', err);
        toast.error('Gagal memuat daftar kelas');
      } finally {
        setIsKelasLoaded(true);
      }
    };
    loadKelas();
  }, []);

  // 🔹 Fetch rekap nilai ketika kelas berubah
  useEffect(() => {
    if (selectedKelasId) {
      fetchData();
    }
  }, [selectedKelasId]);

  const fetchData = () => {
    setLoading(true);
    waliKelasApi
      .getRekapNilai(selectedKelasId)
      .then((res) => {
        const nilaiData = res.data?.data || [];
        setData(nilaiData);

        // Kumpulkan daftar mapel unik dari data
        const mapelSet = new Set();
        nilaiData.forEach((siswa) => {
          (siswa.nilai || []).forEach((n) => mapelSet.add(n.nama_mapel));
        });
        setMapelOptions([...mapelSet]);
      })
      .catch((err) => {
        console.error('Gagal memuat rekap nilai:', err.response?.data || err);
        toast.error('Gagal memuat rekap nilai');
      })
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    setFilterSemester('');
    setFilterMapel('');
    setFilterNama('');
    setSearchNama('');
  };

  const handleSearch = () => {
    setSearchNama(filterNama);
  };

  // Filter data lokal berdasarkan nama
  const filteredData = data.filter((siswa) => {
    if (!searchNama) return true;
    return siswa.nama_siswa?.toLowerCase().includes(searchNama.toLowerCase());
  });

  const selectedKelas = kelasList.find((k) => String(k.id) === selectedKelasId);

  const openDetail = (siswa) => {
    setSelectedSiswa(siswa);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekap Nilai</h1>
          {selectedKelas ? (
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              Wali Kelas | {selectedKelas.nama_kelas}
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-0.5">
              {isKelasLoaded ? 'Pilih kelas dari dropdown →' : 'Memuat daftar kelas...'}
            </p>
          )}
        </div>

        {/* Dropdown Kelas */}
        <select
          value={selectedKelasId}
          onChange={(e) => setSelectedKelasId(e.target.value)}
          disabled={!isKelasLoaded || kelasList.length === 0}
          className={`border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${!isKelasLoaded || kelasList.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          {!isKelasLoaded ? (
            <option value="">Memuat kelas...</option>
          ) : kelasList.length === 0 ? (
            <option value="">Tidak ada kelas</option>
          ) : (
            kelasList.map((k) => (
              <option key={k.id} value={String(k.id)}>
                {k.nama_kelas}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Filter</p>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Semester */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Sem
            </label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Pilih</option>
              {semesterOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Mapel */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Mapel
            </label>
            <select
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Pilih</option>
              {mapelOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Nama Siswa */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Nama Mahasiswa
            </label>
            <input
              type="text"
              value={filterNama}
              onChange={(e) => setFilterNama(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Masukkan Nama"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Cari
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Tabel Daftar Siswa */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Daftar Siswa
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">Belum ada data nilai siswa</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 font-semibold">No</th>
                <th className="px-6 py-3 font-semibold">Nama Siswa</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((siswa, idx) => (
                <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{siswa.nama_siswa}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openDetail(siswa)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold uppercase"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog Detail Nilai */}
      <DetailNilaiDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        siswa={selectedSiswa}
        filterSemester={filterSemester}
        filterMapel={filterMapel}
      />
    </div>
  );
};

export default RekapNilaiPage;