import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";
import ArsipSuratDialog from './dialog/ArsipSuratDialog';

const ArsipSuratPage = () => {
  const [arsipList, setArsipList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // State khusus Delete Sheet
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [arsipToDelete, setArsipToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // State untuk Dropdown Menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Ganti base URL ini sesuai dengan konfigurasi API Gateway / Backend Anda
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

  const fetchArsip = async () => {
    try {
      const response = await academicApi.getAllArsipSurat();
      setArsipList(response.data);
    } catch (error) {
      console.error("Gagal mengambil arsip:", error);
      toast.error("Gagal memuat data arsip surat");
    }
  };

  const handleDownload = async (fileUrl, nomorSurat) => {
    const loadingToast = toast.loading("Mendownload file...");
    try {
      // 1. Ambil file menggunakan Axios (Token otomatis ikut dari interceptor)
      const response = await academicApi.downloadFile(fileUrl);
      
      // 2. Buat objek URL sementara di browser dari data biner (Blob)
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // 3. Buat elemen <a> virtual untuk memicu download paksa
      const link = document.createElement('a');
      link.href = url;
      // Beri nama file download berdasarkan nomor surat (bersihkan karakter miring)
      const safeFileName = `Arsip_${nomorSurat.replace(/\//g, '-')}.pdf`;
      link.setAttribute('download', safeFileName); 
      
      document.body.appendChild(link);
      link.click();
      
      // 4. Bersihkan memori
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Berhasil mendownload!", { id: loadingToast });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mendownload. Sesi mungkin habis atau file hilang.", { id: loadingToast });
    }
  };

  useEffect(() => {
    fetchArsip();
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

  const handleEdit = (arsip) => {
    setSelectedData(arsip);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (arsip) => {
    setArsipToDelete(arsip);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!arsipToDelete) return;
    if (deleteConfirmation !== arsipToDelete.nomor_surat) {
      toast.error("Nomor surat tidak sesuai!");
      return;
    }

    const deletePromise = academicApi.deleteArsipSurat(arsipToDelete.id);
    toast.promise(deletePromise, {
      loading: "Menghapus arsip surat...",
      success: `Arsip Surat ${arsipToDelete.nomor_surat} berhasil dihapus!`,
      error: "Gagal menghapus arsip surat.",
    }).then(() => {
      fetchArsip();
      setIsDeleteDialogOpen(false);
      setArsipToDelete(null);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Arsip Surat</h1>
        <Button onClick={() => { setSelectedData(null); setIsDialogOpen(true); }}>
          + Tambah Arsip
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nomor Surat</th>
              <th className="px-6 py-4">File Surat</th>
              <th className="px-6 py-4 text-center w-20">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {arsipList.map((arsip) => (
              <tr key={arsip.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{arsip.id}</td>
                <td className="px-6 py-4 font-medium">{arsip.nomor_surat}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDownload(arsip.file_url, arsip.nomor_surat)}
                    className="text-blue-600 hover:text-blue-800 underline font-medium text-left"
                  >
                    Download File
                  </button>
                </td>
                <td className="px-6 py-4 text-center relative" ref={openMenuId === arsip.id ? menuRef : null}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === arsip.id ? null : arsip.id)}
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-lg">⋮</span>
                  </button>

                  {openMenuId === arsip.id && (
                    <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                      <div className="py-1">
                        <button onClick={() => handleEdit(arsip)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(arsip)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100">
                          Hapus
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

      <ArsipSuratDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onRefresh={fetchArsip}
        initialData={selectedData}
      />

      {/* Panel Hapus Samping */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Hapus Arsip Surat</h2>
            </div>
            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <p>Menghapus arsip surat <strong>{arsipToDelete?.nomor_surat}</strong> juga akan menghapus file fisik di dalam server.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Ketik nomor surat untuk konfirmasi:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-center font-mono"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={arsipToDelete?.nomor_surat}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== arsipToDelete?.nomor_surat}
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

export default ArsipSuratPage;