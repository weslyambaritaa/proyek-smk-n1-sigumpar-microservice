import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const AbsensiPramukaPage = () => {
  const [reguList, setReguList] = useState([]);
  const [selectedRegu, setSelectedRegu] = useState('');
  
  const [siswaAbsensi, setSiswaAbsensi] = useState([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetch = async () => {
      const res = await vocationalApi.getAllRegu();
      setReguList(res.data || []);
    };
    fetch();
  }, []);

  // Ambil siswa ketika regu diubah
  useEffect(() => {
    if (selectedRegu) {
      const loadSiswa = async () => {
        try {
          const res = await vocationalApi.getSiswaByRegu(selectedRegu);
          // Tambahkan field status_kehadiran bawaan (Hadir) untuk dicentang dari awal
          setSiswaAbsensi(res.data.map(s => ({ ...s, status_kehadiran: 'Hadir' })));
        } catch (error) { toast.error("Gagal mengambil data siswa regu"); }
      };
      loadSiswa();
    } else {
      setSiswaAbsensi([]);
    }
  }, [selectedRegu]);

  // Fungsi toggle checkbox
  const toggleKehadiran = (idSiswa) => {
    setSiswaAbsensi(siswaAbsensi.map(s => 
      s.id === idSiswa 
        ? { ...s, status_kehadiran: s.status_kehadiran === 'Hadir' ? 'Alpa' : 'Hadir' }
        : s
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRegu) return toast.error("Pilih regu!");
    
    // Format data sesuai dengan yang diterima backend
    const payload = {
      regu_id: selectedRegu,
      tanggal: tanggal,
      data_absensi: siswaAbsensi.map(s => ({
        siswa_id: s.id,
        status: s.status_kehadiran
      }))
    };

    try {
      await vocationalApi.submitAbsensiPramuka(payload);
      toast.success('Absensi berhasil disimpan!');
      setSelectedRegu(''); // Reset form setelah simpan
    } catch (error) { toast.error('Gagal menyimpan absensi'); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Absensi Pramuka</h1>
      
      <div className="flex gap-4 mb-6">
        <select value={selectedRegu} onChange={(e) => setSelectedRegu(e.target.value)} className="flex-1 rounded-lg border-gray-300 p-2.5">
          <option value="">-- Pilih Regu --</option>
          {reguList.map(r => <option key={r.id} value={r.id}>{r.nama_regu}</option>)}
        </select>
        
        <input 
          type="date" 
          value={tanggal} 
          onChange={(e) => setTanggal(e.target.value)} 
          className="rounded-lg border-gray-300 p-2.5" 
          required 
        />
      </div>

      {selectedRegu && siswaAbsensi.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm">
          <table className="w-full text-left mb-6">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-3 rounded-tl-lg">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3 text-center">Hadir</th>
                <th className="p-3 rounded-tr-lg">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {siswaAbsensi.map((s, index) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 text-sm">{index + 1}</td>
                  <td className="p-3 font-medium text-gray-800">{s.nama}</td>
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-green-600 rounded cursor-pointer"
                      checked={s.status_kehadiran === 'Hadir'}
                      onChange={() => toggleKehadiran(s.id)}
                    />
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status_kehadiran === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status_kehadiran}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold transition">
              Simpan Data Absensi
            </button>
          </div>
        </form>
      )}

      {selectedRegu && siswaAbsensi.length === 0 && (
        <div className="text-center p-8 bg-gray-50 border rounded-lg text-gray-500">
          Belum ada anggota yang di-plotting ke regu ini.
        </div>
      )}
    </div>
  );
};
export default AbsensiPramukaPage;