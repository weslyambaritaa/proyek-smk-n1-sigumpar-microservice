import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const ReguPage = () => {
  const [reguList, setReguList] = useState([]);
  const [namaRegu, setNamaRegu] = useState('');

  useEffect(() => { fetchRegu(); }, []);

  const fetchRegu = async () => {
    try {
      const res = await vocationalApi.getAllRegu();
      setReguList(res.data || []);
    } catch (error) { toast.error('Gagal memuat regu'); }
  };

  const handleAddRegu = async (e) => {
    e.preventDefault();
    try {
      await vocationalApi.createRegu({ nama_regu: namaRegu });
      toast.success('Regu berhasil ditambahkan!');
      setNamaRegu('');
      fetchRegu();
    } catch (error) { toast.error('Gagal menambah regu'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Regu</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleAddRegu} className="flex gap-4">
          <input
            type="text"
            className="flex-1 border-gray-300 rounded-lg p-2.5 focus:ring-blue-500"
            placeholder="Nama Regu Baru..."
            value={namaRegu}
            onChange={(e) => setNamaRegu(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">Simpan</button>
        </form>
      </div>
      {/* Tabel Daftar Regu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">No</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama Regu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reguList.map((r, i) => (
              <tr key={r.id}><td className="px-6 py-4 text-sm">{i+1}</td><td className="px-6 py-4 text-sm">{r.nama_regu}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ReguPage;