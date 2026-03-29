import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';
import KebersihanDialog from './dialog/KebersihanDialog';

const SkorBar = ({ skor }) => {
  const color = skor >= 80 ? 'bg-green-500' : skor >= 60 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${skor}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right">{skor}</span>
    </div>
  );
};

const KebersihanPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    academicApi.getAllKelas()
      .then(res => {
        setKelasList(res.data);
        if (res.data.length > 0) setSelectedKelasId(String(res.data[0].id));
      })
      .catch(() => toast.error('Gagal memuat daftar kelas'));
  }, []);

  useEffect(() => {
    if (selectedKelasId) fetchData();
  }, [selectedKelasId]);

  const fetchData = () => {
    setLoading(true);
    waliKelasApi.getAllKebersihan({ kelas_id: selectedKelasId })
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Gagal memuat data kebersihan'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (payload) => {
    try {
      if (editData) {
        await waliKelasApi.updateKebersihan(editData.id, payload);
        toast.success('Data berhasil diperbarui');
      } else {
        await waliKelasApi.createKebersihan(payload);
        toast.success('Penilaian berhasil ditambahkan');
      }
      setDialogOpen(false);
      setEditData(null);
      fetchData();
    } catch {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data kebersihan ini?')) return;
    try {
      await waliKelasApi.deleteKebersihan(id);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kebersihan Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">Penilaian dan jadwal piket kebersihan</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedKelasId}
            onChange={e => setSelectedKelasId(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {kelasList.map(k => (
              <option key={k.id} value={k.id}>{k.nama_kelas}</option>
            ))}
          </select>
          <button
            onClick={() => { setEditData(null); setDialogOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            + Tambah Penilaian
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🧹</p>
            <p className="text-sm">Belum ada data penilaian kebersihan</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-semibold">Tanggal</th>
                <th className="px-6 py-3 font-semibold">Petugas Piket</th>
                <th className="px-6 py-3 font-semibold w-48">Skor</th>
                <th className="px-6 py-3 font-semibold">Catatan</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map(item => {
                const petugas = Array.isArray(item.petugas_piket) ? item.petugas_piket : [];
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {new Date(item.tanggal_penilaian).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {petugas.length > 0 ? petugas.join(', ') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <SkorBar skor={item.skor} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {item.catatan || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setEditData(item); setDialogOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <KebersihanDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        kelasList={kelasList}
      />
    </div>
  );
};

export default KebersihanPage;
