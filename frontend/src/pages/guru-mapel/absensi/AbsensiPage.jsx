import React, { useState, useEffect } from 'react';
import { learningApi } from '../../../api/learningApi';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import keycloak from '../../../keycloak';

const NAMA_BULAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const AbsensiPage = () => {
  const guruId = keycloak.tokenParsed?.sub;

  // Step: 'pilih' | 'absen' | 'hasil'
  const [step, setStep] = useState('pilih');

  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]); // dari academic-service
  const [siswaDiKelas, setSiswaDiKelas] = useState([]);

  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  const [absensiMap, setAbsensiMap] = useState({}); // { siswa_id: 'Hadir'|'Sakit'|'Alpa' }
  const [hasilAbsensi, setHasilAbsensi] = useState([]);

  // Tab rekap
  const [showRekap, setShowRekap] = useState(false);
  const [rekapData, setRekapData] = useState([]);

  // Filter untuk rekap
  const [filterNamaSiswa, setFilterNamaSiswa] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');

  useEffect(() => {
    if (!guruId) return;
    learningApi.getMapelByGuru(guruId)
      .then(res => setMapelList(res.data.data || []))
      .catch(err => console.error(err));

    // Ambil semua kelas dari academic
    learningApi.getSiswaByKelas(1)
      .catch(err => {
        // Fallback jika endpoint tidak tersedia
        setKelasList([
          { id: 1, nama_kelas: 'X RPL 1', tingkat: 'X' },
          { id: 2, nama_kelas: 'X RPL 2', tingkat: 'X' },
        ]);
      });
  }, [guruId]);

  const handleMulaiAbsensi = async () => {
    if (!selectedMapel || !selectedKelas || !tanggal) {
      toast.error('Pilih mata pelajaran, kelas, dan tanggal terlebih dahulu!');
      return;
    }

    try {
      // Ambil siswa di kelas ini
      const resSiswa = await learningApi.getSiswaByKelas(selectedKelas);
      const siswaList = resSiswa.data || [];

      if (siswaList.length === 0) {
        toast.error('Tidak ada siswa di kelas ini.');
        return;
      }
      setSiswaDiKelas(siswaList);

      // Cek apakah absensi hari ini sudah ada
      const resAbsensi = await learningApi.getAbsensi({
        guru_id: guruId, kelas_id: selectedKelas,
        mapel_id: selectedMapel, tanggal
      });
      const existing = resAbsensi.data.data || [];

      const initialMap = {};
      siswaList.forEach(s => {
        const found = existing.find(a => a.siswa_id === s.id);
        initialMap[s.id] = found ? found.status : '';
      });
      setAbsensiMap(initialMap);
      setStep('absen');
    } catch (err) {
      toast.error('Gagal memuat data siswa');
    }
  };

  const handleSelesai = async () => {
    // Validasi semua siswa sudah terisi
    const belumTerisi = siswaDiKelas.filter(s => !absensiMap[s.id]);
    if (belumTerisi.length > 0) {
      toast.error(`Masih ada ${belumTerisi.length} siswa yang belum diisi statusnya!`);
      return;
    }

    const absensiArray = siswaDiKelas.map(s => ({
      siswa_id: s.id,
      status: absensiMap[s.id]
    }));

    const savePromise = learningApi.saveAbsensi({
      guru_id: guruId,
      kelas_id: parseInt(selectedKelas),
      mapel_id: parseInt(selectedMapel),
      tanggal,
      absensi: absensiArray
    });

    toast.promise(savePromise, {
      loading: 'Menyimpan absensi...',
      success: 'Absensi berhasil disimpan!',
      error: 'Gagal menyimpan absensi.'
    }).then(res => {
      // Tampilkan hasil
      setHasilAbsensi(siswaDiKelas.map(s => ({
        ...s,
        status: absensiMap[s.id]
      })));
      setStep('hasil');
    }).catch(() => {});
  };

  const handleLoadRekap = async () => {
    if (!selectedMapel || !selectedKelas) return;
    try {
      const res = await learningApi.getRekapAbsensi({
        guru_id: guruId, kelas_id: selectedKelas, mapel_id: selectedMapel
      });
      // Gabung dengan nama siswa
      const rekap = res.data.data.map(r => {
        const siswa = siswaDiKelas.find(s => s.id === r.siswa_id);
        return { ...r, nama: siswa?.nama_lengkap || `ID: ${r.siswa_id}` };
      });
      setRekapData(rekap);
      setShowRekap(true);
    } catch (err) {
      toast.error('Gagal memuat rekap');
    }
  };

  const selectedMapelObj = mapelList.find(m => m.id === parseInt(selectedMapel));
  const selectedKelasObj = kelasList.find(k => k.id === parseInt(selectedKelas));

  // Hitung statistik untuk step hasil
  const stats = {
    hadir: hasilAbsensi.filter(a => a.status === 'Hadir').length,
    ijin: hasilAbsensi.filter(a => a.status === 'Sakit').length,
    alpha: hasilAbsensi.filter(a => a.status === 'Alpa').length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Absensi Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Laporan kehadiran seluruh siswa SMK N 1 Sigumpar</p>
        </div>
        {step !== 'pilih' && (
          <Button variant="secondary" onClick={() => { setStep('pilih'); setShowRekap(false); }}>
            ← Kembali
          </Button>
        )}
      </div>

      {/* === STEP 1: PILIH MAPEL & KELAS === */}
      {step === 'pilih' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-5">Pilih Kelas & Mata Pelajaran</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-sm"
                value={selectedMapel}
                onChange={e => setSelectedMapel(e.target.value)}
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {mapelList.map(m => (
                  <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-sm"
                value={selectedKelas}
                onChange={e => setSelectedKelas(e.target.value)}
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kelas} ({k.tingkat})</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-sm"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
              />
            </div>

            <Button onClick={handleMulaiAbsensi} className="col-span-2">
              Mulai Absensi →
            </Button>
          </div>
        </div>
      )}

      {/* === STEP 2: FORM ABSENSI === */}
      {step === 'absen' && (
        <div>
          {/* Info konteks */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex flex-wrap gap-4 text-sm">
            <span>📚 <strong>{selectedMapelObj?.nama_mapel}</strong></span>
            <span>🏫 <strong>{selectedKelasObj?.nama_kelas}</strong></span>
            <span>📅 <strong>{new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 w-8">No</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">NISN</th>
                  <th className="px-6 py-4">Status Kehadiran</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {siswaDiKelas.map((siswa, idx) => (
                  <tr key={siswa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500 text-sm">{idx + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">{siswa.nama_lengkap}</td>
                    <td className="px-6 py-3 text-gray-500 text-sm font-mono">{siswa.nisn}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        {['Hadir', 'Sakit', 'Alpa'].map(status => {
                          const colors = {
                            Hadir: 'bg-green-500 text-white',
                            Sakit: 'bg-yellow-400 text-white',
                            Alpa: 'bg-red-500 text-white',
                          };
                          const isSelected = absensiMap[siswa.id] === status;
                          return (
                            <button
                              key={status}
                              onClick={() => setAbsensiMap(prev => ({ ...prev, [siswa.id]: status }))}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border-2
                                ${isSelected
                                  ? `${colors[status]} border-transparent shadow-md scale-105`
                                  : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasilAbsensi.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 text-xs text-gray-600 border-t border-gray-100">
                Halaman 1 dari 1 • Total {hasilAbsensi.filter(s => s.nama_lengkap.toLowerCase().includes(filterNamaSiswa.toLowerCase())).length} data
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress pengisian</span>
              <span>{Object.values(absensiMap).filter(Boolean).length} / {siswaDiKelas.length} siswa</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(Object.values(absensiMap).filter(Boolean).length / siswaDiKelas.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStep('pilih')}>Batal</Button>
            <Button onClick={handleSelesai}>✅ Selesai & Simpan</Button>
          </div>
        </div>
      )}

      {/* === STEP 3: HASIL ABSENSI === */}
      {step === 'hasil' && (
        <div>
          {/* Statistik */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.hadir}</div>
              <div className="text-xs text-gray-600 mt-1 uppercase font-semibold">Hadir</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.ijin}</div>
              <div className="text-xs text-gray-600 mt-1 uppercase font-semibold">Ijin</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.alpha}</div>
              <div className="text-xs text-gray-600 mt-1 uppercase font-semibold">Alpha</div>
            </div>
          </div>

          {/* Filter Pencarian */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Daftar Kehadiran Siswa</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cari Nama Siswa</label>
                <input
                  type="text"
                  placeholder="Masukkan nama siswa..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-200"
                  value={filterNamaSiswa}
                  onChange={e => setFilterNamaSiswa(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tabel Hasil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hasilAbsensi
                  .filter(s => s.nama_lengkap.toLowerCase().includes(filterNamaSiswa.toLowerCase()))
                  .map((siswa, idx) => (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500 text-sm">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">{siswa.nama_lengkap}</td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{selectedKelasObj?.nama_kelas}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          siswa.status === 'Hadir' ? 'bg-green-100 text-green-800' :
                          siswa.status === 'Sakit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {siswa.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={handleLoadRekap}>📊 Lihat Rekap</Button>
            <Button onClick={() => { setStep('pilih'); setSiswaDiKelas([]); }}>+ Absensi Baru</Button>
          </div>

          {/* Sheet Rekap */}
          {showRekap && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-slide-right">
                <div className="px-6 py-4 border-b flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Daftar Kehadiran Siswa</h2>
                    <p className="text-sm text-gray-500">{selectedMapelObj?.nama_mapel} — {selectedKelasObj?.nama_kelas}</p>
                  </div>
                  <button onClick={() => setShowRekap(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {rekapData.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">Belum ada data rekap</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left">Nama</th>
                          <th className="px-3 py-3 text-center text-green-600">Hadir</th>
                          <th className="px-3 py-3 text-center text-yellow-600">Ijin</th>
                          <th className="px-3 py-3 text-center text-red-600">Alpha</th>
                          <th className="px-3 py-3 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rekapData.map(r => (
                          <tr key={r.siswa_id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-medium text-gray-800">{r.nama}</td>
                            <td className="px-3 py-3 text-center text-green-600 font-semibold">{r.hadir}</td>
                            <td className="px-3 py-3 text-center text-yellow-600 font-semibold">{r.sakit}</td>
                            <td className="px-3 py-3 text-center text-red-600 font-semibold">{r.alpa}</td>
                            <td className="px-3 py-3 text-center text-gray-600 font-medium">{r.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AbsensiPage;