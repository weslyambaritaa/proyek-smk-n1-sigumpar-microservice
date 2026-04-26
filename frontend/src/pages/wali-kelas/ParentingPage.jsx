import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";
import axiosInstance from "../../api/axiosInstance";
import keycloak from "../../keycloak";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

// Helper: bangun URL lengkap untuk foto dari academic-service
// foto_url dari DB: "/api/academic/uploads/xxx.jpg"
// Di dev: Vite proxy /api → gateway, path relatif sudah cukup
// Di prod: gabungkan baseURL axiosInstance
function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  const base = axiosInstance.defaults.baseURL || "";
  return base ? `${base}${foto_url}` : foto_url;
}

export default function ParentingPage() {
  const waliId = keycloak.tokenParsed?.sub;
  const namaWali = keycloak.tokenParsed?.name || "Wali Kelas";

  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [kehadiranOrtu, setKehadiranOrtu] = useState("");
  const [agenda, setAgenda] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [file, setFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [histori, setHistori] = useState([]);
  const [loadingHistori, setLoadingHistori] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewName, setPreviewName] = useState("");

  const fileInputRef = useRef();

  const namaKelas =
    kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas ||
    "";

  useEffect(() => {
    academicApi
      .getAllKelas()
      .then((r) =>
        setKelasList(Array.isArray(r.data) ? r.data : r.data?.data || []),
      )
      .catch(() => {});
  }, []);

  const loadHistori = async () => {
    if (!selectedKelas) return;
    setLoadingHistori(true);
    try {
      const res = await studentApi.getParenting({ kelas_id: selectedKelas });
      setHistori(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setHistori([]);
    } finally {
      setLoadingHistori(false);
    }
  };

  useEffect(() => {
    loadHistori();
  }, [selectedKelas]);

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

  // getFullFotoUrl dipanggil agar URL selalu benar baik dev maupun prod
  const handlePreviewFoto = (url, nama) => {
    const full = getFullFotoUrl(url);
    if (!full) return;
    setPreviewSrc(full);
    setPreviewName(nama || "Lampiran Parenting");
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    if (!agenda.trim()) {
      toast.error("Agenda utama wajib diisi");
      return;
    }
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
      await studentApi.createParenting(fd);
      toast.success("Laporan parenting berhasil disimpan!");
      setAgenda("");
      setRingkasan("");
      setKehadiranOrtu("");
      setFile(null);
      setFotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadHistori();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan laporan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewName}
          onClose={() => {
            setPreviewSrc(null);
            setPreviewName("");
          }}
        />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          PARENTING KELAS MASSAL
        </h1>
        {selectedKelas && (
          <p className="text-sm text-blue-600 mt-0.5 font-medium">
            Wali Kelas: {namaWali} | {namaKelas}
          </p>
        )}
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Pilih Kelas
          </label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kelas}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handleSimpan}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
              👨‍👩‍👧
            </div>
            <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
              Catat Pertemuan & Upload Dokumentasi
            </h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Tanggal Pertemuan
                    </label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Kehadiran Orang Tua
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={kehadiranOrtu}
                      onChange={(e) => setKehadiranOrtu(e.target.value)}
                      placeholder="Jml Hadir"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Agenda Utama
                    </label>
                    <input
                      type="text"
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      placeholder="Judul rapat..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Hasil Keputusan / Catatan Penting
                  </label>
                  <textarea
                    value={ringkasan}
                    onChange={(e) => setRingkasan(e.target.value)}
                    placeholder="Ringkasan hasil pertemuan..."
                    rows={5}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider"
                >
                  {saving ? "Menyimpan..." : "Simpan Laporan & Lampiran"}
                </button>
              </div>

              {/* Upload foto */}
              <div className="w-full md:w-56 flex flex-col gap-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Foto / Dokumen
                </label>
                <div
                  onClick={() => !fotoPreview && fileInputRef.current?.click()}
                  className={`flex-1 min-h-48 border-2 rounded-xl overflow-hidden transition-all ${
                    fotoPreview
                      ? "border-blue-300 cursor-default"
                      : "border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Preview foto"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() =>
                        handlePreviewFoto(
                          fotoPreview,
                          "Preview Lampiran Parenting",
                        )
                      }
                      title="Klik untuk preview fullscreen"
                    />
                  ) : (
                    <>
                      <div className="text-4xl text-gray-300 mb-2">📷</div>
                      <p className="text-xs text-gray-400 text-center px-3">
                        Klik untuk upload foto / dokumen
                      </p>
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePreviewFoto(
                          fotoPreview,
                          "Preview Lampiran Parenting",
                        )
                      }
                      className="flex-1 text-xs text-blue-500 hover:text-blue-700 font-semibold text-center py-1 border border-blue-200 rounded-lg transition-colors"
                    >
                      🔍 Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFoto}
                      className="flex-1 text-xs text-red-400 hover:text-red-600 font-semibold text-center py-1 border border-red-200 rounded-lg transition-colors"
                    >
                      ✕ Hapus
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  JPG, PNG, PDF
                  <br />
                  Maks 10MB
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Histori */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              Histori Pertemuan Kelas
            </h2>
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
                  <th className="px-5 py-3 text-left">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {histori.map((h, i) => (
                  <tr key={h.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-blue-600 font-semibold">
                        {h.tanggal}
                      </p>
                      <p className="font-bold text-gray-800 uppercase text-xs mt-0.5">
                        {h.agenda}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {h.kehadiran_ortu || 0} ORANGTUA
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs max-w-xs">
                      {h.ringkasan || "—"}
                    </td>
                    {/* Foto thumbnail — gunakan getFullFotoUrl agar URL selalu benar */}
                    <td className="px-5 py-3">
                      {h.foto_url ? (
                        <img
                          src={getFullFotoUrl(h.foto_url)}
                          alt="Foto Parenting"
                          onClick={() =>
                            handlePreviewFoto(
                              h.foto_url,
                              `Lampiran — ${h.agenda}`,
                            )
                          }
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                          title="Klik untuk lihat foto"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML =
                              '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg" title="Foto tidak ditemukan">📷</div>';
                          }}
                        />
                      ) : (
                        <div
                          className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg"
                          title="Tidak ada foto"
                        >
                          📷
                        </div>
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
