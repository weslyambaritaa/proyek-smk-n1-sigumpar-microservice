import React, { useState, useEffect } from 'react';
import { academicApi } from '../../../api/academicApi';
import Button from '../../../components/ui/Button';
import KelasDialog from './dialog/KelasDialog';

const KelasPage = () => {
  const [kelasData, setKelasData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);

  const fetchKelas = async () => {
    try {
      const res = await academicApi.getAllKelas();
      setKelasData(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchKelas(); }, []);

  const handleEdit = (kelas) => {
    setSelectedKelas(kelas);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus kelas ini?")) {
      await academicApi.deleteKelas(id);
      fetchKelas();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
        <Button onClick={() => { setSelectedKelas(null); setIsDialogOpen(true); }}>
          + Tambah Kelas
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Nama Kelas</th>
              <th className="px-6 py-4">Tingkat</th>
              <th className="px-6 py-4">Wali Kelas</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {kelasData.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{k.nama_kelas}</td>
                <td className="px-6 py-4">{k.tingkat}</td>
                <td className="px-6 py-4">{k.nama_wali || '-'}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button onClick={() => handleEdit(k)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <KelasDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={fetchKelas}
        initialData={selectedKelas}
      />
    </div>
  );
};

export default KelasPage;