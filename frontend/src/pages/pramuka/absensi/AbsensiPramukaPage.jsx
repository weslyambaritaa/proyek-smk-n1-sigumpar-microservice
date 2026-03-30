import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const AbsensiPramukaPage = () => {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [siswaAbsensi, setSiswaAbsensi] = useState([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [materi, setMateri] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const res = await vocationalApi.getAllKelas();
      setKelasList(res.data || []);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      const loadSiswa = async () => {
        const res = await vocationalApi.getSiswaPramukaByKelas(selectedKelas);
        setSiswaAbsensi(res.data.map(s => ({ ...s, status_kehadiran: 'Hadir' })));
      };
      loadSiswa();
    }
  }, [selectedKelas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vocationalApi.submitAbsensiPramuka({ kelas_id: selectedKelas, tanggal, materi, data_absensi: siswaAbsensi });
      toast.success('Absensi disimpan!');
      setSelectedKelas('');
    } catch (error) { toast.error('Gagal simpan'); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Absensi Reguler</h1>
      <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)} className="mb-6 rounded-lg border-gray-300 p-2.5">
        <option value="">-- Pilih Kelas --</option>
        {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
      </select>
      {selectedKelas && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border">
          <input type="text" placeholder="Materi kegiatan..." value={materi} onChange={(e) => setMateri(e.target.value)} className="w-full mb-4 rounded-lg border-gray-300" required />
          {/* Tabel checklist kehadiran sama seperti sebelumnya */}
          <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-bold">Simpan Absensi</button>
        </form>
      )}
    </div>
  );
};
export default AbsensiPramukaPage;