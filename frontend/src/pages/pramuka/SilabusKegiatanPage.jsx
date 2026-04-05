import { useState, useEffect, useRef } from "react";
import { vocationalApi } from "../../api/vocationalApi";
import toast from "react-hot-toast";

const TINGKAT_KELAS = ["Kelas X", "Kelas XI", "Kelas XII", "Semua Kelas"];

const isImageMime = (mime) => mime && mime.startsWith("image/");
const isPdfMime   = (mime) => mime === "application/pdf";

// ── Preview Modal (identik dengan PerangkatPage) ──────────────────────────
function PreviewModal({ doc, onClose }) {
  const [src, setSrc]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!doc) return;
    let objectUrl = null;
    setLoading(true); setError(null);

    vocationalApi.viewSilabus(doc.id, doc.file_nama).then((result) => {
      if (result.inline) {
        objectUrl = result.url;
        setSrc({ url: result.url, mime: result.mime });
      } else {
        // DOCX sudah di-download otomatis, tutup modal
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{doc.judul_kegiatan}</h2>
            <p className="text-xs text-gray-400">{doc.file_nama} • {doc.tingkat_kelas}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => vocationalApi.downloadSilabus(doc.id, doc.file_nama)}
              className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors"
            >⬇ Download</button>
            <button onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors">
              ✕ Tutup
            </button>
          </div>
        </div>
        {/* Content */}
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
              <iframe src={src.url} className="w-full h-[65vh] border-0" title={doc.judul_kegiatan} />
            ) : isImageMime(src.mime) ? (
              <img src={src.url} alt={doc.judul_kegiatan}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📄</p>
                <p className="text-gray-600 font-medium">{doc.file_nama}</p>
                <p className="text-sm text-gray-400 mt-2 mb-6">Format ini tidak dapat ditampilkan langsung di browser</p>
                <button
                  onClick={() => vocationalApi.downloadSilabus(doc.id, doc.file_nama)}
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
export default function SilabusKegiatanPage() {
  const [silabusList, setSilabusList] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [filterKelas, setFilterKelas] = useState("");
  const [previewDoc,  setPreviewDoc]  = useState(null);

  // Form state
  const [tingkatKelas,  setTingkatKelas]  = useState("Kelas X");
  const [judulKegiatan, setJudulKegiatan] = useState("");
  const [tanggal,       setTanggal]       = useState(new Date().toISOString().slice(0, 10));
  const [file,          setFile]          = useState(null);
  const fileRef = useRef();

  const loadSilabus = async () => {
    setLoading(true);
    try {
      const res = await vocationalApi.getAllSilabus();
      setSilabusList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error("Gagal memuat data silabus"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSilabus(); }, []);

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!judulKegiatan.trim()) { toast.error("Judul kegiatan wajib diisi"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("tingkat_kelas",  tingkatKelas);
      fd.append("judul_kegiatan", judulKegiatan.trim());
      fd.append("tanggal",        tanggal);
      if (file) fd.append("file", file);

      await toast.promise(vocationalApi.createSilabus(fd), {
        loading: "Menyimpan silabus...",
        success: "Silabus berhasil disimpan!",
        error: (e) => e?.response?.data?.error || "Gagal menyimpan silabus",
      });
      setJudulKegiatan(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadSilabus();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus silabus ini?")) return;
    try {
      await toast.promise(vocationalApi.deleteSilabus(id), {
        loading: "Menghapus...", success: "Silabus berhasil dihapus", error: "Gagal menghapus",
      });
      loadSilabus();
    } catch {}
  };

  const filtered = silabusList.filter((s) => !filterKelas || s.tingkat_kelas === filterKelas);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Silabus & Perangkat Kegiatan</h1>
        <p className="text-gray-500 mt-1">Upload, lihat, dan kelola dokumen silabus pramuka</p>
      </div>

      {/* Form Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📤 Tambah Silabus Baru</h2>
        <form onSubmit={handleSimpan}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tingkat Kelas</label>
              <select value={tingkatKelas} onChange={(e) => setTingkatKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                {TINGKAT_KELAS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judul Kegiatan</label>
              <input type="text" placeholder="Contoh: Silabus Kepramukaan Semester 1"
                value={judulKegiatan} onChange={(e) => setJudulKegiatan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">File (PDF/DOCX/Gambar)</label>
              <input type="file" ref={fileRef}
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {uploading ? "Menyimpan..." : "⬆ Simpan Silabus"}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Silabus */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">📁 Daftar Silabus Terupload</h2>
          <div className="flex items-center gap-3">
            <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Kelas</option>
              {TINGKAT_KELAS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {filtered.length} FILE
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📁</p>
            <p>Belum ada silabus yang diupload</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Tingkat Kelas</th>
                <th className="px-6 py-3 text-left">Judul Kegiatan</th>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">File</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                      {s.tingkat_kelas || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{s.judul_kegiatan}</td>
                  <td className="px-6 py-4 text-gray-500">{s.tanggal}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs truncate max-w-[150px]">
                    {s.file_nama || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {s.file_nama && (
                        <>
                          <button onClick={() => setPreviewDoc(s)} title="Lihat Dokumen"
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
                            👁 Lihat
                          </button>
                          <button onClick={() => vocationalApi.downloadSilabus(s.id, s.file_nama)} title="Download"
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors">
                            ⬇ Unduh
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(s.id)} title="Hapus"
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
