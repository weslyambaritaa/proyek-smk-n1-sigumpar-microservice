import { useState, useEffect } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import toast from 'react-hot-toast';

const initialForm = { tanggal: '', catatanKondisi: '', foto: null };

const KebersihanKelasPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await waliKelasApi.getAllKebersihanKelas();
      setData(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data kebersihan kelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto') {
      setForm((prev) => ({ ...prev, foto: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const { tanggal, catatanKondisi } = form;
    if (!tanggal || !catatanKondisi) {
      toast.error('Tanggal dan Catatan Kondisi wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { tanggal, catatanKondisi };
      if (editId) {
        await waliKelasApi.updateKebersihanKelas(editId, payload);
        toast.success('Catatan kebersihan berhasil diperbarui');
        setEditId(null);
      } else {
        await waliKelasApi.createKebersihanKelas(payload);
        toast.success('Catatan kebersihan berhasil ditambahkan');
      }
      setForm(initialForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id_kebersihanKelas);
    setForm({ tanggal: item.tanggal, catatanKondisi: item.catatanKondisi, foto: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus catatan kebersihan ini?')) return;
    try {
      await waliKelasApi.deleteKebersihanKelas(id);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Kebersihan Kelas</h1>

      {/* ── Form ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 max-w-lg">
        {/* Tanggal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
          <div className="relative">
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Catatan Kondisi */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Kondisi</label>
          <textarea
            name="catatanKondisi"
            value={form.catatanKondisi}
            onChange={handleChange}
            placeholder="Catatan"
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Upload Foto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Foto</label>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
            <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs text-gray-500">Upload Dokumentasi kebersihan</span>
            <span className="text-xs text-gray-400">Max. 5 MB</span>
            <input type="file" name="foto" accept="image/*" onChange={handleChange} className="hidden" />
          </label>
          {form.foto && <p className="text-xs text-gray-500 mt-1">📎 {form.foto.name}</p>}
        </div>

        {/* Tombol */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Menyimpan...' : editId ? 'Update' : 'Selanjutnya'}
          </button>
          {editId && (
            <button
              onClick={() => { setEditId(null); setForm(initialForm); }}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>

      {/* ── Riwayat ── */}
      {!loading && data.length > 0 && (
        <div className="max-w-lg space-y-3">
          <h2 className="text-sm font-semibold text-gray-600">Riwayat Catatan</h2>
          {data.map((item) => (
            <div key={item.id_kebersihanKelas} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{item.tanggal}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.catatanKondisi}</p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 text-xs hover:underline">Edit</button>
                  <button onClick={() => handleDelete(item.id_kebersihanKelas)} className="text-red-500 text-xs hover:underline">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KebersihanKelasPage;