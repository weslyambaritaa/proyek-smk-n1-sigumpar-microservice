import { useState, useEffect, useCallback } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import toast from 'react-hot-toast';
import DetailNilaiModal from './DetailNilaiModal';

const SEMESTER_OPTIONS = ['Ganjil', 'Genap'];

const RekapNilaiPage = () => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);

  // Filter
  const [filterSemester, setFilterSemester] = useState('');
  const [inputSearch, setInputSearch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSemester) params.semester = filterSemester;
      if (filterSearch) params.search = filterSearch;

      const res = await waliKelasApi.getAllRekapNilai(params);
      setData(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Gagal memuat data rekap nilai');
    } finally {
      setLoading(false);
    }
  }, [filterSemester, filterSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCari = () => setFilterSearch(inputSearch);
  const handleReset = () => {
    setFilterSemester('');
    setInputSearch('');
    setFilterSearch('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Rekap Nilai</h1>

      {/* ── Filter ── */}
      <div className="bg-white rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filter</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sem</label>
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

          <button onClick={handleCari} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">Cari</button>
          <button onClick={handleReset} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">Reset</button>
        </div>
      </div>

      {/* ── Tabel ── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data ditemukan.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">No</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Nama Siswa</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Rata-rata</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Peringkat</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((siswa, idx) => (
                <tr key={siswa.id} className={idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{idx + 1}</td>
                  <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{siswa.namaSiswa}</td>
                  <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{siswa.rataRata}</td>
                  <td className="px-6 py-4 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{siswa.peringkat}</td>
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    <button
                      onClick={() => setSelectedSiswa(siswa)}
                      className="text-blue-600 text-sm hover:underline font-medium"
                    >
                      detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Detail Nilai ── */}
      {selectedSiswa && (
        <DetailNilaiModal siswa={selectedSiswa} onClose={() => setSelectedSiswa(null)} />
      )}
    </div>
  );
};

export default RekapNilaiPage;