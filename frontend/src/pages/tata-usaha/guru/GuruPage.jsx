import React, { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import Button from "../../../components/ui/Button";
import GuruDialog from "./dialog/GuruDialog";
import toast from "react-hot-toast";

const GuruPage = () => {
  const [guruData, setGuruData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guruToDelete, setGuruToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);

  const fetchGuru = async () => {
    try {
      const res = await academicApi.getAllGuru();
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setGuruData(raw);
    } catch (err) {
      toast.error("Gagal memuat data guru");
      setGuruData([]);
    }
  };

  useEffect(() => { fetchGuru(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleEdit = (guru) => {
    setSelectedGuru(guru);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (guru) => {
    setGuruToDelete(guru);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!guruToDelete) return;
    if (deleteConfirmation !== guruToDelete.nama_lengkap) {
      toast.error("Nama guru tidak sesuai!");
      return;
    }
    toast.promise(academicApi.deleteGuru(guruToDelete.id), {
      loading: "Menghapus data guru...",
      success: `Guru ${guruToDelete.nama_lengkap} berhasil dihapus!`,
      error: "Gagal menghapus guru.",
    }).then(() => {
      fetchGuru();
      setIsDeleteDialogOpen(false);
      setGuruToDelete(null);
    });
  };

  const jabatanBadgeColor = (jabatan) => {
    const map = {
      'Guru Mapel': 'bg-blue-100 text-blue-700',
      'Wali Kelas': 'bg-purple-100 text-purple-700',
      'Guru BK': 'bg-yellow-100 text-yellow-700',
      'Kepala Sekolah': 'bg-red-100 text-red-700',
      'Wakil Kepala Sekolah': 'bg-orange-100 text-orange-700',
    };
    return map[jabatan] || 'bg-gray-100 text-gray-600';
  };

  const filtered = guruData.filter(g =>
    g.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.nip?.includes(searchQuery) ||
    g.mata_pelajaran?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Guru</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data seluruh guru di sekolah</p>
        </div>
        <Button onClick={() => { setSelectedGuru(null); setIsDialogOpen(true); }}>
          + Tambah Guru
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama guru, NIP, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">NIP</th>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Jabatan</th>
              <th className="px-6 py-4">Mata Pelajaran</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{g.nip}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 text-sm font-bold">{g.nama_lengkap?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-800">{g.nama_lengkap}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${jabatanBadgeColor(g.jabatan)}`}>
                      {g.jabatan || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{g.mata_pelajaran || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{g.email || '-'}</td>
                  <td className="px-6 py-4 text-center relative" ref={openMenuId === g.id ? menuRef : null}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === g.id ? null : g.id)}
                      className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-bold text-lg">⋮</span>
                    </button>
                    {openMenuId === g.id && (
                      <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                        <div className="py-1">
                          <button onClick={() => handleEdit(g)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">✏️ Edit</button>
                          <button onClick={() => handleDeleteClick(g)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100">🗑️ Hapus</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">👨‍🏫</span>
                    <p className="font-medium">{searchQuery ? 'Tidak ada guru yang cocok' : 'Belum ada data guru'}</p>
                    {!searchQuery && <p className="text-sm">Klik tombol "Tambah Guru" untuk menambahkan data guru</p>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {guruData.length} guru
          </div>
        )}
      </div>

      <GuruDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchGuru}
        selectedGuru={selectedGuru}
      />

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Hapus Data Guru</h2>
              <p className="text-sm text-gray-500 mt-1">Tindakan ini bersifat permanen.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-bold text-red-800 mb-2">Peringatan!</h3>
                <p className="text-sm text-red-700">Data jadwal dan mata pelajaran terkait guru ini mungkin akan terpengaruh.</p>
                <ul className="mt-2 text-sm font-bold text-red-900">
                  <li>• {guruToDelete?.nama_lengkap}</li>
                  <li className="font-normal italic text-red-700">NIP: {guruToDelete?.nip}</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ketik ulang <span className="text-black border-b-2 border-red-500">{guruToDelete?.nama_lengkap}</span> untuk konfirmasi
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 text-center font-mono text-sm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Ketik nama lengkap guru..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmation !== guruToDelete?.nama_lengkap}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:bg-red-300 disabled:cursor-not-allowed"
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

export default GuruPage;
