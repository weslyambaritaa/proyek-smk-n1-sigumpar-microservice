import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';
import RefleksiDialog from './dialog/RefleksiDialog';

const KONDISI_MAP = {
  sangat_baik: { label: 'Sangat Baik', cls: 'bg-green-100 text-green-700' },
  baik:        { label: 'Baik',        cls: 'bg-blue-100 text-blue-700'   },
  cukup:       { label: 'Cukup',       cls: 'bg-yellow-100 text-yellow-700' },
  kurang:      { label: 'Kurang',      cls: 'bg-red-100 text-red-700'     },
};

const KondisiBadge = ({ kondisi }) => {
  const { label, cls } = KONDISI_MAP[kondisi] || { label: kondisi, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
  );
};

const RefleksiPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

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
    waliKelasApi.getAllRefleksi(selectedKelasId)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Gagal memuat data refleksi'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (payload) => {
    try {
      if (editData) {
        await waliKelasApi.updateRefleksi(editData.id, payload);
        toast.success('Refleksi berhasil diperbarui');
      } else {
        await waliKelasApi.createRefleksi(payload);
        toast.success('Refleksi berhasil ditambahkan');
      }
      setDialogOpen(false);
      setEditData(null);
      fetchData();
    } catch {
      toast.error('Gagal menyimpan refleksi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan refleksi ini?')) return;
    try {
      await waliKelasApi.deleteRefleksi(id);
      toast.success('Refleksi berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus refleksi');
    }
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Refleksi Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">Catatan refleksi mingguan kondisi kelas</p>
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
            + Tambah Refleksi
          </button>
        </div>
      </div>

      {/* Daftar Refleksi — card style */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Belum ada catatan refleksi untuk kelas ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Baris ringkasan — selalu terlihat */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                      {!isExpanded && item.hal_positif && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">
                          {item.hal_positif}
                        </p>
                      )}
                    </div>
                    <KondisiBadge kondisi={item.kondisi_kelas} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={e => { e.stopPropagation(); setEditData(item); setDialogOpen(true); }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Hapus
                    </button>
                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Detail — hanya tampil kalau di-expand */}
                {isExpanded && (
                  <div className="px-6 pb-5 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1 pt-4">
                    <div>
                      <p className="text-xs font-bold text-green-600 mb-1.5">✅ Hal Positif</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.hal_positif || <span className="text-gray-300 italic">Tidak diisi</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-500 mb-1.5">⚠️ Perlu Diperbaiki</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.hal_perlu_perbaikan || <span className="text-gray-300 italic">Tidak diisi</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-1.5">📌 Rencana Tindak Lanjut</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.rencana_tindak_lanjut || <span className="text-gray-300 italic">Tidak diisi</span>}
                      </p>
                    </div>
                    {item.catatan_tambahan && (
                      <div className="sm:col-span-3 border-t border-gray-50 pt-3">
                        <p className="text-xs font-bold text-gray-500 mb-1">Catatan Tambahan</p>
                        <p className="text-sm text-gray-500">{item.catatan_tambahan}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RefleksiDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        kelasList={kelasList}
      />
    </div>
  );
};

export default RefleksiPage;
