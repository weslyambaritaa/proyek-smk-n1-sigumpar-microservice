import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';

const RefleksiPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    tanggal: today,
    judul_refleksi: '',
    isi_refleksi: '',
  });

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

  const handleSubmit = async () => {
    if (!form.tanggal || !form.judul_refleksi.trim()) {
      toast.error('Tanggal dan judul refleksi wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await waliKelasApi.createRefleksi({
        kelas_id: parseInt(selectedKelasId),
        tanggal: form.tanggal,
        judul_refleksi: form.judul_refleksi,
        isi_refleksi: form.isi_refleksi,
      });
      toast.success('Catatan refleksi berhasil disimpan');
      setForm({ tanggal: today, judul_refleksi: '', isi_refleksi: '' });
      fetchData();
    } catch {
      toast.error('Gagal menyimpan catatan refleksi');
    } finally {
      setSaving(false);
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

  const selectedKelas = kelasList.find(k => String(k.id) === selectedKelasId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Refleksi Wali Kelas</h1>
          {selectedKelas && (
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              Wali Kelas | {selectedKelas.nama_kelas}
            </p>
          )}
        </div>
        <select
          value={selectedKelasId}
          onChange={e => setSelectedKelasId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {kelasList.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {/* Form Tulis Refleksi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">📝</div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Tulis Catatan Refleksi
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Tanggal
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Judul Refleksi */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Judul Refleksi
            </label>
            <input
              type="text"
              value={form.judul_refleksi}
              onChange={e => setForm(p => ({ ...p, judul_refleksi: e.target.value }))}
              placeholder="Contoh: Evaluasi Tengah Semester"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Isi Refleksi */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Isi Refleksi / Evaluasi
          </label>
          <textarea
            value={form.isi_refleksi}
            onChange={e => setForm(p => ({ ...p, isi_refleksi: e.target.value }))}
            rows={4}
            placeholder="Tuliskan hasil refleksi Anda terhadap perkembangan kelas..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Catatan Refleksi'}
        </button>
      </div>

      {/* Histori Refleksi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Histori Refleksi Kelas
          </h2>
          {data.length > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {data.length} CATATAN
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">Belum ada catatan refleksi</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 font-semibold">No</th>
                <th className="px-6 py-3 font-semibold">Tanggal</th>
                <th className="px-6 py-3 font-semibold">Judul Refleksi</th>
                <th className="px-6 py-3 font-semibold">Isi Evaluasi</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-blue-600 text-xs font-medium">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      year: 'numeric', month: '2-digit', day: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 uppercase text-xs">
                    {item.judul_refleksi}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-sm text-xs truncate">
                    {item.isi_refleksi || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
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
    </div>
  );
};

export default RefleksiPage;