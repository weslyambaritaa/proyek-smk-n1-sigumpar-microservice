import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import axiosInstance from "../../../api/axiosInstance";
import Button from "../../../components/ui/Button";
import KelasDialog from "./dialog/KelasDialog";
import toast from "react-hot-toast";

const KelasPage = () => {
  const [kelasData, setKelasData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);

  // State khusus Delete Sheet
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kelasToDelete, setKelasToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // State untuk Dropdown Menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchKelas = async () => {
    try {
      const resKelas = await academicApi.getAllKelas();
      const resUsers = await axiosInstance.get("/api/auth");
      const users = Array.isArray(resUsers.data) ? resUsers.data : resUsers.data.data || [];

      const rawKelas = Array.isArray(resKelas.data) ? resKelas.data : resKelas.data.data || [];

      const kelasWithGuru = rawKelas.map((kelas) => {
        const guru = users.find((u) => u.id === kelas.wali_kelas_id);
        return {
          ...kelas,
          nama_wali: guru ? guru.username : "-",
        };
      });

      setKelasData(kelasWithGuru);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      toast.error("Gagal memuat data kelas");
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  // Logika menutup menu saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleEdit = (kelas) => {
    setSelectedKelas(kelas);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (kelas) => {
    setKelasToDelete(kelas);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!kelasToDelete) return;
    if (deleteConfirmation !== kelasToDelete.nama_kelas) {
      toast.error("Nama kelas tidak sesuai!");
      return;
    }

    const deletePromise = academicApi.deleteKelas(kelasToDelete.id);
    toast.promise(deletePromise, {
      loading: "Menghapus kelas...",
      success: `Kelas ${kelasToDelete.nama_kelas} berhasil dihapus!`,
      error: "Gagal menghapus kelas.",
    }).then(() => {
      fetchKelas();
      setIsDeleteDialogOpen(false);
      setKelasToDelete(null);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
        <Button onClick={() => { setSelectedKelas(null); setIsDialogOpen(true); }}>
          + Tambah Kelas
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Nama Kelas</th>
              <th className="px-6 py-4">Tingkat</th>
              <th className="px-6 py-4">Wali Kelas</th>
              <th className="px-6 py-4 text-center w-20">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {kelasData.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{k.nama_kelas}</td>
                <td className="px-6 py-4">{k.tingkat}</td>
                <td className="px-6 py-4">{k.nama_wali}</td>
                <td className="px-6 py-4 text-center relative" ref={openMenuId === k.id ? menuRef : null}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === k.id ? null : k.id)}
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-lg">⋮</span>
                  </button>

                  {openMenuId === k.id && (
                    <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                      <div className="py-1">
                        <button onClick={() => handleEdit(k)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">
                          <span></span> Edit
                        </button>
                        <button onClick={() => handleDeleteClick(k)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100">
                          <span></span> Hapus
                        </button>
                      </div>
                    </div>
                  )}
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

      {/* Panel Hapus Samping */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Hapus Data Kelas</h2>
            </div>
            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <p>Menghapus kelas <strong>{kelasToDelete?.nama_kelas}</strong> akan berdampak pada data siswa di dalamnya.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Ketik nama kelas untuk konfirmasi:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-center font-mono"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== kelasToDelete?.nama_kelas}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-red-300"
              >
                Tetap Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelasPage;