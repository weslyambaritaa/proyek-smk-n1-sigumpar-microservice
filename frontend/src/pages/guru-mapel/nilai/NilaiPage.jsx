import React, { useState, useEffect } from 'react';
import { learningApi } from '../../../api/learningApi';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const TAHUN_AJAR = ['2023/2024', '2024/2025', '2025/2026'];
const MAPEL_LIST = [
  'Pemrograman Web',
  'Basis Data',
  'Pemrograman Berorientasi Objek',
  'Jaringan Komputer',
  'Matematika',
];

const NilaiPage = () => {
  // Filter state
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('Pemrograman Web');
  const [selectedTahun, setSelectedTahun] = useState('2023/2024');
  const [searchName, setSearchName] = useState('');

  // Data state
  const [nilaiRows, setNilaiRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Ambil daftar kelas dari academic-service
  useEffect(() => {
    axiosInstance.get('/api/academic/kelas')
      .then((res) => {
        setKelasList(res.data || []);
        if (res.data?.length > 0) setSelectedKelas(String(res.data[0].id));
      })
      .catch(() => toast.error('Gagal memuat data kelas'));
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) return toast.error('Pilih kelas terlebih dahulu');
    setLoading(true);
    setHasSearched(true);
    try {
      // 1. Ambil siswa dari academic-service
      const resSiswa = await axiosInstance.get('/api/academic/siswa');
      const siswaKelas = resSiswa.data.filter(
        (s) => String(s.kelas_id) === String(selectedKelas)
      );

      // 2. Ambil nilai yang sudah tersimpan
      const resNilai = await learningApi.getNilai(selectedKelas, selectedMapel, selectedTahun);
      const savedNilai = resNilai.data.data || [];

      // 3. Merge: siswa yang belum punya nilai → default 0
      const rows = siswaKelas.map((siswa) => {
        const existing = savedNilai.find((n) => n.siswa_id === siswa.id);
        return {
          siswa_id: siswa.id,
          nama_siswa: siswa.nama_lengkap,
          nis: siswa.nisn || '-',
          nilai_tugas:   existing ? Number(existing.nilai_tugas)   : 0,
          nilai_kuis:    existing ? Number(existing.nilai_kuis)    : 0,
          nilai_uts:     existing ? Number(existing.nilai_uts)     : 0,
          nilai_uas:     existing ? Number(existing.nilai_uas)     : 0,
          nilai_praktik: existing ? Number(existing.nilai_praktik) : 0,
          nilai_akhir:   existing ? Number(existing.nilai_akhir)   : 0,
        };
      });

      setNilaiRows(rows);
    } catch {
      toast.error('Gagal memuat data nilai');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchName('');
  };

  const handleNilaiChange = (idx, field, val) => {
    const updated = [...nilaiRows];
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    updated[idx] = { ...updated[idx], [field]: num };
    // Hitung nilai akhir otomatis
    const r = updated[idx];
    updated[idx].nilai_akhir = parseFloat(
      (r.nilai_tugas * 0.2 + r.nilai_kuis * 0.1 + r.nilai_uts * 0.3 + r.nilai_uas * 0.3 + r.nilai_praktik * 0.1).toFixed(2)
    );
    setNilaiRows(updated);
  };

  const handleSimpan = async () => {
    if (nilaiRows.length === 0) return toast.error('Tidak ada data untuk disimpan');
    const kelasObj = kelasList.find((k) => String(k.id) === String(selectedKelas));
    const payload = {
      kelas_id: selectedKelas,
      nama_kelas: kelasObj?.nama_kelas || '',
      mata_pelajaran: selectedMapel,
      tahun_ajar: selectedTahun,
      nilai: nilaiRows,
    };
    setSaving(true);
    const promise = learningApi.saveNilaiBatch(payload);
    toast.promise(promise, {
      loading: 'Menyimpan nilai...',
      success: 'Semua nilai berhasil disimpan!',
      error: 'Gagal menyimpan nilai',
    });
    try {
      await promise;
    } catch {}
    finally { setSaving(false); }
  };

  const kelasObj = kelasList.find((k) => String(k.id) === String(selectedKelas));
  const filteredRows = searchName.trim()
    ? nilaiRows.filter((r) => r.nama_siswa.toLowerCase().includes(searchName.toLowerCase()))
    : nilaiRows;

  const nilaiColor = (val) => {
    if (val >= 85) return 'text-green-600 font-bold';
    if (val >= 70) return 'text-blue-600 font-bold';
    return 'text-red-500 font-bold';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Input & Kelola Nilai</h1>
        <p className="text-gray-500 mt-1">Kelola nilai tugas, kuis, UTS, UAS, dan praktik siswa</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Mapel */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mapel</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {MAPEL_LIST.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          {/* Tahun Ajar */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tahun Ajar</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {TAHUN_AJAR.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Cari Nama */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cari Nama</label>
            <input
              type="text"
              placeholder="Ketik nama..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCari}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Tabel Nilai */}
      {hasSearched && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabel header info */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-700">
              Daftar Nilai – {kelasObj?.nama_kelas || ''}
            </h2>
            <span className="text-xs font-bold text-blue-600 uppercase">{selectedMapel}</span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Memuat data...</div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p>Tidak ada data siswa untuk kelas ini</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left w-8">No</th>
                      <th className="px-4 py-3 text-left min-w-48">Nama Siswa</th>
                      <th className="px-4 py-3 text-center w-24">Tugas</th>
                      <th className="px-4 py-3 text-center w-24">Kuis</th>
                      <th className="px-4 py-3 text-center w-24">UTS</th>
                      <th className="px-4 py-3 text-center w-24">UAS</th>
                      <th className="px-4 py-3 text-center w-24">Praktik</th>
                      <th className="px-4 py-3 text-center w-28">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRows.map((row, idx) => {
                      const realIdx = nilaiRows.findIndex((r) => r.siswa_id === row.siswa_id);
                      return (
                        <tr key={row.siswa_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800">{row.nama_siswa}</p>
                            <p className="text-xs text-gray-400">NIS. {row.nis}</p>
                          </td>
                          {['nilai_tugas', 'nilai_kuis', 'nilai_uts', 'nilai_uas', 'nilai_praktik'].map((field) => (
                            <td key={field} className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={row[field]}
                                onChange={(e) => handleNilaiChange(realIdx, field, e.target.value)}
                                className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                              />
                            </td>
                          ))}
                          <td className={`px-4 py-3 text-center text-base ${nilaiColor(row.nilai_akhir)}`}>
                            {row.nilai_akhir.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer pagination info + tombol simpan */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-400">
                  Halaman 1 dari 1 &nbsp;|&nbsp; {filteredRows.length} siswa
                </span>
                <button
                  onClick={handleSimpan}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NilaiPage;
