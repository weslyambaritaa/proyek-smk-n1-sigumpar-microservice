import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vokasiApi } from '../../../api/vokasiApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export default function PelaporanProgresPage() {
  // ── State Form ──────────────────────────────────────────
  const [form, setForm] = useState({
    siswa_id: '',
    nama_siswa: '',
    tanggal: new Date().toISOString().split('T')[0],
    nilai_progres: '',
    judul_pekerjaan: '',
    deskripsi_pekerjaan: '',
  });
  const [fotoBukti, setFotoBukti] = useState(null);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── State Data ──────────────────────────────────────────
  const [siswaDaftar, setSiswaDaftar] = useState([]);
  const [historiProgres, setHistoriProgres] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────────
  const fetchSiswaList = async () => {
    try {
      const res = await vokasiApi.getSiswaList();
      setSiswaDaftar(res.data.data);
    } catch {
      // Silently fail jika belum ada data
    }
  };

  const fetchProgres = async (page = 1) => {
    setLoading(true);
    try {
      const res = await vokasiApi.getAllProgres({ page, limit: 5 });
      setHistoriProgres(res.data.data);
      setPagination({
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      });
    } catch {
      toast.error('Gagal memuat histori progres PKL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswaList();
    fetchProgres(1);
  }, []);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'siswa_id') {
      // Auto-fill nama siswa dari pilihan dropdown
      const siswa = siswaDaftar.find((s) => s.siswa_id === value);
      setForm((p) => ({
        ...p,
        siswa_id: value,
        nama_siswa: siswa ? siswa.nama_siswa : '',
      }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      siswa_id: '', nama_siswa: '',
      tanggal: new Date().toISOString().split('T')[0],
      nilai_progres: '', judul_pekerjaan: '', deskripsi_pekerjaan: '',
    });
    setFotoBukti(null);
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.siswa_id && !form.nama_siswa) {
      toast.error('Pilih atau isi nama siswa terlebih dahulu!');
      return;
    }
    if (!form.tanggal) {
      toast.error('Tanggal wajib diisi!');
      return;
    }
    if (form.nilai_progres !== '' && (parseInt(form.nilai_progres) < 0 || parseInt(form.nilai_progres) > 100)) {
      toast.error('Nilai progres harus antara 0 - 100');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      // Kalau siswa_id kosong (input manual), pakai nama_siswa sebagai id sementara
      fd.append('siswa_id', form.siswa_id || form.nama_siswa.toLowerCase().replace(/\s+/g, '-'));
      fd.append('nama_siswa', form.nama_siswa);
      fd.append('tanggal', form.tanggal);
      if (form.nilai_progres !== '') fd.append('nilai_progres', form.nilai_progres);
      fd.append('judul_pekerjaan', form.judul_pekerjaan);
      fd.append('deskripsi_pekerjaan', form.deskripsi_pekerjaan);
      if (fotoBukti) fd.append('foto_bukti', fotoBukti);

      if (editId) {
        await vokasiApi.updateProgres(editId, fd);
        toast.success('Laporan progres berhasil diperbarui!');
      } else {
        await vokasiApi.createProgres(fd);
        toast.success('Laporan & nilai berhasil dikirim!');
      }
      resetForm();
      fetchProgres(1);
      fetchSiswaList();
    } catch {
      toast.error('Gagal mengirim laporan progres');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      siswa_id: item.siswa_id || '',
      nama_siswa: item.nama_siswa || '',
      tanggal: item.tanggal ? item.tanggal.split('T')[0] : '',
      nilai_progres: item.nilai_progres !== null ? String(item.nilai_progres) : '',
      judul_pekerjaan: item.judul_pekerjaan || '',
      deskripsi_pekerjaan: item.deskripsi_pekerjaan || '',
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus laporan progres ini?')) return;
    try {
      await vokasiApi.deleteProgres(id);
      toast.success('Laporan dihapus');
      fetchProgres(pagination.page);
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  // Warna badge nilai
  const nilaiColor = (n) => {
    if (n === null || n === undefined) return 'text-gray-400';
    if (n >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (n >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (n >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
          Pelaporan Progres &amp; Nilai PKL
        </h1>
        <p className="text-sm text-blue-600 font-medium mt-1">
          Monitoring &amp; Penilaian Harian Siswa Vokasi
        </p>
      </div>

      {/* ── FORM CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
            📋
          </div>
          <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide">
            Catat Laporan &amp; Beri Nilai Progres
          </h2>
        </div>

        {/* Row 1: Pilih Siswa | Tanggal | Nilai */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Pilih Siswa</label>
            {siswaDaftar.length > 0 ? (
              <select
                name="siswa_id"
                value={form.siswa_id}
                onChange={handleChange}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">Pilih Siswa...</option>
                {siswaDaftar.map((s) => (
                  <option key={s.siswa_id} value={s.siswa_id}>
                    {s.nama_siswa}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="nama_siswa"
                value={form.nama_siswa}
                onChange={handleChange}
                placeholder="Nama Siswa (input manual)"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Nilai Progres (0-100)</label>
            <input
              type="number"
              name="nilai_progres"
              value={form.nilai_progres}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="Contoh: 85"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Row 2: Judul */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Judul Pekerjaan</label>
          <input
            name="judul_pekerjaan"
            value={form.judul_pekerjaan}
            onChange={handleChange}
            placeholder="Judul singkat progres..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Row 3: Deskripsi */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Deskripsi Pekerjaan</label>
          <textarea
            name="deskripsi_pekerjaan"
            value={form.deskripsi_pekerjaan}
            onChange={handleChange}
            rows={3}
            placeholder="Detail pekerjaan yang dilakukan siswa..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* Row 4: Upload & Submit */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Upload Foto Bukti</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoBukti(e.target.files[0])}
              className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex gap-2">
            {editId && (
              <button
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : editId ? 'Update Laporan' : 'Kirim Laporan & Nilai'}
            </button>
          </div>
        </div>
      </div>

      {/* ── HISTORI CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-blue-600 uppercase tracking-wide">
            Histori Laporan &amp; Penilaian
          </h2>
          {pagination.total > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {pagination.total} Laporan
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Memuat data...</p>
        ) : historiProgres.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Belum ada histori laporan progres PKL</p>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
              <div className="col-span-2">Foto</div>
              <div className="col-span-3">Informasi Siswa</div>
              <div className="col-span-4">Judul &amp; Deskripsi Pekerjaan</div>
              <div className="col-span-2">Tanggal</div>
              <div className="col-span-1">Nilai</div>
            </div>

            {historiProgres.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 py-4 border-b border-gray-50 items-start hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="col-span-2">
                  {item.foto_bukti ? (
                    <img
                      src={`${BASE_URL}${item.foto_bukti}`}
                      alt="Bukti"
                      className="w-16 h-14 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs text-center leading-tight p-1">
                      No Foto
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  <p className="font-semibold text-sm text-gray-800">{item.nama_siswa}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">Siswa Vokasi</p>
                </div>
                <div className="col-span-4">
                  <p className="font-bold text-xs text-gray-700 uppercase">{item.judul_pekerjaan || '-'}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.deskripsi_pekerjaan || '-'}</p>
                </div>
                <div className="col-span-2 text-xs text-gray-500">
                  {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="col-span-1 flex items-start justify-center pt-1">
                  {item.nilai_progres !== null ? (
                    <span
                      className={`text-sm font-bold border rounded-lg px-2 py-0.5 ${nilaiColor(item.nilai_progres)}`}
                    >
                      {item.nilai_progres}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-3">
              <button
                onClick={() => fetchProgres(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-gray-400 font-medium">
                Hal {pagination.page} dari {Math.max(pagination.totalPages, 1)}
              </span>
              <button
                onClick={() => fetchProgres(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
