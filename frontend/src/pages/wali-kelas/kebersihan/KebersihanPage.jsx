import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';

const STATUS_MAP = {
  sangat_bersih: { label: 'SANGAT BERSIH', cls: 'bg-green-100 text-green-700 border border-green-200' },
  bersih:        { label: 'BERSIH',        cls: 'bg-blue-100 text-blue-700 border border-blue-200'   },
  cukup:         { label: 'CUKUP',         cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  kotor:         { label: 'KOTOR',         cls: 'bg-red-100 text-red-700 border border-red-200'      },
};

const STATUS_OPTIONS = [
  { value: 'sangat_bersih', label: 'Sangat Bersih' },
  { value: 'bersih',        label: 'Bersih'        },
  { value: 'cukup',         label: 'Cukup'         },
  { value: 'kotor',         label: 'Kotor'         },
];

const KebersihanPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    tanggal_penilaian: today,
    status_kebersihan: 'bersih',
    catatan: '',
    foto: null,
  });

  // Fungsi untuk melihat file via axios agar token ter-attach
  const handleViewFile = async (foto_url) => {
    if (!foto_url) return;
    try {
      const res = await waliKelasApi.viewFile(foto_url);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Gagal membuka file:', err);
      toast.error('Gagal membuka file');
    }
  };

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
      .then(res => setData(res.data.data || []))
      .catch(() => toast.error('Gagal memuat data kebersihan'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!selectedKelasId || !form.tanggal_penilaian || !form.status_kebersihan) {
      toast.error('Data belum lengkap');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('kelas_id', selectedKelasId);
      fd.append('tanggal_penilaian', form.tanggal_penilaian);
      fd.append('status_kebersihan', form.status_kebersihan);
      fd.append('catatan', form.catatan);
      if (form.foto) fd.append('foto', form.foto);

      await waliKelasApi.createKebersihan(fd);
      toast.success('Laporan kebersihan berhasil disimpan');
      setForm({ tanggal_penilaian: today, status_kebersihan: 'bersih', catatan: '', foto: null });
      fetchData();
    } catch {
      toast.error('Gagal menyimpan laporan kebersihan');
    } finally {
      setSaving(false);
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

  const selectedKelas = kelasList.find(k => String(k.id) === selectedKelasId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kontrol Kebersihan Kelas</h1>
          {selectedKelas && (
            <p className="text-sm text-blue-600 font-medium mt-0.5">Wali Kelas | {selectedKelas.nama_kelas}</p>
          )}
        </div>
        <select
          value={selectedKelasId}
          onChange={e => setSelectedKelasId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {kelasList.map(k => <option key={k.id} value={String(k.id)}>{k.nama_kelas}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Tanggal Pantauan</label>
            <input type="date" value={form.tanggal_penilaian} onChange={e => setForm(p => ({ ...p, tanggal_penilaian: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Status Kebersihan</label>
            <select value={form.status_kebersihan} onChange={e => setForm(p => ({ ...p, status_kebersihan: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Foto Kondisi</label>
            <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, foto: e.target.files[0] || null }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" />
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Catatan Tambahan</label>
          <textarea value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))} rows={3} placeholder="Contoh: Piket berjalan lancar..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
        </div>
        <button onClick={handleSubmit} disabled={saving} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-bold uppercase transition-colors disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Laporan'}</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-6 py-3 font-semibold">No</th>
              <th className="px-6 py-3 font-semibold">Tanggal</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Catatan</th>
              <th className="px-6 py-3 font-semibold">Dokumentasi</th>
              <th className="px-6 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item, idx) => {
              const statusInfo = STATUS_MAP[item.status_kebersihan] || { label: item.status_kebersihan, cls: 'bg-gray-100 text-gray-600' };
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{new Date(item.tanggal_penilaian).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4"><span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span></td>
                  <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-xs">{item.catatan || '—'}</td>
                  <td className="px-6 py-4">
                    {item.foto_url ? (
                      <button onClick={() => handleViewFile(item.foto_url)} className="text-blue-600 hover:underline text-xs font-semibold uppercase">Lihat Foto</button>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 text-xs font-semibold">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KebersihanPage;