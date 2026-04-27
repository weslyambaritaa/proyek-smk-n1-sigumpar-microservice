import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";
import ArsipSuratDialog from "./dialog/ArsipSuratDialog";

const ArsipSuratPage = () => {
  const [arsipList, setArsipList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [arsipToDelete, setArsipToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

  // ============================
  // FETCH DATA
  // ============================
  const fetchArsip = async () => {
    try {
      const response = await academicApi.getAllArsipSurat();
      setArsipList(response.data);
    } catch (error) {
      console.error("Gagal mengambil arsip:", error);
      toast.error("Gagal memuat data arsip surat");
    }
  };

  // ============================
  // PREVIEW FILE (FIX)
  // ============================
  const handlePreview = (fileUrl) => {
    if (!fileUrl) {
      toast.error("File tidak tersedia");
      return;
    }

    const filename = fileUrl.split("/").pop();
    const url = `${API_BASE_URL}/uploads/${filename}`;

    window.open(url, "_blank");
  };

  // ============================
  // DOWNLOAD FILE (FIX TOTAL)
  // ============================
  const handleDownload = (fileUrl, nomorSurat) => {
    try {
      if (!fileUrl) {
        toast.error("File tidak tersedia");
        return;
      }

      const filename = fileUrl.split("/").pop();
      const url = `${API_BASE_URL}/uploads/${filename}`;

      const link = document.createElement("a");
      link.href = url;

      const safeFileName = `Arsip_${nomorSurat.replace(/\//g, "-")}.pdf`;
      link.setAttribute("download", safeFileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Berhasil mendownload!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mendownload file.");
    }
  };

  useEffect(() => {
    fetchArsip();
  }, []);

  // ============================
  // CLOSE MENU CLICK OUTSIDE
  // ============================
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

  // ============================
  // ACTIONS
  // ============================
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

    toast
      .promise(deletePromise, {
        loading: "Menghapus arsip surat...",
        success: `Arsip Surat ${arsipToDelete.nomor_surat} berhasil dihapus!`,
        error: "Gagal menghapus arsip surat.",
      })
      .then(() => {
        fetchArsip();
        setIsDeleteDialogOpen(false);
        setArsipToDelete(null);
      });
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Arsip Surat</h1>
        <Button
          onClick={() => {
            setSelectedData(null);
            setIsDialogOpen(true);
          }}
        >
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(arsip.file_url)}
                      className="text-blue-600 hover:text-blue-800 underline font-medium text-sm"
                    >
                      👁 Lihat
                    </button>

                    <span className="text-gray-300">|</span>

                    <button
                      onClick={() =>
                        handleDownload(arsip.file_url, arsip.nomor_surat)
                      }
                      className="text-green-600 hover:text-green-800 underline font-medium text-sm"
                    >
                      ⬇ Unduh
                    </button>
                  </div>
                </td>

                <td
                  className="px-6 py-4 text-center relative"
                  ref={openMenuId === arsip.id ? menuRef : null}
                >
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === arsip.id ? null : arsip.id)
                    }
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
                  >
                    <span className="font-bold text-lg">⋮</span>
                  </button>

                  {openMenuId === arsip.id && (
                    <div className="absolute right-6 mt-1 w-32 bg-white border rounded-lg shadow-xl z-10 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => handleEdit(arsip)}
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteClick(arsip)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
                        >
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

      {/* DELETE PANEL */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">
                Hapus Arsip Surat
              </h2>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border rounded-lg text-sm">
                Arsip surat akan dihapus permanen.
              </div>

              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg text-center"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={arsipToDelete?.nomor_surat}
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>

              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== arsipToDelete?.nomor_surat}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArsipSuratPage;
