import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const AnggotaReguPage = () => {
  const [reguList, setReguList] = useState([]);
  const [siswaList, setSiswaList] = useState([]); 
  const [selectedRegu, setSelectedRegu] = useState('');
  
  // State untuk Pencarian
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState([]); 

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
        console.error("Gagal mengambil data awal:", error);
      }
    };
    load();
  }, []);

  // PERBAIKAN: Gunakan s.nama_lengkap sesuai dengan backend
  const filteredSiswa = siswaList.filter(s => 
    s?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !selectedSiswa.find(terpilih => terpilih.id === s.id) 
  );

  const handlePilihSiswa = (siswa) => {
    setSelectedSiswa([...selectedSiswa, siswa]);
    setSearchTerm(''); // Reset form pencarian setelah memilih
  };

  const handleHapusSiswa = (idSiswa) => {
    setSelectedSiswa(selectedSiswa.filter(s => s.id !== idSiswa));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRegu) return toast.error("Pilih Regu terlebih dahulu!");
    if (selectedSiswa.length === 0) return toast.error("Pilih setidaknya 1 siswa!");

    try {
      const payload = { 
        regu_id: selectedRegu, 
        siswa_ids: selectedSiswa.map(s => s.id) 
      };
      await vocationalApi.assignSiswaToRegu(payload);
      
      toast.success('Siswa berhasil dimasukkan ke regu!');
      setSelectedSiswa([]);
      setSearchTerm('');
      
      // Refresh daftar siswa tersedia
      const s = await vocationalApi.getSiswaTersedia();
      setSiswaList(s.data || []);
    } catch (error) { 
      toast.error('Gagal memplotting anggota'); 
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Plotting Anggota Regu</h1>
      
      <form onSubmit={handleAssign} className="space-y-6">
        {/* Pilihan Regu */}
        <select value={selectedRegu} onChange={(e) => setSelectedRegu(e.target.value)} className="w-full rounded-lg border-gray-300 p-2.5">
          <option value="">-- Pilih Regu Pramuka --</option>
          {reguList.map(r => <option key={r.id} value={r.id}>{r.nama_regu}</option>)}
        </select>

        {/* Input Pencarian dengan Autocomplete List */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ketik nama siswa untuk mencari..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-gray-300 p-2.5"
          />
          {searchTerm && filteredSiswa.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSiswa.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => handlePilihSiswa(s)}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer border-b text-sm"
                >
                  {/* PERBAIKAN: Gunakan s.nama_lengkap dan s.nama_kelas */}
                  {s.nama_lengkap || "Tanpa Nama"} ({s.nama_kelas || "Tanpa Kelas"})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kotak Siswa yang Telah Dipilih */}
        <div className="bg-gray-50 border rounded-lg p-4 min-h-[100px]">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Siswa Terpilih ({selectedSiswa.length}):</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSiswa.map(s => (
              <span key={s.id} className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                {s.nama_lengkap || "Tanpa Nama"}
                <button type="button" onClick={() => handleHapusSiswa(s.id)} className="text-blue-500 hover:text-red-500 font-bold">✕</button>
              </span>
            ))}
            {selectedSiswa.length === 0 && <span className="text-gray-400 text-sm">Belum ada siswa yang dipilih...</span>}
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition">
          Simpan Ke Regu
        </button>
      </form>
    </div>
  );
};

export default AnggotaReguPage;