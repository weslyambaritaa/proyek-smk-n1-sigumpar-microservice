import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import Button from "../../../components/ui/Button";
import PengumumanDialog from "./dialog/PengumumanDialog";
import PengumumanDetailDialog from "./dialog/PengumumanDetailDialog";
import toast from "react-hot-toast";
import { extractArray } from "../../../utils/apiUtils";

const PengumumanPage = () => {
  const [pengumumanData, setPengumumanData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPengumuman, setSelectedPengumuman] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pengumumanToDelete, setPengumumanToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pengumumanDetail, setPengumumanDetail] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchPengumuman = async () => {
    try {
      const res = await academicApi.getAllPengumuman();
      setPengumumanData(extractArray(res));
    } catch (err) {
      toast.error("Gagal memuat data pengumuman");
      setPengumumanData([]);
    }
  };

  useEffect(() => { fetchPengumuman(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleDetail = (p) => {
    setPengumumanDetail(p);
    setIsDetailOpen(true);
    setOpenMenuId(null);
  };

  const handleEdit = (p) => {
    setSelectedPengumuman(p);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (p) => {
    setPengumumanToDelete(p);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== pengumumanToDelete?.judul) {
      toast.error("Judul tidak sesuai!");
      return;
    }
    const deletePromise = academicApi.deletePengumuman(pengumumanToDelete.id);
    toast.promise(deletePromise, {
      loading: "Menghapus...",
      success: "Dihapus!",
      error: "Gagal!",
    }).then(() => { fetchPengumuman(); setIsDeleteDialogOpen(false); });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengumuman</h1>
        <Button onClick={() => { setSelectedPengumuman(null); setIsDialogOpen(true); }}>
          + Tambah Pengumuman
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Judul</th>
              <th className="px-6 py-4">Isi Singkat</th>
              <th className="px-6 py-4 text-center w-20">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pengumumanData.length > 0 ? (
              pengumumanData.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{p.judul}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{p.isi}</td>
                  <td className="px-6 py-4 text-center relative" ref={openMenuId === p.id ? menuRef : null}>
                    <button onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} className="p-2 hover:bg-gray-100 rounded-full">⋮</button>
                    {openMenuId === p.id && (
                      <div className="absolute right-6 mt-1 w-36 bg-white border rounded-lg shadow-xl z-10 py-1">
                        <button onClick={() => handleDetail(p)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium">
                          Detail
                        </button>
                        <button onClick={() => handleEdit(p)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(p)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t">
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-gray-400">
                  Belum ada data pengumuman.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PengumumanDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSuccess={fetchPengumuman} initialData={selectedPengumuman} />
      <PengumumanDetailDialog isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={pengumumanDetail} />

      {/* Modal Hapus Samping */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b"><h2 className="text-xl font-bold text-red-600">Hapus Pengumuman</h2></div>
            <div className="flex-1 px-6 py-6 space-y-4">
              <p className="text-sm text-gray-600">Ketik ulang judul <strong>{pengumumanToDelete?.judul}</strong> untuk menghapus:</p>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-center" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
              <button onClick={confirmDelete} disabled={deleteConfirmation !== pengumumanToDelete?.judul} className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-red-300">Tetap Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengumumanPage;