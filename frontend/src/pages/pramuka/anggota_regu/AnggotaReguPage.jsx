import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const AnggotaReguPage = () => {
  const [reguList, setReguList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedRegu, setSelectedRegu] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, s] = await Promise.all([
          vocationalApi.getAllRegu(),
          vocationalApi.getSiswaTersedia()
        ]);
        setReguList(r.data || []);
        setSiswaList(s.data || []);
      } catch (error) {
        toast.error('Gagal mengambil data awal');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredSiswa = siswaList.filter(s =>
    s?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSiswa.find(terpilih => terpilih.id === s.id)
  );

  const handlePilihSiswa = (siswa) => {
    setSelectedSiswa([...selectedSiswa, siswa]);
    setSearchTerm('');
  };

  const handleHapusSiswa = (idSiswa) => {
    setSelectedSiswa(selectedSiswa.filter(s => s.id !== idSiswa));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRegu) return toast.error('Pilih Regu terlebih dahulu!');
    if (selectedSiswa.length === 0) return toast.error('Pilih setidaknya 1 siswa!');
    setIsSubmitting(true);
    try {
      await vocationalApi.assignSiswaToRegu({
        regu_id: selectedRegu,
        siswa_ids: selectedSiswa.map(s => s.id)
      });
      toast.success('Siswa berhasil dimasukkan ke regu!');
      setSelectedSiswa([]);
      setSearchTerm('');
      setSelectedRegu('');
      const s = await vocationalApi.getSiswaTersedia();
      setSiswaList(s.data || []);
    } catch (error) {
      toast.error('Gagal memplotting anggota');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReguNama = reguList.find(r => String(r.id) === String(selectedRegu))?.nama_regu;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Plotting Anggota Regu</h1>
        <p className="text-sm text-gray-500 mt-1">Masukkan siswa ke dalam regu pramuka</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Kiri: Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pilih Regu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">1. Pilih Regu Tujuan</h2>
            {isLoading ? (
              <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedRegu}
                onChange={(e) => setSelectedRegu(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
              >
                <option value="">-- Pilih Regu Pramuka --</option>
                {reguList.map(r => (
                  <option key={r.id} value={r.id}>{r.nama_regu}</option>
                ))}
              </select>
            )}
          </div>

          {/* Cari Siswa */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">2. Cari & Pilih Siswa</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ketik nama siswa untuk mencari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
              {searchTerm && filteredSiswa.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {filteredSiswa.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handlePilihSiswa(s)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-0 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 text-xs font-bold">{s.nama_lengkap?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.nama_lengkap}</p>
                        <p className="text-xs text-gray-500">{s.nama_kelas || 'Tanpa Kelas'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchTerm && filteredSiswa.length === 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                  Tidak ada siswa yang cocok atau sudah di-assign ke regu
                </div>
              )}
            </div>

            {/* Siswa Terpilih */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">SISWA TERPILIH ({selectedSiswa.length})</p>
              <div className="min-h-[80px] bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 flex flex-wrap gap-2 items-start content-start">
                {selectedSiswa.length === 0 ? (
                  <p className="text-sm text-gray-400 m-auto">Belum ada siswa yang dipilih...</p>
                ) : (
                  selectedSiswa.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {s.nama_lengkap}
                      <button type="button" onClick={() => handleHapusSiswa(s.id)} className="text-green-600 hover:text-red-500 transition-colors ml-1 font-bold">✕</button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            onClick={handleAssign}
            disabled={isSubmitting || !selectedRegu || selectedSiswa.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <> Simpan ke Regu </>
            )}
          </button>
        </div>

        {/* Panel Kanan: Ringkasan */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Ringkasan</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Regu Dipilih</span>
                <span className="text-sm font-semibold text-gray-800">{selectedReguNama || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Siswa Dipilih</span>
                <span className="text-sm font-bold text-green-600">{selectedSiswa.length} orang</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Siswa Tersedia</span>
                <span className="text-sm font-semibold text-gray-800">{siswaList.length} orang</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 mb-2">ℹ️ Informasi</p>
            <p className="text-xs text-green-600 leading-relaxed">
              Siswa yang sudah masuk ke regu tidak akan muncul di daftar pencarian. Pastikan kamu memilih regu yang tepat sebelum menyimpan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnggotaReguPage;
