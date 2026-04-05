import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import axiosInstance from "../../../api/axiosInstance";
import Button from "../../../components/ui/Button";
import PiketDialog from "./dialog/PiketDialog";
import toast from "react-hot-toast";

const PiketPage = () => {
  const [piketData, setPiketData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPiket, setSelectedPiket] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [piketToDelete, setPiketToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchPiket = async () => {
    try {
      const resPiket = await academicApi.getAllPiket();
      let users = [];
      try {
        const resUsers = await axiosInstance.get("/api/auth");
        users = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || []);
      } catch { /* users gagal, data utama tetap tampil */ }
      const rawPiket = Array.isArray(resPiket.data) ? resPiket.data : resPiket.data.data || [];

      const piketWithGuru = rawPiket.map((p) => {
        const guru = users.find((u) => u.id === p.guru_id);
        return {
          ...p,
          nama_guru: guru ? (guru.nama_lengkap || guru.username) : "-",
        };
      });

      setPiketData(piketWithGuru);
    } catch (err) {
      console.error("Gagal mengambil data piket:", err);
      toast.error("Gagal memuat jadwal piket");
    }
  };

  useEffect(() => {
    fetchPiket();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleEdit = (piket) => {
    setSelectedPiket(piket);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (piket) => {
    setPiketToDelete(piket);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== "HAPUS") {
      toast.error("Ketik HAPUS untuk konfirmasi!");
      return;
    }

    const deletePromise = academicApi.deletePiket(piketToDelete.id);
    toast.promise(deletePromise, {
      loading: "Menghapus jadwal...",
      success: "Jadwal piket berhasil dihapus!",
      error: "Gagal menghapus jadwal.",
    }).then(() => {
      fetchPiket();
      setIsDeleteDialogOpen(false);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jadwal Piket Guru</h1>
        <Button onClick={() => { setSelectedPiket(null); setIsDialogOpen(true); }}>
          + Tambah Jadwal Piket
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Nama Guru</th>
              <th className="px-6 py-4 text-center w-20">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {piketData.map((p, index) => {
              // Cek apakah tanggal di baris ini beda dengan tanggal di baris sebelumnya
              const isNewDay = index > 0 && p.tanggal !== piketData[index - 1].tanggal;

              return (
                <React.Fragment key={p.id}>
                  {/* Jika harinya berbeda, tampilkan baris kosong sebagai pemisah (spacer) */}
                  {isNewDay && (
                    <tr>
                      <td colSpan="3" className="h-6 bg-gray-100/50 border-y border-gray-200"></td>
                    </tr>
                  )}
                  
                  {/* Baris data utama */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {new Date(p.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">{p.nama_guru}</td>
                    <td className="px-6 py-4 text-center relative" ref={openMenuId === p.id ? menuRef : null}>
                      <button onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <span className="font-bold text-lg">⋮</span>
                      </button>
                      {openMenuId === p.id && (
                        <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                          <div className="py-1">
                            <button onClick={() => handleEdit(p)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">Edit</button>
                            <button onClick={() => handleDeleteClick(p)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100">Hapus</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <PiketDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSuccess={fetchPiket} initialData={selectedPiket} />

      {/* Panel Hapus */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b"><h2 className="text-xl font-bold text-red-600">Hapus Jadwal Piket</h2></div>
            <div className="flex-1 px-6 py-6 space-y-6">
              <p className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                Yakin ingin menghapus jadwal piket untuk <strong>{piketToDelete?.nama_guru}</strong>?
              </p>
              <div>
                <label className="block text-sm font-semibold mb-2">Ketik <span className="text-red-600">HAPUS</span> untuk konfirmasi:</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-center font-mono" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="HAPUS" />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
              <button onClick={confirmDelete} disabled={deleteConfirmation !== "HAPUS"} className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-red-300">Tetap Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiketPage;