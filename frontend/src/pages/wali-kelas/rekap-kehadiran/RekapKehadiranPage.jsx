import { useState, useEffect, useCallback } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import toast from 'react-hot-toast';

const SEMESTER_OPTIONS = ['Ganjil', 'Genap'];

const RekapKehadiranPage = () => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);

  // State filter
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [inputSearch, setInputSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSemester) params.semester = filterSemester;
      if (filterSearch) params.search = filterSearch;

      const res = await waliKelasApi.getAllRekapKehadiran(params);
      setData(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Gagal memuat data rekap kehadiran');
    } finally {
      setLoading(false);
    }
  }, [filterSemester, filterSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCari = () => {
    setFilterSearch(inputSearch);
  };

  const handleReset = () => {
    setFilterSemester('');
    setInputSearch('');
    setFilterSearch('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Rekap Kehadiran</h1>

      {/* ── Filter Card ── */}
      <div className="bg-white rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filter</h2>
        <div className="flex flex-wrap items-end gap-4">
          {/* Semester */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Pilih</option>
              {SEMESTER_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Nama Siswa */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Siswa</label>
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCari()}
              placeholder="Masukkan Nama"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <button
            onClick={handleCari}
            className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cari
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Statistik Ringkasan ── */}
      {meta.totalSiswa !== undefined && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-500 font-semibold">Total Siswa</p>
            <p className="text-2xl font-bold text-blue-700">{meta.totalSiswa}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
            <p className="text-xs text-green-500 font-semibold">Rata-rata Kehadiran</p>
            <p className="text-2xl font-bold text-green-700">{meta.rataRataKehadiran}%</p>
          </div>
        </div>
      )}

      {/* ── Tabel Rekapan ── */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Tabel Rekapan</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data ditemukan.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Nama</th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Hadir</th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Izin</th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Sakit</th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Alpa</th>
                </tr>
              </thead>
              <tbody>
                {data.map((siswa, idx) => (
                  <tr key={siswa.id} className={idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">
                      {siswa.namaSiswa}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">
                      {siswa.totalHadir}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">
                      {siswa.totalIzin}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">
                      {siswa.totalSakit}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-800">
                      {siswa.totalAlpa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RekapKehadiranPage;