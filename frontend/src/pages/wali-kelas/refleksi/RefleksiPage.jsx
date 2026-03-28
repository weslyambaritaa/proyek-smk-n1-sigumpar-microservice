import { useState, useEffect } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import toast from 'react-hot-toast';

const initialForm = { perkembanganSiswa: '', masalahKelas: '' };

const RefleksiPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await waliKelasApi.getAllRefleksi();
      setData(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data refleksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { perkembanganSiswa, masalahKelas } = form;
    if (!perkembanganSiswa || !masalahKelas) {
      toast.error('Semua field wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await waliKelasApi.updateRefleksi(editId, form);
        toast.success('Refleksi berhasil diperbarui');
        setEditId(null);
      } else {
        await waliKelasApi.createRefleksi(form);
        toast.success('Refleksi berhasil disimpan');
      }
      setForm(initialForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan refleksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id_refleksi);
    setForm({ perkembanganSiswa: item.perkembanganSiswa, masalahKelas: item.masalahKelas });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus refleksi ini?')) return;
    try {
      await waliKelasApi.deleteRefleksi(id);
      toast.success('Refleksi berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus refleksi');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Refleksi</h1>

      {/* ── Form ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 max-w-lg">
        {/* Perkembangan Siswa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Perkembangan Siswa</label>
          <textarea
            name="perkembanganSiswa"
            value={form.perkembanganSiswa}
            onChange={handleChange}
            placeholder="Perkembangan siswa"
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Masalah Kelas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Masalah Kelas</label>
          <textarea
            name="masalahKelas"
            value={form.masalahKelas}
            onChange={handleChange}
            placeholder="Masalah kelas"
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Tombol */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Menyimpan...' : editId ? 'Update Refleksi' : 'Simpan Refleksi'}
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

      {/* ── Riwayat Refleksi ── */}
      {!loading && data.length > 0 && (
        <div className="max-w-lg space-y-3">
          <h2 className="text-sm font-semibold text-gray-600">Riwayat Refleksi</h2>
          {data.map((item) => (
            <div key={item.id_refleksi} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Perkembangan Siswa</p>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">{item.perkembanganSiswa}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Masalah Kelas</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{item.masalahKelas}</p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 text-xs hover:underline">Edit</button>
                  <button onClick={() => handleDelete(item.id_refleksi)} className="text-red-500 text-xs hover:underline">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefleksiPage;