import React, { useState, useEffect } from "react";
import { academicApi } from "../../../api/academicApi";
import Button from "../../../components/ui/Button";
import SiswaDialog from "./dialog/SiswaDialog";
import toast from "react-hot-toast";

const SiswaPage = () => {
  const [siswaData, setSiswaData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);

  // State khusus Delete (SUDAH DIPERBAIKI)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [siswaToDelete, setSiswaToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const fetchSiswa = async () => {
    try {
      const [resSiswa, resKelas] = await Promise.all([
        academicApi.getAllSiswa(),
        academicApi.getAllKelas()
      ]);

      const rawSiswa = Array.isArray(resSiswa.data) ? resSiswa.data : resSiswa.data.data || [];
      const rawKelas = Array.isArray(resKelas.data) ? resKelas.data : resKelas.data.data || [];

      const siswaWithKelas = rawSiswa.map((siswa) => {
        const kelas = rawKelas.find((k) => k.id === siswa.kelas_id);
        return {
          ...siswa,
          nama_kelas: kelas ? kelas.nama_kelas : "Belum Ada Kelas",
        };
      });

      setSiswaData(siswaWithKelas);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      toast.error("Gagal memuat data siswa");
      setSiswaData([]); 
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, []);

  const handleEdit = (siswa) => {
    setSelectedSiswa(siswa);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (siswa) => {
    setSiswaToDelete(siswa);
    setDeleteConfirmation(""); 
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!siswaToDelete) return;

    if (deleteConfirmation !== siswaToDelete.nama_lengkap) {
      toast.error("Nama siswa tidak sesuai!");
      return;
    }

    const deletePromise = academicApi.deleteSiswa(siswaToDelete.id);

    toast
      .promise(deletePromise, {
        loading: "Menghapus data siswa...",
        success: `Siswa ${siswaToDelete.nama_lengkap} berhasil dihapus!`,
        error: "Gagal menghapus siswa.",
      })
      .then(() => {
        fetchSiswa();
        setIsDeleteDialogOpen(false);
        setSiswaToDelete(null);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h1>
        <Button
          onClick={() => {
            setSelectedSiswa(null);
            setIsDialogOpen(true);
          }}
        >
          + Tambah Siswa
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {siswaData.length > 0 ? (
              siswaData.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{s.nisn}</td>
                  <td className="px-6 py-4 font-medium">{s.nama_lengkap}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                      {s.nama_kelas}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-blue-600 hover:underline text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(s)}
                      className="text-red-600 hover:underline text-sm font-semibold"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                  Belum ada data siswa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SiswaDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchSiswa}
        selectedSiswa={selectedSiswa} // Pastikan prop ini dikirim ke dialog
      />

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Hapus Data Siswa</h2>
              <p className="text-sm text-gray-500 mt-1">Tindakan ini bersifat permanen.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-bold text-red-800 mb-2">Peringatan!</h3>
                <p className="text-sm text-red-700">
                  Seluruh data akademik terkait siswa ini mungkin akan terpengaruh.
                </p>
                <ul className="list-disc list-inside mt-2 text-sm font-bold text-red-900">
                  <li>{siswaToDelete?.nama_lengkap}</li>
                  <li className="font-normal italic">NISN: {siswaToDelete?.nisn}</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ketik ulang <span className="text-black border-b-2 border-red-500">{siswaToDelete?.nama_lengkap}</span> untuk konfirmasi
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-red-200 focus:border-red-500 text-center font-mono"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Ketik nama lengkap siswa..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== siswaToDelete?.nama_lengkap}
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

export default SiswaPage;