import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import Button from "../../../components/ui/Button";
import UpacaraDialog from "./dialog/UpacaraDialog";
import toast from "react-hot-toast";

const UpacaraPage = () => {
  const [upacaraData, setUpacaraData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUpacara, setSelectedUpacara] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [upacaraToDelete, setUpacaraToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchUpacara = async () => {
    try {
      const res = await academicApi.getAllUpacara();

      const rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // 🔥 NORMALISASI DATA DI SINI
      const normalized = rawData.map((u) => ({
        ...u,
        user_nama: u.user_nama || u.petugas || "-",
      }));

      setUpacaraData(normalized);
    } catch (err) {
      console.error("Gagal mengambil data upacara:", err);
      toast.error("Gagal memuat jadwal upacara");
    }
  };

  useEffect(() => {
    fetchUpacara();
  }, []);

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

  const handleEdit = (upacara) => {
    setSelectedUpacara(upacara);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (upacara) => {
    setUpacaraToDelete(upacara);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== "HAPUS") {
      toast.error("Ketik HAPUS untuk konfirmasi!");
      return;
    }

    const deletePromise = academicApi.deleteUpacara(upacaraToDelete.id);

    toast
      .promise(deletePromise, {
        loading: "Menghapus jadwal...",
        success: "Jadwal upacara berhasil dihapus!",
        error: "Gagal menghapus jadwal upacara.",
      })
      .then(() => {
        fetchUpacara();
        setIsDeleteDialogOpen(false);
        setUpacaraToDelete(null);
      });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jadwal Upacara</h1>
        <Button
          onClick={() => {
            setSelectedUpacara(null);
            setIsDialogOpen(true);
          }}
        >
          + Tambah Jadwal Upacara
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Tanggal Upacara</th>
              <th className="px-6 py-4">Petugas Upacara</th>
              <th className="px-6 py-4">Tugas</th>
              <th className="px-6 py-4 text-center w-20">Tindakan</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {upacaraData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  Belum ada data jadwal upacara.
                </td>
              </tr>
            ) : (
              upacaraData.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.tanggal
                      ? new Date(u.tanggal).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </td>

                  {/* 🔥 PERBAIKAN DI SINI */}
                  <td className="px-6 py-4 text-gray-700">
                    {u.user_nama || "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">{u.tugas || "-"}</td>

                  <td
                    className="px-6 py-4 text-center relative"
                    ref={openMenuId === u.id ? menuRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === u.id ? null : u.id)
                      }
                      className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-bold text-lg">⋮</span>
                    </button>

                    {openMenuId === u.id && (
                      <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                        <div className="py-1">
                          <button
                            onClick={() => handleEdit(u)}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UpacaraDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchUpacara}
        initialData={selectedUpacara}
      />

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">
                Hapus Jadwal Upacara
              </h2>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                Menghapus jadwal tanggal{" "}
                <strong>
                  {upacaraToDelete?.tanggal
                    ? new Date(upacaraToDelete.tanggal).toLocaleDateString(
                        "id-ID",
                      )
                    : "-"}
                </strong>{" "}
                dengan petugas{" "}
                <strong>{upacaraToDelete?.user_nama || "-"}</strong>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ketik <span className="text-red-600">HAPUS</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-center font-mono"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== "HAPUS"}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-red-300"
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

export default UpacaraPage;
