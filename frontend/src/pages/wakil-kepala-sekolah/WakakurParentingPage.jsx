import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { academicApi } from "../../../api/academicApi";
import ImagePreviewModal from "../../../components/common/ImagePreviewModal";

export default function WakakurParentingPage() {
  const [kelasList,    setKelasList]    = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [histori,      setHistori]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [previewSrc,   setPreviewSrc]   = useState(null);
  const [previewName,  setPreviewName]  = useState("");

  // Filter
  const [searchAgenda, setSearchAgenda] = useState("");

  useEffect(() => {
    academicApi.getAllKelas()
      .then((r) => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
  }, []);

  const loadHistori = async () => {
    if (!selectedKelas) { setHistori([]); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/academic/wali/parenting?kelas_id=${selectedKelas}`);
      setHistori(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error("Gagal memuat data parenting"); setHistori([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadHistori(); }, [selectedKelas]);

  const namaKelas = kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  const filtered = useMemo(() =>
    searchAgenda
      ? histori.filter((h) => h.agenda?.toLowerCase().includes(searchAgenda.toLowerCase()))
      : histori,
    [histori, searchAgenda]);

  // Statistik
  const stats = useMemo(() => ({
    total:        histori.length,
    totalOrtu:    histori.reduce((s, h) => s + Number(h.kehadiran_ortu || 0), 0),
    rataOrtu:     histori.length ? (histori.reduce((s, h) => s + Number(h.kehadiran_ortu || 0), 0) / histori.length).toFixed(1) : 0,
    denganFoto:   histori.filter((h) => h.foto_url).length,
  }), [histori]);

  const bukaFoto = (e, url, label) => {
    if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)) {
      e.preventDefault();
      setPreviewSrc(url);
      setPreviewName(label || "Dokumentasi Parenting");
    }
    // else → href/tab baru berjalan normal
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
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">MONITORING PARENTING KELAS</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wakil Kepala Sekolah — Pantau laporan parenting dan dokumentasi per kelas</p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">

        {/* Pilih Kelas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pilih Kelas yang Dipantau</label>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedKelas}
              onChange={(e) => { setSelectedKelas(e.target.value); setSearchAgenda(""); }}
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
            </select>
            {selectedKelas && (
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded-xl border border-blue-100">
                📚 {namaKelas}
              </span>
            )}
          </div>
        </div>

        {/* Statistik — hanya tampil jika kelas dipilih */}
        {selectedKelas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "Total Pertemuan",   v: stats.total,      c: "text-gray-800",  cls: "bg-white border" },
              { l: "Total Org.tua Hadir", v: stats.totalOrtu, c: "text-green-700", cls: "bg-green-50 border border-green-200" },
              { l: "Rata-rata Hadir",   v: stats.rataOrtu,   c: "text-blue-700",  cls: "bg-blue-50 border border-blue-200" },
              { l: "Ada Dokumentasi",   v: stats.denganFoto, c: "text-purple-700", cls: "bg-purple-50 border border-purple-200" },
            ].map(({ l, v, c, cls }) => (
              <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
                <p className="text-xs font-semibold opacity-60 mb-1">{l}</p>
                <p className={`text-2xl font-bold ${c}`}>{v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabel Histori */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              {selectedKelas ? `Histori Parenting — ${namaKelas}` : "Histori Parenting"}
            </h2>
            <div className="flex items-center gap-2">
              {selectedKelas && (
                <input
                  type="text"
                  value={searchAgenda}
                  onChange={(e) => setSearchAgenda(e.target.value)}
                  placeholder="Cari agenda..."
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
                />
              )}
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} data</span>
            </div>
          </div>

          {!selectedKelas ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">👨‍👩‍👧</p>
              <p>Pilih kelas untuk melihat laporan parenting</p>
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data parenting...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>Belum ada riwayat parenting untuk kelas ini</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left w-8">No</th>
                  <th className="px-5 py-3 text-left">Tanggal & Agenda</th>
                  <th className="px-5 py-3 text-center">Kehadiran Ortu</th>
                  <th className="px-5 py-3 text-left">Hasil / Catatan</th>
                  <th className="px-5 py-3 text-center">Dokumentasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((h, i) => (
                  <tr key={h.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-blue-600 font-semibold">{h.tanggal}</p>
                      <p className="font-bold text-gray-800 uppercase text-xs mt-0.5">{h.agenda || "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {h.kehadiran_ortu || 0} Ortu
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs max-w-xs">
                      {h.ringkasan || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {h.foto_url ? (
                        <a
                          href={h.foto_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => bukaFoto(e, h.foto_url, `Dokumentasi – ${h.agenda}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-semibold rounded-lg transition-colors border border-purple-200"
                        >
                          {/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(h.foto_url)
                            ? "🖼️ Lihat Foto"
                            : "📄 Lihat File"}
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

        {/* Info — Wakakur hanya mode pantau */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
          <p className="text-xs text-amber-700 font-semibold">
            ℹ️ Halaman ini hanya untuk <strong>monitoring</strong>. Input dan pengelolaan laporan parenting dilakukan oleh Wali Kelas masing-masing.
          </p>
        </div>
      </div>
    </div>
  );
}