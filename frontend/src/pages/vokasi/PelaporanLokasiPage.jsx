import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vokasiApi } from '../../../api/vokasiApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export default function PelaporanLokasiPage() {
  // ── State Form ──────────────────────────────────────────
  const [form, setForm] = useState({
    nama_siswa: '',
    nama_perusahaan: '',
    alamat_singkat: '',
    tanggal: new Date().toISOString().split('T')[0],
    judul_penempatan: '',
    deskripsi_pekerjaan: '',
    pembimbing_industri: '',
    kontak_pembimbing: '',
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── State Daftar ────────────────────────────────────────
  const [daftarLokasi, setDaftarLokasi] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  // ── Fetch data ──────────────────────────────────────────
  const fetchLokasi = async (page = 1) => {
    setLoading(true);
    try {
      const res = await vokasiApi.getAllLokasi({ page, limit: 5 });
      setDaftarLokasi(res.data.data);
      setPagination({
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      });
    } catch {
      toast.error('Gagal memuat data lokasi PKL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLokasi(1); }, []);

  // ── Handlers ────────────────────────────────────────────
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({
      nama_siswa: '', nama_perusahaan: '', alamat_singkat: '',
      tanggal: new Date().toISOString().split('T')[0],
      judul_penempatan: '', deskripsi_pekerjaan: '',
      pembimbing_industri: '', kontak_pembimbing: '',
    });
    setFotoFile(null);
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.nama_siswa || !form.nama_perusahaan || !form.tanggal) {
      toast.error('Nama siswa, perusahaan, dan tanggal wajib diisi!');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (fotoFile) fd.append('foto_lokasi', fotoFile);

      if (editId) {
        await vokasiApi.updateLokasi(editId, fd);
        toast.success('Laporan berhasil diperbarui!');
      } else {
        await vokasiApi.createLokasi(fd);
        toast.success('Laporan berhasil disimpan!');
      }
      resetForm();
      fetchLokasi(1);
    } catch {
      toast.error('Gagal menyimpan laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      nama_siswa: item.nama_siswa || '',
      nama_perusahaan: item.nama_perusahaan || '',
      alamat_singkat: item.alamat_singkat || '',
      tanggal: item.tanggal ? item.tanggal.split('T')[0] : '',
      judul_penempatan: item.judul_penempatan || '',
      deskripsi_pekerjaan: item.deskripsi_pekerjaan || '',
      pembimbing_industri: item.pembimbing_industri || '',
      kontak_pembimbing: item.kontak_pembimbing || '',
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus laporan ini?')) return;
    try {
      await vokasiApi.deleteLokasi(id);
      toast.success('Laporan dihapus');
      fetchLokasi(pagination.page);
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
          Pelaporan Detail Penempatan PKL
        </h1>
        <p className="text-sm text-blue-600 font-medium mt-1">Guru Vokasi</p>
      </div>

      {/* ── FORM CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
            🏢
          </div>
          <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide">
            Informasi Lokasi &amp; Pekerjaan
          </h2>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Nama Siswa</label>
            <input
              name="nama_siswa"
              value={form.nama_siswa}
              onChange={handleChange}
              placeholder="Nama Siswa"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Nama Perusahaan</label>
            <input
              name="nama_perusahaan"
              value={form.nama_perusahaan}
              onChange={handleChange}
              placeholder="PT. ..."
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Alamat Singkat</label>
            <input
              name="alamat_singkat"
              value={form.alamat_singkat}
              onChange={handleChange}
              placeholder="Kota / Kab"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
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
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Judul Penempatan / Posisi</label>
            <input
              name="judul_penempatan"
              value={form.judul_penempatan}
              onChange={handleChange}
              placeholder="Contoh: Teknisi Jaringan / Admin"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Deskripsi Utama Pekerjaan</label>
            <input
              name="deskripsi_pekerjaan"
              value={form.deskripsi_pekerjaan}
              onChange={handleChange}
              placeholder="Tugas utama siswa..."
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Pembimbing Industri</label>
            <input
              name="pembimbing_industri"
              value={form.pembimbing_industri}
              onChange={handleChange}
              placeholder="Nama Atasan"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Kontak Pembimbing</label>
            <input
              name="kontak_pembimbing"
              value={form.kontak_pembimbing}
              onChange={handleChange}
              placeholder="WhatsApp"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Foto Lokasi</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files[0])}
              className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : editId ? 'Update Laporan' : 'Simpan Laporan'}
            </button>
            {editId && (
              <button
                onClick={resetForm}
                className="px-3 py-2.5 rounded-xl text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── DAFTAR CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-blue-600 uppercase tracking-wide mb-4">
          Daftar Penempatan &amp; Tugas PKL
        </h2>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Memuat data...</p>
        ) : daftarLokasi.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Belum ada data penempatan PKL</p>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
              <div className="col-span-1">No</div>
              <div className="col-span-2">Foto</div>
              <div className="col-span-3">Siswa &amp; Lokasi</div>
              <div className="col-span-3">Judul &amp; Deskripsi Tugas</div>
              <div className="col-span-2">Pembimbing</div>
              <div className="col-span-1">Aksi</div>
            </div>

            {/* Table Rows */}
            {daftarLokasi.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 py-4 border-b border-gray-50 items-start hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="col-span-1 text-sm text-gray-500 font-medium pt-1">
                  {(pagination.page - 1) * 5 + idx + 1}
                </div>
                <div className="col-span-2">
                  {item.foto_lokasi ? (
                    <img
                      src={`${BASE_URL}${item.foto_lokasi}`}
                      alt="Foto Lokasi"
                      className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                      No Foto
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  <p className="font-semibold text-sm text-gray-800">{item.nama_siswa}</p>
                  <p className="text-xs text-blue-600 font-semibold uppercase mt-0.5">{item.nama_perusahaan}</p>
                  <p className="text-xs text-gray-400">{item.alamat_singkat}</p>
                </div>
                <div className="col-span-3">
                  <p className="font-bold text-xs text-gray-700 uppercase">{item.judul_penempatan || '-'}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.deskripsi_pekerjaan || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-700">{item.pembimbing_industri || '-'}</p>
                  <p className="text-xs text-blue-500">{item.kontak_pembimbing || ''}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                <div className="col-span-1 flex flex-col gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-3">
              <button
                onClick={() => fetchLokasi(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-gray-400 font-medium">
                Hal {pagination.page} dari {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchLokasi(pagination.page + 1)}
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
