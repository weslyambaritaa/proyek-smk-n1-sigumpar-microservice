import React, { useState, useEffect } from "react";
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

  const fetchKelas = async () => {
    try {
      const resKelas = await academicApi.getAllKelas();
      const resUsers = await axiosInstance.get("/api/auth");
      const users = resUsers.data.data;

      const kelasWithGuru = resKelas.data.map((kelas) => {
        const guru = users.find((u) => u.id === kelas.wali_kelas_id);
        return {
          ...kelas,
          nama_wali: guru ? guru.username : "-",
        };
      });

      setKelasData(kelasWithGuru);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  const handleEdit = (kelas) => {
    setSelectedKelas(kelas);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (kelas) => {
    setKelasToDelete(kelas);
    setDeleteConfirmation(""); // Reset input konfirmasi
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!kelasToDelete) return;

    // Validasi ekstra (seperti direferensi Anda)
    if (deleteConfirmation !== kelasToDelete.nama_kelas) {
      toast.error("Nama kelas tidak sesuai!");
      return;
    }

    const deletePromise = academicApi.deleteKelas(kelasToDelete.id);

    toast
      .promise(deletePromise, {
        loading: "Menghapus kelas...",
        success: `Kelas ${kelasToDelete.nama_kelas} berhasil dihapus!`,
        error: "Gagal menghapus kelas.",
      })
      .then(() => {
        fetchKelas();
        setIsDeleteDialogOpen(false);
        setKelasToDelete(null);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
        <Button
          onClick={() => {
            setSelectedKelas(null);
            setIsDialogOpen(true);
          }}
        >
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
                <td className="px-6 py-4">{k.nama_wali || "-"}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(k)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(k)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet Dialog Tambah/Edit */}
      <KelasDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchKelas}
        initialData={selectedKelas}
      />

      {/* Sheet Dialog Konfirmasi Hapus */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">
                Hapus Data Kelas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Tindakan ini bersifat permanen.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-bold text-red-800 mb-2">
                  Peringatan!
                </h3>
                <p className="text-sm text-red-700">
                  Dengan menghapus, data kelas ini tidak lagi dapat diakses.
                  Daftar kelas yang akan dihapus:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm font-bold text-red-900">
                  <li>{kelasToDelete?.nama_kelas}</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ketik ulang{" "}
                  <span className="font-bold text-black border-b-2 border-red-500">
                    {kelasToDelete?.nama_kelas}
                  </span>{" "}
                  untuk konfirmasi
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-red-200 focus:border-red-500 text-center font-mono"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Ketik nama kelas di sini..."
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
                disabled={deleteConfirmation !== kelasToDelete?.nama_kelas}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors min-w-24 disabled:bg-red-300 disabled:cursor-not-allowed"
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
