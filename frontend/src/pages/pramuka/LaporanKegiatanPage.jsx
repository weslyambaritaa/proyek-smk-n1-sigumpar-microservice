import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const isImageMime = (mime) => mime && mime.startsWith("image/");
const isPdfMime   = (mime) => mime === "application/pdf";

// ── Preview Modal ─────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }) {
  const [src,     setSrc]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!doc) return;
    let objectUrl = null;
    setLoading(true); setError(null);

    vocationalApi.viewLaporanKegiatan(doc.id, doc.file_nama).then((result) => {
      if (result.inline) {
        objectUrl = result.url;
        setSrc({ url: result.url, mime: result.mime });
      } else {
        onClose();
      }
      setLoading(false);
    }).catch(() => {
      setError("Gagal memuat file");
      setLoading(false);
    });

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [doc]);

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{doc.judul}</h2>
            <p className="text-xs text-gray-400">{doc.file_nama}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => vocationalApi.downloadLaporanKegiatan(doc.id, doc.file_nama)}
              className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors"
            >⬇ Download</button>
            <button onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors">
              ✕ Tutup
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-[400px]">
          {loading && (
            <div className="text-center text-gray-400">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p>Memuat dokumen...</p>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && src && (
            isPdfMime(src.mime) ? (
              <iframe src={src.url} className="w-full h-[65vh] border-0" title={doc.judul} />
            ) : isImageMime(src.mime) ? (
              <img src={src.url} alt={doc.judul}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📄</p>
                <p className="text-gray-600 font-medium">{doc.file_nama}</p>
                <p className="text-sm text-gray-400 mt-2 mb-6">Format ini tidak dapat ditampilkan langsung di browser</p>
                <button
                  onClick={() => vocationalApi.downloadLaporanKegiatan(doc.id, doc.file_nama)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >⬇ Download untuk Membuka</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Halaman Utama ─────────────────────────────────────────────────────────
export default function LaporanKegiatanPage() {
  const [laporan,    setLaporan]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);   // untuk ImagePreviewModal foto
  const [form, setForm] = useState({
    judul: "", deskripsi: "", tanggal: new Date().toISOString().slice(0, 10),
  });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const loadLaporan = async () => {
    setLoading(true);
    try {
      const res = await vocationalApi.getAllLaporanKegiatan();
      setLaporan(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error("Gagal memuat data laporan"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadLaporan(); }, []);

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!form.judul) { toast.error("Judul laporan wajib diisi"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("judul",     form.judul);
      fd.append("deskripsi", form.deskripsi);
      fd.append("tanggal",   form.tanggal);
      if (file) fd.append("file_laporan", file);

      await toast.promise(vocationalApi.createLaporanKegiatan(fd), {
        loading: "Menyimpan laporan...",
        success: "Laporan berhasil disimpan!",
        error:   (e) => e?.response?.data?.error || "Gagal menyimpan laporan",
      });
      setForm({ judul: "", deskripsi: "", tanggal: new Date().toISOString().slice(0, 10) });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadLaporan();
    } finally { setSaving(false); }
  };

  const handleHapus = async (id, judul) => {
    if (!window.confirm(`Hapus laporan "${judul}"?`)) return;
    try {
      await toast.promise(vocationalApi.deleteLaporanKegiatan(id), {
        loading: "Menghapus...", success: "Laporan berhasil dihapus", error: "Gagal menghapus",
      });
      loadLaporan();
    } catch {}
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
      {previewImg && (
        <ImagePreviewModal
          src={previewImg}
          fileName="Foto Laporan Kegiatan"
          onClose={() => setPreviewImg(null)}
        />
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Kegiatan Pramuka</h1>
        <p className="text-gray-500 mt-1">Upload, lihat, dan kelola laporan kegiatan pramuka</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📤 Tambah Laporan Baru</h2>
        <form onSubmit={handleSimpan}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judul Laporan</label>
              <input type="text" placeholder="Contoh: Laporan Kegiatan PJOK Bulan Januari"
                value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal</label>
              <input type="date" value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deskripsi</label>
              <textarea rows={3} placeholder="Deskripsi singkat kegiatan..."
                value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">File Laporan (PDF/DOCX/Gambar)</label>
              <input type="file" ref={fileRef}
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {saving ? "Menyimpan..." : "⬆ Simpan Laporan"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">📁 Daftar Laporan Kegiatan</h2>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {laporan.length} FILE
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p>Memuat data...</p>
          </div>
        ) : laporan.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📁</p>
            <p>Belum ada laporan yang diupload</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Judul</th>
                <th className="px-6 py-3 text-left">Deskripsi</th>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">File</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {laporan.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">{l.judul}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{l.deskripsi || "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{l.tanggal}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs truncate max-w-[120px]">
                    {l.file_nama ? (
                      /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(l.file_nama) ? (
                        <button
                          onClick={async () => {
                            try {
                              const result = await vocationalApi.viewLaporanKegiatan(l.id, l.file_nama);
                              if (result.inline) setPreviewImg(result.url);
                            } catch { toast.error("Gagal memuat foto"); }
                          }}
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-semibold transition-colors"
                          title="Klik untuk lihat foto"
                        >
                          🖼️ <span className="truncate max-w-[90px]">{l.file_nama}</span>
                        </button>
                      ) : (
                        <span className="text-gray-400">{l.file_nama}</span>
                      )
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {l.file_nama && (
                        <>
                          <button onClick={() => setPreviewDoc(l)} title="Lihat Dokumen"
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
                            👁 Lihat
                          </button>
                          <button onClick={() => vocationalApi.downloadLaporanKegiatan(l.id, l.file_nama)} title="Download"
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors">
                            ⬇ Unduh
                          </button>
                        </>
                      )}
                      <button onClick={() => handleHapus(l.id, l.judul)} title="Hapus"
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">
                        🗑 Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}