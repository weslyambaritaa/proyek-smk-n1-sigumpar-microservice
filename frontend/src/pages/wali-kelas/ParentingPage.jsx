import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";
import keycloak from "../../keycloak";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

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
  const [fotoPreview,    setFotoPreview]    = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [histori,        setHistori]        = useState([]);
  const [loadingHistori, setLoadingHistori] = useState(false);
  const [previewSrc,     setPreviewSrc]     = useState(null);
  const [previewName,    setPreviewName]    = useState("");

  const fileInputRef = useRef();

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

  const handleFotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleRemoveFoto = () => {
    setFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    if (!agenda.trim())  { toast.error("Agenda utama wajib diisi");   return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("kelas_id",       selectedKelas);
      fd.append("wali_id",        waliId || "");
      fd.append("tanggal",        tanggal);
      fd.append("kehadiran_ortu", kehadiranOrtu || 0);
      fd.append("agenda",         agenda);
      fd.append("ringkasan",      ringkasan);
      if (file) fd.append("foto", file);

      await axiosInstance.post("/api/academic/wali/parenting", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Laporan parenting berhasil disimpan!");
      setAgenda(""); setRingkasan(""); setKehadiranOrtu("");
      setFile(null); setFotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadHistori();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan laporan");
    } finally {
      setSaving(false);
    }
  };

  const bukaFoto = (e, url, nama) => {
    e.preventDefault();
    if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)) {
      setPreviewSrc(url);
      setPreviewName(nama || "Lampiran Parenting");
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewName}
          onClose={() => { setPreviewSrc(null); setPreviewName(""); }}
        />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">PARENTING KELAS MASSAL</h1>
        {selectedKelas && (
          <p className="text-sm text-blue-600 mt-0.5 font-medium">
            Wali Kelas: {namaWali} | {namaKelas}
          </p>
        )}
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">

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

        <form onSubmit={handleSimpan} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">👨‍👩‍👧</div>
            <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">Catat Pertemuan & Upload Dokumentasi</h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Hasil Keputusan / Catatan Penting</label>
                  <textarea
                    value={ringkasan} onChange={(e) => setRingkasan(e.target.value)}
                    placeholder="Ringkasan hasil pertemuan..."
                    rows={5}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider">
                  {saving ? "Menyimpan..." : "Simpan Laporan & Lampiran"}
                </button>
              </div>

              <div className="w-full md:w-56 flex flex-col gap-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Foto / Dokumen
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden"
                >
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview foto" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="text-4xl text-gray-300 mb-2">📷</div>
                      <p className="text-xs text-gray-400 text-center px-3">Klik untuk upload foto / dokumen</p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFotoChange}
                />

                {fotoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveFoto}
                    className="text-xs text-red-400 hover:text-red-600 text-center transition-colors"
                  >
                    ✕ Hapus foto
                  </button>
                )}

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  JPG, PNG, PDF<br />Maks 10MB
                </p>
              </div>

            </div>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Histori Pertemuan Kelas</h2>
          </div>

          {loadingHistori ? (
            <div className="py-12 text-center text-gray-400">
              <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
              <p>Memuat data...</p>
            </div>
          ) : histori.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>Belum ada riwayat pertemuan</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left w-8">No</th>
                  <th className="px-5 py-3 text-left">Tanggal & Agenda</th>
                  <th className="px-5 py-3 text-left">Kehadiran</th>
                  <th className="px-5 py-3 text-left">Ringkasan Hasil</th>
                  <th className="px-5 py-3 text-left">Lampiran</th>
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
                    <td className="px-5 py-3">
                      {h.foto_url ? (
                        <a
                          href={h.foto_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => bukaFoto(e, h.foto_url, `Lampiran — ${h.agenda}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-blue-200"
                        >
                          {/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(h.foto_url) ? "🖼️ Lihat Foto" : "📄 Lihat File"}
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
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