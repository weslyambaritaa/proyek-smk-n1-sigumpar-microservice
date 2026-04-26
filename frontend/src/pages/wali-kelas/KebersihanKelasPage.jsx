import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";
import axiosInstance from "../../api/axiosInstance";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const ASPEK = [
  "Meja & Kursi",
  "Lantai",
  "Papan Tulis",
  "Jendela & Pintu",
  "Sampah",
];
const NILAI_OPTS = ["Sangat Bersih", "Bersih", "Cukup", "Kotor"];
const NILAI_COLOR = {
  "Sangat Bersih": "bg-green-500 text-white",
  Bersih: "bg-blue-500 text-white",
  Cukup: "bg-yellow-400 text-white",
  Kotor: "bg-red-500 text-white",
};

// Helper: bangun URL lengkap untuk foto dari academic-service
// foto_url dari DB: "/api/academic/uploads/xxx.jpg"
function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  const base = axiosInstance.defaults.baseURL || "";
  return base ? `${base}${foto_url}` : foto_url;
}

export default function KebersihanKelasPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [penilaian, setPenilaian] = useState({});
  const [catatan, setCatatan] = useState("");
  const [file, setFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [histori, setHistori] = useState([]);
  const [loadingHistori, setLoadingHistori] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const fileRef = useRef();

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
      const res = await studentApi.getKebersihan({ kelas_id: selectedKelas });
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
    if (fileRef.current) fileRef.current.value = "";
  };

  // getFullFotoUrl dipanggil agar URL selalu benar baik dev maupun prod
  const handlePreviewFoto = (url, nama) => {
    const full = getFullFotoUrl(url);
    if (!full) return;
    setPreviewSrc(full);
    setPreviewName(nama || "Foto Kebersihan Kelas");
  };

  const handleSimpan = async () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("kelas_id", selectedKelas);
      fd.append("tanggal", tanggal);
      fd.append("penilaian", JSON.stringify(penilaian));
      fd.append("catatan", catatan);
      if (file) fd.append("foto", file);
      await studentApi.createKebersihan(fd);
      toast.success("Penilaian kebersihan berhasil disimpan!");
      setPenilaian({});
      setCatatan("");
      setFile(null);
      setFotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      loadHistori();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan");
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
          KEBERSIHAN KELAS
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Penilaian kebersihan dan kerapian kelas
        </p>
      </div>

      <div className="px-8 py-6 max-w-3xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <h3 className="font-bold text-gray-700 mb-3 text-sm">
            Penilaian Per Aspek
          </h3>
          <div className="space-y-3 mb-5">
            {ASPEK.map((a) => (
              <div
                key={a}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
              >
                <span className="text-sm font-medium text-gray-700">{a}</span>
                <div className="flex gap-2">
                  {NILAI_OPTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPenilaian((p) => ({ ...p, [a]: n }))}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                        penilaian[a] === n
                          ? NILAI_COLOR[n]
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Catatan Umum
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                placeholder="Catatan tambahan mengenai kebersihan kelas..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Upload foto — drag area dengan thumbnail */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Foto Dokumentasi{" "}
                <span className="text-gray-400 font-normal normal-case">
                  (opsional)
                </span>
              </label>
              {fotoPreview ? (
                <div className="flex items-start gap-3">
                  <img
                    src={fotoPreview}
                    alt="Preview foto kebersihan"
                    onClick={() =>
                      handlePreviewFoto(fotoPreview, "Preview Foto Kebersihan")
                    }
                    className="w-24 h-20 object-cover rounded-xl border-2 border-blue-200 shadow cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                    title="Klik untuk preview fullscreen"
                  />
                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handlePreviewFoto(
                          fotoPreview,
                          "Preview Foto Kebersihan",
                        )
                      }
                      className="text-xs text-blue-500 hover:text-blue-700 font-semibold px-3 py-1 border border-blue-200 rounded-lg transition-colors"
                    >
                      🔍 Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFoto}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold px-3 py-1 border border-red-200 rounded-lg transition-colors"
                    >
                      ✕ Hapus Foto
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-gray-50">
                  <span className="text-2xl mb-1">📷</span>
                  <span className="text-sm text-gray-500 font-medium">
                    Klik untuk upload foto dokumentasi
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">
                    JPG, PNG — maks 10MB
                  </span>
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSimpan}
              disabled={saving}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
            >
              {saving ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
          </div>
        </div>

        {/* Riwayat */}
        {selectedKelas && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                Riwayat Penilaian
              </h2>
            </div>
            {loadingHistori ? (
              <div className="py-10 text-center text-gray-400">Memuat...</div>
            ) : histori.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Belum ada riwayat penilaian
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {histori.map((h) => {
                  const pen =
                    typeof h.penilaian === "string"
                      ? JSON.parse(h.penilaian)
                      : h.penilaian || {};
                  return (
                    <div key={h.id} className="px-6 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-blue-600">
                          {h.tanggal}
                        </p>
                        {/* Foto thumbnail — gunakan getFullFotoUrl agar URL selalu benar */}
                        {h.foto_url ? (
                          <img
                            src={getFullFotoUrl(h.foto_url)}
                            alt="Foto Kebersihan"
                            onClick={() =>
                              handlePreviewFoto(
                                h.foto_url,
                                `Foto Kebersihan — ${h.tanggal}`,
                              )
                            }
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                            title="Klik untuk lihat foto"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.innerHTML +=
                                '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg">📷</div>';
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
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(pen).map(([k, v]) => (
                          <span
                            key={k}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${NILAI_COLOR[v] || "bg-gray-100 text-gray-500"}`}
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                      {h.catatan && (
                        <p className="text-xs text-gray-500">{h.catatan}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
