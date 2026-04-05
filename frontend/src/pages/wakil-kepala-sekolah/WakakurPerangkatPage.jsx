import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { learningApi } from "../../api/learningApi";
import axiosInstance from "../../api/axiosInstance";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const JENIS_COLOR = {
  RPP:     "bg-blue-100 text-blue-700",
  Silabus: "bg-green-100 text-green-700",
  Modul:   "bg-purple-100 text-purple-700",
  Prota:   "bg-yellow-100 text-yellow-700",
  Promes:  "bg-orange-100 text-orange-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

function getJenisColor(jenis) {
  return JENIS_COLOR[jenis] || JENIS_COLOR["Lainnya"];
}

function isImage(fileName) {
  if (!fileName) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
}

function isPdf(fileName) {
  if (!fileName) return false;
  return /\.pdf$/i.test(fileName);
}

export default function WakakurPerangkatPage() {
  const [dokumen,      setDokumen]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [filterGuru,   setFilterGuru]   = useState("");
  const [filterJenis,  setFilterJenis]  = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search,       setSearch]       = useState("");
  const [previewSrc,   setPreviewSrc]   = useState(null);  // ImagePreviewModal (gambar)
  const [previewName,  setPreviewName]  = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await learningApi.getAllPerangkat();
      setDokumen(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data perangkat pembelajaran");
    } finally {
      setLoading(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return dokumen.filter(d => {
      if (filterJenis  && d.jenis_dokumen !== filterJenis)              return false;
      if (filterStatus && d.status !== filterStatus)                    return false;
      if (filterGuru   && !(d.nama_guru || d.guru_id || "").toString()
          .toLowerCase().includes(filterGuru.toLowerCase()))            return false;
      if (search && !(d.nama_dokumen || "").toLowerCase()
          .includes(search.toLowerCase()))                              return false;
      return true;
    });
  }, [dokumen, filterJenis, filterStatus, filterGuru, search]);

  const jenisList   = [...new Set(dokumen.map(d => d.jenis_dokumen).filter(Boolean))];
  const statusList  = [...new Set(dokumen.map(d => d.status).filter(Boolean))];

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   dokumen.length,
    lengkap: dokumen.filter(d => d.status === "lengkap").length,
    belum:   dokumen.filter(d => d.status === "belum_lengkap").length,
    guru:    new Set(dokumen.map(d => d.guru_id).filter(Boolean)).size,
  }), [dokumen]);

  // ── Preview / Buka Lampiran ────────────────────────────────────────────
  const handleLihatLampiran = async (doc) => {
    const fileName = doc.nama_file || doc.nama_dokumen || "file";
    try {
      if (isImage(fileName)) {
        // Gambar → preview modal inline
        const res = await learningApi.getAllPerangkat(); // fallback
        // Minta blob dari endpoint preview
        const blobRes = await axiosInstance.get(`/api/learning/perangkat/${doc.id}/download`, { responseType: "blob" });
        const mime = blobRes.headers["content-type"] || "image/jpeg";
        const blob = new Blob([blobRes.data], { type: mime });
        const url  = URL.createObjectURL(blob);
        setPreviewSrc(url);
        setPreviewName(fileName);
      } else if (isPdf(fileName)) {
        // PDF → buka di tab baru
        await learningApi.previewPerangkat(doc.id, fileName);
      } else {
        // DOCX, XLSX dll → download
        await learningApi.downloadPerangkat(doc.id, fileName);
        toast.success(`File "${fileName}" sedang diunduh`);
      }
    } catch {
      toast.error("Gagal membuka lampiran");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Image Preview Modal */}
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewName}
          onClose={() => { setPreviewSrc(null); setPreviewName(""); }}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">MONITORING PERANGKAT PEMBELAJARAN</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pantau kelengkapan perangkat guru — gambar ditampilkan inline, PDF dibuka normal
        </p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Total Dokumen", v: stats.total,   c: "text-gray-800",  cls: "bg-white border" },
            { l: "Lengkap",       v: stats.lengkap, c: "text-green-700", cls: "bg-green-50 border border-green-200" },
            { l: "Belum Lengkap", v: stats.belum,   c: "text-red-700",   cls: "bg-red-50 border border-red-200" },
            { l: "Guru Terdaftar",v: stats.guru,    c: "text-blue-700",  cls: "bg-blue-50 border border-blue-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{l}</p>
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Filter Perangkat</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nama Dokumen</label>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama dokumen..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Guru</label>
              <input type="text" value={filterGuru} onChange={e => setFilterGuru(e.target.value)}
                placeholder="Cari nama guru..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Jenis Dokumen</label>
              <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Jenis</option>
                {jenisList.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Status</option>
                <option value="lengkap">Lengkap</option>
                <option value="belum_lengkap">Belum Lengkap</option>
              </select>
            </div>
            <button onClick={() => { setSearch(""); setFilterGuru(""); setFilterJenis(""); setFilterStatus(""); }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 font-semibold">
              🔄 Reset Filter
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Daftar Perangkat Pembelajaran
              <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length} dokumen)</span>
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">📷 Gambar preview inline · 📄 PDF buka tab baru · 📁 Lainnya download</p>
              <button onClick={loadData} disabled={loading}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
                {loading ? "..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📁</p>
              <p>Belum ada perangkat pembelajaran</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Nama Dokumen</th>
                    <th className="px-4 py-3 text-left">Guru</th>
                    <th className="px-4 py-3 text-center">Jenis</th>
                    <th className="px-4 py-3 text-left">Tgl Upload</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Lampiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((d, i) => {
                    const fileName = d.nama_file || d.nama_dokumen || "";
                    const hasFile  = !!d.id;
                    return (
                      <tr key={d.id || i} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{d.nama_dokumen || "-"}</p>
                          {d.nama_file && (
                            <p className="text-xs text-gray-400 mt-0.5">📎 {d.nama_file}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {d.nama_guru || `Guru #${d.guru_id}` || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getJenisColor(d.jenis_dokumen)}`}>
                            {d.jenis_dokumen || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{d.tanggal_upload || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            d.status === "lengkap"
                              ? "bg-green-100 text-green-700"
                              : d.status === "belum_lengkap"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {d.status === "lengkap" ? "✓ Lengkap" : d.status === "belum_lengkap" ? "✗ Belum" : d.status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasFile ? (
                            <button
                              onClick={() => handleLihatLampiran(d)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors mx-auto flex items-center gap-1 ${
                                isImage(fileName)
                                  ? "bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
                                  : isPdf(fileName)
                                  ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                  : "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                              }`}
                            >
                              {isImage(fileName) ? "🖼️ Lihat Gambar" : isPdf(fileName) ? "📄 Buka PDF" : "📁 Download"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">Tidak ada file</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Kelengkapan per Jenis */}
        {jenisList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-4">Kelengkapan per Jenis Dokumen</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {jenisList.map(jenis => {
                const total = dokumen.filter(d => d.jenis_dokumen === jenis).length;
                const lengkap = dokumen.filter(d => d.jenis_dokumen === jenis && d.status === "lengkap").length;
                const pct = total > 0 ? Math.round((lengkap / total) * 100) : 0;
                return (
                  <div key={jenis} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${getJenisColor(jenis)}`}>{jenis}</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{lengkap}/{total} — {pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}