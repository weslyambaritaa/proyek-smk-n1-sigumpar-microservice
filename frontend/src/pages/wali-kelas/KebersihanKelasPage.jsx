import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";

const ASPEK = ["Meja & Kursi", "Lantai", "Papan Tulis", "Jendela & Pintu", "Sampah"];
const NILAI_OPTS = ["Sangat Bersih", "Bersih", "Cukup", "Kotor"];
const NILAI_COLOR = {
  "Sangat Bersih": "bg-green-500 text-white",
  "Bersih": "bg-blue-500 text-white",
  "Cukup": "bg-yellow-400 text-white",
  "Kotor": "bg-red-500 text-white",
};

export default function KebersihanKelasPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [penilaian, setPenilaian] = useState({});
  const [catatan, setCatatan] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [histori, setHistori] = useState([]);
  const [loadingHistori, setLoadingHistori] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    academicApi.getAllKelas()
      .then((r) => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
  }, []);

  const loadHistori = async () => {
    if (!selectedKelas) return;
    setLoadingHistori(true);
    try {
      const res = await axiosInstance.get(`/api/academic/wali/kebersihan?kelas_id=${selectedKelas}`);
      setHistori(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setHistori([]); }
    finally { setLoadingHistori(false); }
  };

  useEffect(() => { loadHistori(); }, [selectedKelas]);

  const handleSimpan = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("kelas_id", selectedKelas);
      fd.append("tanggal", tanggal);
      fd.append("penilaian", JSON.stringify(penilaian));
      fd.append("catatan", catatan);
      if (file) fd.append("foto", file);

      await axiosInstance.post("/api/academic/wali/kebersihan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Penilaian kebersihan berhasil disimpan!");
      setPenilaian({});
      setCatatan("");
      setFile(null);
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
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">KEBERSIHAN KELAS</h1>
        <p className="text-sm text-gray-500 mt-0.5">Penilaian kebersihan dan kerapian kelas</p>
      </div>

      <div className="px-8 py-6 max-w-3xl mx-auto space-y-5">
        {/* Form Penilaian */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          {/* Kelas & Tanggal */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label>
              <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Penilaian Per Aspek */}
          <h3 className="font-bold text-gray-700 mb-3 text-sm">Penilaian Per Aspek</h3>
          <div className="space-y-3 mb-5">
            {ASPEK.map((a) => (
              <div key={a} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-gray-700">{a}</span>
                <div className="flex gap-2">
                  {NILAI_OPTS.map((n) => (
                    <button key={n} type="button"
                      onClick={() => setPenilaian((p) => ({ ...p, [a]: n }))}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                        penilaian[a] === n ? NILAI_COLOR[n] : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Catatan & Foto */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Catatan Umum</label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={3}
                placeholder="Catatan tambahan mengenai kebersihan kelas..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Foto Dokumentasi <span className="text-gray-400 font-normal normal-case">(opsional)</span>
              </label>
              <input type="file" ref={fileRef} accept="image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={handleSimpan} disabled={saving}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all">
              {saving ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
          </div>
        </div>

        {/* Riwayat */}
        {selectedKelas && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Riwayat Penilaian</h2>
            </div>
            {loadingHistori ? (
              <div className="py-10 text-center text-gray-400">Memuat...</div>
            ) : histori.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">Belum ada riwayat penilaian</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {histori.map((h) => {
                  const pen = typeof h.penilaian === "string" ? JSON.parse(h.penilaian) : (h.penilaian || {});
                  return (
                    <div key={h.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-blue-600">{h.tanggal}</p>
                        {h.foto_url && (
                          <a href={h.foto_url} target="_blank" rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline font-semibold">📷 Lihat Foto</a>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(pen).map(([k, v]) => (
                          <span key={k} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${NILAI_COLOR[v] || "bg-gray-100 text-gray-500"}`}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                      {h.catatan && <p className="text-xs text-gray-500">{h.catatan}</p>}
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
