import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const AnggotaReguPage = () => {
  const [reguList, setReguList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedRegu, setSelectedRegu] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [r, s] = await Promise.all([vocationalApi.getAllRegu(), vocationalApi.getSiswaTersedia()]);
      setReguList(r.data || []);
      setSiswaList(s.data || []);
    };
    load();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await vocationalApi.assignSiswaToRegu({ regu_id: selectedRegu, siswa_ids: selectedSiswa });
      toast.success('Siswa berhasil dimasukkan!');
      setSelectedSiswa([]);
      const s = await vocationalApi.getSiswaTersedia();
      setSiswaList(s.data || []);
    } catch (error) { toast.error('Gagal plotting'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Plotting Anggota</h1>
      <form onSubmit={handleAssign} className="space-y-6">
        <select value={selectedRegu} onChange={(e) => setSelectedRegu(e.target.value)} className="w-full rounded-lg border-gray-300 p-2.5">
          <option value="">-- Pilih Regu --</option>
          {reguList.map(r => <option key={r.id} value={r.id}>{r.nama_regu}</option>)}
        </select>
        <div className="bg-white border rounded-lg p-4 max-h-64 overflow-y-auto">
          {siswaList.map(s => (
            <label key={s.id} className="flex items-center mb-2 gap-3 cursor-pointer">
              <input type="checkbox" onChange={() => setSelectedSiswa(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])} />
              <span className="text-sm">{s.nama} ({s.kelas})</span>
            </label>
          ))}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold">Simpan Anggota</button>
      </form>
    </div>
  );
};
export default AnggotaReguPage;