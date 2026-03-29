import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';
import ParentingDialog from './dialog/ParentingDialog';

const JENIS_LABEL = {
  tatap_muka: 'Tatap Muka',
  telepon: 'Telepon',
  whatsapp: 'WhatsApp',
  surat: 'Surat',
};

const JENIS_COLOR = {
  tatap_muka: 'bg-blue-100 text-blue-700',
  telepon:    'bg-green-100 text-green-700',
  whatsapp:   'bg-emerald-100 text-emerald-700',
  surat:      'bg-orange-100 text-orange-700',
};

const ParentingPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [siswaDiKelas, setSiswaDiKelas] = useState([]);
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
    if (!selectedKelasId) return;
    fetchData();
    // Ambil daftar siswa di kelas ini untuk dropdown
    academicApi.getAllSiswa()
      .then(res => {
        const filtered = res.data.filter(s => String(s.kelas_id) === selectedKelasId);
        setSiswaDiKelas(filtered);
      });
  }, [selectedKelasId]);

  const fetchData = () => {
    setLoading(true);
    waliKelasApi.getAllParenting(selectedKelasId)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Gagal memuat data parenting'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (payload) => {
    try {
      if (editData) {
        await waliKelasApi.updateParenting(editData.id, payload);
        toast.success('Catatan berhasil diperbarui');
      } else {
        await waliKelasApi.createParenting(payload);
        toast.success('Catatan berhasil ditambahkan');
      }
      setDialogOpen(false);
      setEditData(null);
      fetchData();
    } catch {
      toast.error('Gagal menyimpan catatan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan ini?')) return;
    try {
      await waliKelasApi.deleteParenting(id);
      toast.success('Catatan berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus catatan');
    }
  };

  const openEdit = (item) => {
    setEditData(item);
    setDialogOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parenting</h1>
          <p className="text-sm text-gray-500 mt-1">Catatan komunikasi dengan orang tua siswa</p>
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
            + Tambah Catatan
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👨‍👩‍👧</p>
            <p className="text-sm">Belum ada catatan parenting untuk kelas ini</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-semibold">Nama Siswa</th>
                <th className="px-6 py-3 font-semibold">Tanggal</th>
                <th className="px-6 py-3 font-semibold">Topik</th>
                <th className="px-6 py-3 font-semibold">Jenis</th>
                <th className="px-6 py-3 font-semibold">Catatan</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.nama_siswa}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.topik}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${JENIS_COLOR[item.jenis_komunikasi] || 'bg-gray-100 text-gray-600'}`}>
                      {JENIS_LABEL[item.jenis_komunikasi] || item.jenis_komunikasi}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.catatan || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(item)}
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ParentingDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        siswaDiKelas={siswaDiKelas}
      />
    </div>
  );
};

export default ParentingPage;
