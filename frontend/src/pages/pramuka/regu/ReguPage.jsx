import React, { useState, useEffect, useRef } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const ReguPage = () => {
  const [reguList, setReguList] = useState([]);
  const [namaRegu, setNamaRegu] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegu, setSelectedRegu] = useState(null);
  const [reguToDelete, setReguToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [editNama, setEditNama] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => { fetchRegu(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const fetchRegu = async () => {
    setIsLoading(true);
    try {
      const res = await vocationalApi.getAllRegu();
      setReguList(res.data || []);
    } catch (error) {
      toast.error('Gagal memuat data regu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRegu = async (e) => {
    e.preventDefault();
    if (!namaRegu.trim()) return;
    try {
      await vocationalApi.createRegu({ nama_regu: namaRegu });
      toast.success('Regu berhasil ditambahkan!');
      setNamaRegu('');
      fetchRegu();
    } catch (error) {
      toast.error('Gagal menambah regu');
    }
  };

  const handleEdit = (regu) => {
    setSelectedRegu(regu);
    setEditNama(regu.nama_regu);
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleUpdateRegu = async (e) => {
    e.preventDefault();
    if (!editNama.trim()) return;
    try {
      await vocationalApi.updateRegu(selectedRegu.id, { nama_regu: editNama });
      toast.success('Regu berhasil diperbarui!');
      setIsDialogOpen(false);
      fetchRegu();
    } catch (error) {
      toast.error('Gagal memperbarui regu');
    }
  };

  const handleDeleteClick = (regu) => {
    setReguToDelete(regu);
    setDeleteConfirmation('');
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== reguToDelete?.nama_regu) {
      toast.error('Nama regu tidak sesuai!');
      return;
    }
    try {
      await vocationalApi.deleteRegu(reguToDelete.id);
      toast.success(`Regu ${reguToDelete.nama_regu} berhasil dihapus!`);
      setIsDeleteDialogOpen(false);
      setReguToDelete(null);
      fetchRegu();
    } catch (error) {
      toast.error('Gagal menghapus regu');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Regu</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data regu pramuka sekolah</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Tambah Regu Baru</h2>
        <form onSubmit={handleAddRegu} className="flex gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            placeholder="Masukkan nama regu baru..."
            value={namaRegu}
            onChange={(e) => setNamaRegu(e.target.value)}
            required
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <span>+</span> Tambah Regu
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Daftar Regu Pramuka</h2>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{reguList.length} Regu</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4 w-16">No</th>
              <th className="px-6 py-4">Nama Regu</th>
              <th className="px-6 py-4 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400">Memuat data...</td></tr>
            ) : reguList.length > 0 ? (
              reguList.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 text-xs font-bold">{r.nama_regu?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-800">{r.nama_regu}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center relative" ref={openMenuId === r.id ? menuRef : null}>
                    <button onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <span className="font-bold text-lg">⋮</span>
                    </button>
                    {openMenuId === r.id && (
                      <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                        <div className="py-1">
                          <button onClick={() => handleEdit(r)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">✏️ Edit</button>
                          <button onClick={() => handleDeleteClick(r)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100">🗑️ Hapus</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">⛺</span>
                    <p className="font-medium">Belum ada data regu</p>
                    <p className="text-sm">Tambahkan regu baru menggunakan form di atas</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Edit Nama Regu</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUpdateRegu} className="flex-1 flex flex-col">
              <div className="flex-1 px-6 py-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Regu</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={editNama} onChange={(e) => setEditNama(e.target.value)} required />
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Hapus Regu</h2>
              <p className="text-sm text-gray-500 mt-1">Tindakan ini bersifat permanen.</p>
            </div>
            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-bold text-red-800 mb-2">Peringatan!</h3>
                <p className="text-sm text-red-700">Data anggota dan absensi dalam regu ini mungkin akan terpengaruh.</p>
                <p className="text-sm font-bold text-red-900 mt-2">• {reguToDelete?.nama_regu}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ketik ulang <span className="text-black border-b-2 border-red-500">{reguToDelete?.nama_regu}</span> untuk konfirmasi
                </label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 text-center font-mono text-sm" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="Ketik nama regu..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsDeleteDialogOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Batal</button>
              <button onClick={confirmDelete} disabled={deleteConfirmation !== reguToDelete?.nama_regu} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-red-300 disabled:cursor-not-allowed">Tetap Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReguPage;
