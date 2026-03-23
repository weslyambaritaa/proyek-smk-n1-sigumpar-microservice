import React, { useState, useEffect } from 'react';
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance"; 
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal"; // Import Modal untuk konfirmasi hapus
import KelasDialog from './dialog/KelasDialog';
import toast from 'react-hot-toast';

const KelasPage = () => {
  const [kelasData, setKelasData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);

  // State khusus untuk pop-up konfirmasi hapus
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kelasToDelete, setKelasToDelete] = useState(null);

  const fetchKelas = async () => {
    try {
      const resKelas = await academicApi.getAllKelas();
      const resUsers = await axiosInstance.get('/api/auth');
      const users = resUsers.data.data; 

      const kelasWithGuru = resKelas.data.map(kelas => {
        const guru = users.find(u => u.id === kelas.wali_kelas_id);
        return {
          ...kelas,
          nama_wali: guru ? guru.username : '-' 
        };
      });

      setKelasData(kelasWithGuru);
    } catch (err) { 
      console.error("Gagal mengambil data:", err); 
    }
  };

  useEffect(() => { fetchKelas(); }, []);

  const handleEdit = (kelas) => {
    setSelectedKelas(kelas);
    setIsDialogOpen(true);
  };

  // 1. Fungsi saat tombol "Hapus" di tabel diklik (Hanya membuka pop-up)
  const handleDeleteClick = (kelas) => {
    setKelasToDelete(kelas);
    setIsDeleteDialogOpen(true);
  };

  // 2. Fungsi saat tombol "Ya, Hapus" di dalam pop-up diklik
  const confirmDelete = async () => {
    if (!kelasToDelete) return;
    
    try {
      await academicApi.deleteKelas(kelasToDelete.id);
      toast.success(`Kelas ${kelasToDelete.nama_kelas} berhasil dihapus!`);
      fetchKelas();
    } catch (error) {
      toast.error("Gagal menghapus kelas.");
    } finally {
      // Tutup modal dan reset data
      setIsDeleteDialogOpen(false);
      setKelasToDelete(null);
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
                  {/* Ubah onClick agar memanggil handleDeleteClick */}
                  <button onClick={() => handleDeleteClick(k)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pop-up Dialog Tambah/Edit Kelas */}
      <KelasDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={fetchKelas}
        initialData={selectedKelas}
      />

      {/* Pop-up Dialog Konfirmasi Hapus */}
      <Modal 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        title="Konfirmasi Hapus"
      >
        <div className="p-2">
          <p className="text-gray-700 mb-6 text-sm">
            Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-red-600">{kelasToDelete?.nama_kelas}</span>? Data yang telah dihapus tidak dapat dikembalikan.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            {/* Tombol dengan styling merah khusus untuk aksi destruktif */}
            <button 
              onClick={confirmDelete} 
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default KelasPage;