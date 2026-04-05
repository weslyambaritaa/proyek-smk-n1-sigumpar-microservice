import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";
import keycloak from "../../keycloak";

// ── Helper: deteksi tipe file dari URL ─────────────────────────────────────
const isImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
const isPDF   = (url) => url && /\.pdf$/i.test(url);

// ── Komponen: Modal Preview Lampiran ───────────────────────────────────────
function LampiranModal({ url, onClose }) {
  if (!url) return null;
  const img = isImage(url);
  const pdf = isPDF(url);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <p className="font-semibold text-gray-700 text-sm">Lampiran Dokumen</p>
          <div className="flex gap-2">
            <a
              href={url}
              download
              className="px-4 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
            >
              ⬇ Unduh
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-semibold"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center min-h-[300px]">
          {img && (
            <img
              src={url}
              alt="Lampiran"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow"
            />
          )}
          {pdf && (
            <iframe
              src={url}
              className="w-full h-[70vh] border-0"
              title="Lampiran PDF"
            />
          )}
          {!img && !pdf && (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📄</p>
              <p className="text-gray-600 font-medium text-sm mb-4">
                Format ini tidak dapat ditampilkan langsung
              </p>
              <a
                href={url}
                download
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                ⬇ Unduh File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParentingPage() {
  const waliId   = keycloak.tokenParsed?.sub;
  const namaWali = keycloak.tokenParsed?.name || "Wali Kelas";

  const [kelasList,      setKelasList]      = useState([]);
  const [selectedKelas,  setSelectedKelas]  = useState("");
  const [tanggal,        setTanggal]        = useState(new Date().toISOString().slice(0, 10));
  const [kehadiranOrtu,  setKehadiranOrtu]  = useState("");
  const [agenda,         setAgenda]         = useState("");
  const [ringkasan,      setRingkasan]      = useState("");
  const [file,           setFile]           = useState(null);
  const [filePreview,    setFilePreview]    = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [histori,        setHistori]        = useState([]);
  const [loadingHistori, setLoadingHistori] = useState(false);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const fileRef = useRef();

  const namaKelas = kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  useEffect(() => {
    academicApi.getAllKelas()
      .then((r) => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
  }, []);

  const loadHistori = async () => {
    if (!selectedKelas) return;
    setLoadingHistori(true);
    try {
      const res = await axiosInstance.get(`/api/academic/wali/parenting?kelas_id=${selectedKelas}`);
      setHistori(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setHistori([]); }
    finally { setLoadingHistori(false); }
  };

  useEffect(() => { loadHistori(); }, [selectedKelas]);

  // Preview lokal sebelum upload
  const handleFileChange = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(f ? `📄 ${f.name}` : null);
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    if (!agenda.trim()) { toast.error("Agenda utama wajib diisi"); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("kelas_id", selectedKelas);
      fd.append("wali_id", waliId || "");
      fd.append("tanggal", tanggal);
      fd.append("kehadiran_ortu", kehadiranOrtu || 0);
      fd.append("agenda", agenda);
      fd.append("ringkasan", ringkasan);
      if (file) fd.append("foto", file);

      await axiosInstance.post("/api/academic/wali/parenting", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Laporan parenting berhasil disimpan!");
      setAgenda("");
      setRingkasan("");
      setKehadiranOrtu("");
      setFile(null);
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      loadHistori(); // ← refresh otomatis setelah simpan
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan laporan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modal Preview */}
      <LampiranModal url={previewUrl} onClose={() => setPreviewUrl(null)} />

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">PARENTING KELAS MASSAL</h1>
        {selectedKelas && (
          <p className="text-sm text-blue-600 mt-0.5 font-medium">
            Wali Kelas: {namaWali} | {namaKelas}
          </p>
        )}
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Pilih Kelas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pilih Kelas</label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
          </select>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSimpan} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">👨‍👩‍👧</div>
            <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">Catat Pertemuan & Upload Dokumentasi</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal Pertemuan</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kehadiran Orang Tua</label>
                <input type="number" min="0" value={kehadiranOrtu} onChange={(e) => setKehadiranOrtu(e.target.value)}
                  placeholder="Jml Hadir"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Agenda Utama</label>
                <input type="text" value={agenda} onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Judul rapat..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Upload Foto/Dokumen</label>
                <input type="file" ref={fileRef} onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
                {/* Preview sebelum upload */}
                {filePreview && (
                  <div className="mt-2">
                    {file?.type?.startsWith("image/") ? (
                      <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    ) : (
                      <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">{filePreview}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Hasil Keputusan / Catatan Penting</label>
              <textarea value={ringkasan} onChange={(e) => setRingkasan(e.target.value)}
                placeholder="Ringkasan hasil pertemuan..."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider">
              {saving ? "Menyimpan..." : "Simpan Laporan & Lampiran"}
            </button>
          </div>
        </form>

        {/* Histori Pertemuan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Histori Pertemuan Kelas</h2>
            <button
              onClick={loadHistori}
              disabled={loadingHistori || !selectedKelas}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all"
            >
              {loadingHistori ? "..." : "↻ Refresh"}
            </button>
          </div>
          {loadingHistori ? (
            <div className="py-12 text-center text-gray-400">
              <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
              <p>Memuat data...</p>
            </div>
          ) : histori.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>{selectedKelas ? "Belum ada riwayat pertemuan" : "Pilih kelas untuk melihat histori"}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left w-8">No</th>
                  <th className="px-5 py-3 text-left">Tanggal & Agenda</th>
                  <th className="px-5 py-3 text-left">Kehadiran</th>
                  <th className="px-5 py-3 text-left">Ringkasan Hasil</th>
                  <th className="px-5 py-3 text-center">Lampiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {histori.map((h, i) => (
                  <tr key={h.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-blue-600 font-semibold">{h.tanggal}</p>
                      <p className="font-bold text-gray-800 uppercase text-xs mt-0.5">{h.agenda}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {h.kehadiran_ortu || 0} ORANGTUA
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs max-w-xs">{h.ringkasan || "—"}</td>
                    <td className="px-5 py-4">
                      {h.foto_url ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol LIHAT — buka modal preview */}
                          <button
                            onClick={() => setPreviewUrl(h.foto_url)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            👁 Lihat
                          </button>
                          {/* Tombol UNDUH */}
                          <a
                            href={h.foto_url}
                            download
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            ⬇ Unduh
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs text-center block">—</span>
                      )}
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
