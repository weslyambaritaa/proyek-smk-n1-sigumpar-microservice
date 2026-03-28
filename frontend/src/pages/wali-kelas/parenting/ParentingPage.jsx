import { useState, useEffect } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import toast from 'react-hot-toast';

const initialForm = {
  tanggal: '',
  ringkasanDiskusi: '',
  jumlahHadir: '',
  jumlahTotal: '',
  foto: null,
};

const ParentingPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await waliKelasApi.getAllParenting();
      setData(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data parenting');
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
    const { tanggal, ringkasanDiskusi, jumlahHadir, jumlahTotal } = form;
    if (!tanggal || !ringkasanDiskusi || !jumlahHadir || !jumlahTotal) {
      toast.error('Semua field wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tanggal,
        ringkasanDiskusi,
        jumlahHadir: parseInt(jumlahHadir),
        jumlahTotal: parseInt(jumlahTotal),
      };

      if (editId) {
        await waliKelasApi.updateParenting(editId, payload);
        toast.success('Data parenting berhasil diperbarui');
        setEditId(null);
      } else {
        await waliKelasApi.createParenting(payload);
        toast.success('Data parenting berhasil ditambahkan');
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
    setEditId(item.id_parenting);
    setForm({
      tanggal: item.tanggal,
      ringkasanDiskusi: item.ringkasanDiskusi,
      jumlahHadir: String(item.jumlahHadir),
      jumlahTotal: String(item.jumlahTotal),
      foto: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data parenting ini?')) return;
    try {
      await waliKelasApi.deleteParenting(id);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  const handleBatal = () => {
    setEditId(null);
    setForm(initialForm);
  };

  // Hitung persentase kehadiran untuk tampilan tabel
  const hitungPresentase = (hadir, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((hadir / total) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Parenting</h1>

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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none"
            />
          </div>
        </div>

        {/* Ringkasan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ringkasan</label>
          <textarea
            name="ringkasanDiskusi"
            value={form.ringkasanDiskusi}
            onChange={handleChange}
            placeholder="Catatan"
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Presentase (jumlah hadir / total) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Presentase</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="jumlahHadir"
              value={form.jumlahHadir}
              onChange={handleChange}
              placeholder="Hadir"
              min={0}
              className="w-1/2 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="number"
              name="jumlahTotal"
              value={form.jumlahTotal}
              onChange={handleChange}
              placeholder="Total Siswa"
              min={1}
              className="w-1/2 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {form.jumlahHadir && form.jumlahTotal && (
            <p className="text-xs text-gray-500 mt-1">
              Kehadiran: {hitungPresentase(form.jumlahHadir, form.jumlahTotal)}
            </p>
          )}
        </div>

        {/* Upload Foto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Foto</label>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
            <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs text-gray-500">Upload Dokumen Surat Panggilan</span>
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
              onClick={handleBatal}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>

      {/* ── Tabel Riwayat ── */}
      {!loading && data.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1a5fa8] text-white text-sm">
                <th className="px-4 py-3 text-center font-semibold">No</th>
                <th className="px-4 py-3 text-center font-semibold">Nama</th>
                <th className="px-4 py-3 text-center font-semibold">Kehadiran</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id_parenting} className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-700">{idx + 1}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-blue-600">{item.tanggal}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-700">
                    {hitungPresentase(item.jumlahHadir, item.jumlahTotal)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 text-sm hover:underline mr-2">edit</button>
                    <button onClick={() => handleDelete(item.id_parenting)} className="text-red-500 text-sm hover:underline">hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentingPage;