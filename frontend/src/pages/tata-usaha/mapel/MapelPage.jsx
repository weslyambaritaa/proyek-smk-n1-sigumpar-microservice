import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import axiosInstance from "../../../api/axiosInstance";
import Button from "../../../components/ui/Button";
import MapelDialog from "./dialog/MapelDialog";
import toast from "react-hot-toast";

const MapelPage = () => {
  const [mapelData, setMapelData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);

  // State khusus Delete Sheet
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mapelToDelete, setMapelToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // State untuk Dropdown Menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchMapel = async () => {
    try {
      const resMapel = await academicApi.getAllMapel();
      const resUsers = await axiosInstance.get("/api/auth");
      const users = Array.isArray(resUsers.data) ? resUsers.data : resUsers.data.data || [];
      const rawMapel = Array.isArray(resMapel.data) ? resMapel.data : resMapel.data.data || [];

      // Mapping UUID guru dengan data dari Auth Service
      const mapelWithGuru = rawMapel.map((m) => {
        const guru = users.find((u) => u.id === m.guru_mapel_id);
        return {
          ...m,
          nama_guru: guru ? (guru.nama_lengkap || guru.username) : "-",
        };
      });

      setMapelData(mapelWithGuru);
    } catch (err) {
      console.error("Gagal mengambil data mapel:", err);
      toast.error("Gagal memuat data mata pelajaran");
    }
  };

  useEffect(() => {
    fetchMapel();
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

  const handleEdit = (mapel) => {
    setSelectedMapel(mapel);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (mapel) => {
    setMapelToDelete(mapel);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!mapelToDelete) return;
    if (deleteConfirmation !== mapelToDelete.nama_mapel) {
      toast.error("Nama mapel tidak sesuai!");
      return;
    }

    const deletePromise = academicApi.deleteMapel(mapelToDelete.id);
    toast.promise(deletePromise, {
      loading: "Menghapus mata pelajaran...",
      success: `Mapel ${mapelToDelete.nama_mapel} berhasil dihapus!`,
      error: "Gagal menghapus mata pelajaran.",
    }).then(() => {
      fetchMapel();
      setIsDeleteDialogOpen(false);
      setMapelToDelete(null);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mata Pelajaran</h1>
        <Button onClick={() => { setSelectedMapel(null); setIsDialogOpen(true); }}>
          + Tambah Mapel
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Nama Mapel</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4">Guru Mapel</th>
              <th className="px-6 py-4 text-center w-20">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mapelData.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{m.nama_mapel}</td>
                <td className="px-6 py-4">{m.nama_kelas || "-"}</td>
                <td className="px-6 py-4">{m.nama_guru}</td>
                <td className="px-6 py-4 text-center relative" ref={openMenuId === m.id ? menuRef : null}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-lg">⋮</span>
                  </button>

                  {openMenuId === m.id && (
                    <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                      <div className="py-1">
                        <button onClick={() => handleEdit(m)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(m)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100">
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

      <MapelDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchMapel}
        initialData={selectedMapel}
      />

      {/* Panel Hapus Samping */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Hapus Mata Pelajaran</h2>
            </div>
            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <p>Menghapus mapel <strong>{mapelToDelete?.nama_mapel}</strong> akan menghapus data yang terkait dengan mapel ini secara permanen.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Ketik nama mapel untuk konfirmasi:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-center font-mono"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={mapelToDelete?.nama_mapel}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== mapelToDelete?.nama_mapel}
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

export default MapelPage;