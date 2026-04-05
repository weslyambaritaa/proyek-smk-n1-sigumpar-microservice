import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";
import { isImageUrl, getFileIcon, getFileName } from "../../utils/fileUtils";

export default function LaporanKegiatanPage() {
  const [laporan, setLaporan]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [form,    setForm]      = useState({
    judul: "", deskripsi: "", tanggal: new Date().toISOString().slice(0, 10),
  });
  const [file,        setFile]        = useState(null);
  // FIX #2: state untuk image preview modal
  const [previewSrc,  setPreviewSrc]  = useState(null);
  const [previewName, setPreviewName] = useState("");
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
      await vocationalApi.createLaporanKegiatan(fd);
      toast.success("Laporan berhasil disimpan!");
      setForm({ judul: "", deskripsi: "", tanggal: new Date().toISOString().slice(0, 10) });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadLaporan();
    } catch {
      toast.error("Gagal menyimpan laporan");
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

  // FIX #2: handler klik file — foto langsung preview, dokumen buka tab baru
  const handleFileClick = (e, fileUrl, fileName) => {
    if (isImageUrl(fileUrl)) {
      e.preventDefault();
      setPreviewSrc(fileUrl);
      setPreviewName(fileName || getFileName(fileUrl));
    }
    // Untuk PDF/DOCX: biarkan href default (buka tab baru via target="_blank")
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* FIX #2: Image Preview Modal */}
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewName}
          onClose={() => { setPreviewSrc(null); setPreviewName(""); }}
        />
      )}

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
                  type="text" value={form.judul} required
                  onChange={e => setForm(p => ({ ...p, judul: e.target.value }))}
                  placeholder="Judul laporan kegiatan..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label>
                <input
                  type="date" value={form.tanggal}
                  onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deskripsi Kegiatan</label>
              <textarea
                value={form.deskripsi} rows={3}
                onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
                placeholder="Deskripsi singkat kegiatan..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Upload File Laporan <span className="text-gray-400 normal-case font-normal">(opsional — PDF, DOCX, JPG, PNG)</span>
              </label>
              <input
                type="file" ref={fileRef}
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files[0] || null)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit" disabled={saving}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                {saving ? "Menyimpan..." : "Simpan Laporan"}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Riwayat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Riwayat Laporan</h2>
          </div>
          {loading ? (
            <div className="py-10 text-center text-gray-400">Memuat...</div>
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
                    <td className="px-5 py-3 text-center">
                      {l.file_url ? (
                        // FIX #2: foto → preview modal | dokumen → tab baru
                        <a
                          href={l.file_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => handleFileClick(e, l.file_url, l.file_nama)}
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full font-semibold transition-colors"
                        >
                          <span>{getFileIcon(l.file_url)}</span>
                          <span>{l.file_nama || "Lihat File"}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleHapus(l.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
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
