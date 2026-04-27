import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';

const ParentingPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isKelasLoaded, setIsKelasLoaded] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    tanggal: today,
    kehadiran_ortu: '',
    agenda_utama: '',
    ringkasan_hasil: '',
    foto: null,
  });

  // Fungsi untuk melihat file via axios agar token ter-attach (menghindari 401)
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

  // 🔹 Fetch daftar kelas
  useEffect(() => {
    const loadKelas = async () => {
      try {
        const res = await academicApi.getAllKelas();
        const kelasData = res.data || [];
        setKelasList(kelasData);
        if (kelasData.length > 0) {
          setSelectedKelasId(String(kelasData[0].id));
        }
      } catch (err) {
        toast.error('Gagal memuat daftar kelas');
      } finally {
        setIsKelasLoaded(true);
      }
    };
    loadKelas();
  }, []);

  // 🔹 Fetch data parenting ketika kelas dipilih
  useEffect(() => {
    if (selectedKelasId) fetchData();
  }, [selectedKelasId]);

  const fetchData = () => {
    setLoading(true);
    waliKelasApi.getAllParenting(selectedKelasId)
      .then(res => setData(res.data?.data || []))
      .catch(() => toast.error('Gagal memuat data parenting'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!selectedKelasId || !form.tanggal || !form.agenda_utama.trim()) {
      toast.error('Data belum lengkap');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('kelas_id', selectedKelasId);
      fd.append('tanggal', form.tanggal);
      fd.append('kehadiran_ortu', form.kehadiran_ortu || 0);
      fd.append('agenda_utama', form.agenda_utama);
      fd.append('ringkasan_hasil', form.ringkasan_hasil);
      if (form.foto) fd.append('foto', form.foto);

      await waliKelasApi.createParenting(fd);
      toast.success('Laporan parenting berhasil disimpan');
      setForm({ tanggal: today, kehadiran_ortu: '', agenda_utama: '', ringkasan_hasil: '', foto: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan laporan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan pertemuan ini?')) return;
    try {
      await waliKelasApi.deleteParenting(id);
      toast.success('Catatan berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus catatan');
    }
  };

  const selectedKelas = kelasList.find(k => String(k.id) === selectedKelasId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parenting Kelas Massal</h1>
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

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Tanggal</label>
            <input type="date" value={form.tanggal} onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Kehadiran Ortu</label>
            <input type="number" value={form.kehadiran_ortu} onChange={e => setForm(p => ({ ...p, kehadiran_ortu: e.target.value }))} placeholder="Jml Hadir" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Agenda Utama</label>
            <input type="text" value={form.agenda_utama} onChange={e => setForm(p => ({ ...p, agenda_utama: e.target.value }))} placeholder="Judul rapat..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Foto/Dokumen</label>
            <input type="file" accept="image/*,.pdf" onChange={e => setForm(p => ({ ...p, foto: e.target.files[0] || null }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" />
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Hasil / Catatan</label>
          <textarea value={form.ringkasan_hasil} onChange={e => setForm(p => ({ ...p, ringkasan_hasil: e.target.value }))} rows={3} placeholder="Ringkasan..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
        </div>
        <button onClick={handleSubmit} disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold uppercase disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Laporan'}</button>
      </div>

      {/* Histori */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-6 py-3 font-semibold">No</th>
              <th className="px-6 py-3 font-semibold">Tanggal & Agenda</th>
              <th className="px-6 py-3 font-semibold">Kehadiran</th>
              <th className="px-6 py-3 font-semibold">Hasil</th>
              <th className="px-6 py-3 font-semibold">Lampiran</th>
              <th className="px-6 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                <td className="px-6 py-4">
                  <p className="text-blue-600 text-xs">{new Date(item.tanggal).toLocaleDateString('id-ID')}</p>
                  <p className="font-semibold text-gray-800 uppercase text-xs">{item.agenda_utama}</p>
                </td>
                <td className="px-6 py-4 font-semibold text-xs text-blue-600">{item.kehadiran_ortu || 0} ORTU</td>
                <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-xs">{item.ringkasan_hasil || '—'}</td>
                <td className="px-6 py-4">
                  {item.foto_url ? (
                    <button onClick={() => handleViewFile(item.foto_url)} className="text-blue-600 hover:underline text-xs font-semibold uppercase">
                      {item.foto_url.endsWith('.pdf') ? '📄 Lihat PDF' : '🖼️ Lihat Foto'}
                    </button>
                  ) : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 text-xs font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentingPage;