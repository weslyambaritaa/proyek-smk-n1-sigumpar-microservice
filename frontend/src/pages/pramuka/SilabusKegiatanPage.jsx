import { useState, useEffect, useRef } from "react";
import { vocationalApi } from "../../api/vocationalApi";
import toast from "react-hot-toast";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";
import { isImageUrl, getFileIcon, getFileName } from "../../utils/fileUtils";

const TINGKAT_KELAS = ["Kelas X", "Kelas XI", "Kelas XII", "Semua Kelas"];

export default function SilabusKegiatanPage() {
  const [silabusList, setSilabusList] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [filterKelas, setFilterKelas] = useState("");
  // FIX #2: state untuk image preview modal
  const [previewSrc,  setPreviewSrc]  = useState(null);
  const [previewName, setPreviewName] = useState("");

  // Form state
  const [tingkatKelas,    setTingkatKelas]    = useState("Kelas X");
  const [judulKegiatan,   setJudulKegiatan]   = useState("");
  const [tanggal,         setTanggal]         = useState(new Date().toISOString().slice(0, 10));
  const [file,            setFile]            = useState(null);
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
      fd.append("tingkat_kelas", tingkatKelas);
      fd.append("judul_kegiatan", judulKegiatan.trim());
      fd.append("tanggal", tanggal);
      if (file) fd.append("file", file);
      await vocationalApi.createSilabus(fd);
      toast.success("Silabus & Perangkat berhasil disimpan!");
      setJudulKegiatan("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadSilabus();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan silabus");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus silabus ini?")) return;
    try {
      await vocationalApi.deleteSilabus(id);
      toast.success("Silabus berhasil dihapus");
      loadSilabus();
    } catch { toast.error("Gagal menghapus silabus"); }
  };

  // FIX #2: foto → preview modal, dokumen → tab baru
  const handleFileClick = (e, fileUrl, fileName) => {
    if (isImageUrl(fileUrl)) {
      e.preventDefault();
      setPreviewSrc(fileUrl);
      setPreviewName(fileName || getFileName(fileUrl));
    }
  };

  const filtered = silabusList.filter((s) => !filterKelas || s.tingkat_kelas === filterKelas);

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
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">SILABUS DAN PERANGKAT KEGIATAN</h1>
        <p className="text-sm text-blue-600 font-medium mt-0.5">PRAMUKA SMK N 1 SIGUMPAR</p>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Form Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSimpan}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Pilih Tingkat Kelas
                </label>
                <div className="relative">
                  <select value={tingkatKelas} onChange={(e) => setTingkatKelas(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {TINGKAT_KELAS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Judul Kegiatan
                </label>
                <input type="text" value={judulKegiatan} onChange={(e) => setJudulKegiatan(e.target.value)}
                  placeholder="Ketik judul kegiatan..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Materi / Silabus (Dokumen)
                </label>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0] || null)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" disabled={uploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider">
              {uploading ? "Menyimpan..." : "Simpan Silabus & Perangkat"}
            </button>
          </form>
        </div>

        {/* Daftar Silabus */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Daftar Silabus & Perangkat</h2>
            <div className="flex items-center gap-3">
              <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Semua Kelas</option>
                {TINGKAT_KELAS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📚</p>
              <p>Belum ada silabus yang ditambahkan</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Kelas</th>
                  <th className="px-5 py-3 text-left">Judul Kegiatan</th>
                  <th className="px-5 py-3 text-left">Dokumen</th>
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        {s.tingkat_kelas || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{s.judul_kegiatan}</td>
                    <td className="px-5 py-3">
                      {s.file_url ? (
                        // FIX #2: foto → preview modal | dokumen → tab baru
                        <a
                          href={s.file_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => handleFileClick(e, s.file_url, getFileName(s.file_url))}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs uppercase"
                        >
                          <span>{getFileIcon(s.file_url)}</span>
                          <span>Lihat Materi</span>
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{s.tanggal}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleDelete(s.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50">
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
