import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";

// ── Helper deteksi tipe file ───────────────────────────────────────────────
const isImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
const isPDF   = (url) => url && /\.pdf$/i.test(url);

// ── Modal Preview File ─────────────────────────────────────────────────────
function FilePreviewModal({ item, onClose }) {
  if (!item) return null;
  const url  = item.file_url;
  const nama = item.file_nama || item.judul || "Laporan";
  const img  = isImage(url);
  const pdf  = isPDF(url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800">{item.judul}</h2>
            <p className="text-xs text-gray-400">{nama} • {item.tanggal}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={url}
              download
              className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors"
            >
              ⬇ Unduh
            </a>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
            >
              ↗ Tab Baru
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-semibold"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
        {/* Konten */}
        <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center min-h-[350px]">
          {pdf && (
            <iframe src={url} className="w-full h-[65vh] border-0" title={nama} />
          )}
          {img && (
            <img src={url} alt={nama} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
          )}
          {!pdf && !img && (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📄</p>
              <p className="text-gray-600 font-medium">{nama}</p>
              <p className="text-sm text-gray-400 mt-2 mb-6">Format ini tidak dapat ditampilkan langsung di browser</p>
              <a
                href={url}
                download
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                ⬇ Unduh untuk Membuka
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LaporanKegiatanPage() {
  const [laporan,     setLaporan]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [form,        setForm]        = useState({ judul: "", deskripsi: "", tanggal: new Date().toISOString().slice(0, 10) });
  const [file,        setFile]        = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const fileRef = useRef();

  const loadLaporan = async () => {
    setLoading(true);
    try {
      const res = await vocationalApi.getAllLaporanKegiatan();
      setLaporan(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLaporan(); }, []);

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!form.judul) { toast.error("Judul laporan wajib diisi"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("judul", form.judul);
      fd.append("deskripsi", form.deskripsi);
      fd.append("tanggal", form.tanggal);
      if (file) fd.append("file_laporan", file);

      await toast.promise(
        vocationalApi.createLaporanKegiatan(fd),
        {
          loading: "Menyimpan laporan...",
          success: "Laporan berhasil disimpan!",
          error: (e) => e?.response?.data?.error || "Gagal menyimpan laporan",
        }
      );
      setForm({ judul: "", deskripsi: "", tanggal: new Date().toISOString().slice(0, 10) });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadLaporan(); // ← auto-refresh
    } finally {
      setSaving(false);
    }
  };

  const handleHapus = async (id) => {
    if (!window.confirm("Hapus laporan ini?")) return;
    try {
      await vocationalApi.deleteLaporanKegiatan(id);
      toast.success("Laporan dihapus");
      setLaporan(prev => prev.filter(l => l.id !== id));
    } catch {
      toast.error("Gagal menghapus laporan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modal Preview */}
      <FilePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">LAPORAN KEGIATAN</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload dan kelola laporan kegiatan pramuka</p>
      </div>

      <div className="px-8 py-6 max-w-4xl mx-auto space-y-5">
        {/* Form Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-700 mb-4">Input Laporan Baru</h2>
          <form onSubmit={handleSimpan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Judul Laporan</label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={e => setForm(p => ({ ...p, judul: e.target.value }))}
                  required
                  placeholder="Judul laporan kegiatan..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deskripsi Kegiatan</label>
              <textarea
                value={form.deskripsi}
                onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
                rows={3}
                placeholder="Deskripsi singkat kegiatan..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Upload File Laporan <span className="text-gray-400 font-normal normal-case">(PDF / DOCX / Gambar)</span>
              </label>
              <input
                type="file"
                ref={fileRef}
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files[0] || null)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
              {file && (
                <p className="mt-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                  📎 {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                {saving ? "Menyimpan..." : "Simpan Laporan"}
              </button>
            </div>
          </form>
        </div>

        {/* Daftar Laporan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Riwayat Laporan</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{laporan.length} LAPORAN</span>
              <button
                onClick={loadLaporan}
                disabled={loading}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                {loading ? "..." : "↻ Refresh"}
              </button>
            </div>
          </div>
          {loading ? (
            <div className="py-10 text-center text-gray-400">
              <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
              <p>Memuat...</p>
            </div>
          ) : laporan.length === 0 ? (
            <div className="py-10 text-center text-gray-400">Belum ada laporan kegiatan</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Judul</th>
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-left">Deskripsi</th>
                  <th className="px-5 py-3 text-center">File</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {laporan.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 font-semibold text-gray-800">{l.judul}</td>
                    <td className="px-5 py-3 text-gray-500">{l.tanggal}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{l.deskripsi || "—"}</td>
                    <td className="px-5 py-3">
                      {l.file_url ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol BUKA — preview modal */}
                          <button
                            onClick={() => setPreviewItem(l)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            👁 Lihat
                          </button>
                          {/* Tombol UNDUH langsung */}
                          <a
                            href={l.file_url}
                            download
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            ⬇ Unduh
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 text-center block">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleHapus(l.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50"
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
    </div>
  );
}
