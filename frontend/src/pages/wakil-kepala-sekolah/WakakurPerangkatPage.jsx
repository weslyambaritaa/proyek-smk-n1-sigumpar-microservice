import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { learningApi } from "../../../api/learningApi";
import axiosInstance from "../../../api/axiosInstance";
import ImagePreviewModal from "../../../components/common/ImagePreviewModal";

const JENIS_COLOR = {
  RPP:     "bg-blue-100 text-blue-700",
  Silabus: "bg-green-100 text-green-700",
  Modul:   "bg-purple-100 text-purple-700",
  Prota:   "bg-yellow-100 text-yellow-700",
  Promes:  "bg-orange-100 text-orange-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

export default function WakakurPerangkatPage() {
  const [dokumen,     setDokumen]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [filterJenis, setFilterJenis] = useState("");
  const [searchNama,  setSearchNama]  = useState("");
  const [searchGuru,  setSearchGuru]  = useState("");
  const [previewSrc,  setPreviewSrc]  = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(null); // id yang sedang di-load

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await learningApi.getAllPerangkat();
      setDokumen(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error("Gagal memuat data perangkat pembelajaran"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const jenisList = useMemo(() => [...new Set(dokumen.map((d) => d.jenis_dokumen).filter(Boolean))], [dokumen]);

  const filtered = useMemo(() => dokumen.filter((d) =>
    (!filterJenis || d.jenis_dokumen === filterJenis) &&
    (!searchNama  || d.nama_dokumen?.toLowerCase().includes(searchNama.toLowerCase())) &&
    (!searchGuru  || d.guru_id?.toLowerCase().includes(searchGuru.toLowerCase()))
  ), [dokumen, filterJenis, searchNama, searchGuru]);

  // Rekap per guru
  const rekapGuru = useMemo(() => {
    const map = {};
    filtered.forEach((d) => {
      const k = d.guru_id || "Tidak Diketahui";
      if (!map[k]) map[k] = { guru: k, items: [], jenis: new Set() };
      map[k].items.push(d);
      map[k].jenis.add(d.jenis_dokumen);
    });
    return Object.values(map);
  }, [filtered]);

  // Buka preview: gambar → ImagePreviewModal, PDF/lain → tab baru via blob
  const bukaPreview = async (doc) => {
    const ext = doc.nama_dokumen?.split(".").pop()?.toLowerCase() || "";
    const isImg = ["jpg","jpeg","png","gif","webp"].includes(ext);

    // Coba ambil dari blob (API download)
    setPreviewLoading(doc.id);
    try {
      const res = await axiosInstance.get(`/api/learning/perangkat/${doc.id}/download`, { responseType: "blob" });
      const mime = res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: mime });
      const url  = URL.createObjectURL(blob);

      if (isImg || mime.startsWith("image/")) {
        setPreviewSrc(url);
        setPreviewName(doc.nama_dokumen || "Perangkat");
      } else {
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch {
      toast.error("Gagal membuka file perangkat");
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await learningApi.downloadPerangkat(doc.id, doc.nama_dokumen || `perangkat-${doc.id}`);
    } catch { toast.error("Gagal mengunduh file"); }
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
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">MONITORING PERANGKAT PEMBELAJARAN</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wakil Kepala Sekolah — Lihat kelengkapan perangkat ajar seluruh guru</p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Ringkasan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Total Dokumen", v: dokumen.length,   c: "text-gray-800",  cls: "bg-white border" },
            { l: "Tampil",        v: filtered.length,  c: "text-blue-700",  cls: "bg-blue-50 border border-blue-200" },
            { l: "Guru Upload",   v: rekapGuru.length, c: "text-green-700", cls: "bg-green-50 border border-green-200" },
            { l: "Jenis Dokumen", v: jenisList.length, c: "text-purple-700",cls: "bg-purple-50 border border-purple-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-60 mb-1">{l}</p>
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Filter Perangkat</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Jenis Dokumen</label>
              <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Jenis</option>
                {jenisList.map((j) => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nama Dokumen</label>
              <input type="text" value={searchNama} onChange={(e) => setSearchNama(e.target.value)}
                placeholder="Cari nama dokumen..."
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Guru</label>
              <input type="text" value={searchGuru} onChange={(e) => setSearchGuru(e.target.value)}
                placeholder="Cari guru..."
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44" />
            </div>
            <button onClick={() => { setFilterJenis(""); setSearchNama(""); setSearchGuru(""); }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
              🔄 Reset
            </button>
            <button onClick={fetchAll} disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
              {loading ? "..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* Tabel Perangkat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Daftar Perangkat Pembelajaran</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} dokumen</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data perangkat...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📁</p>
              <p>Belum ada dokumen perangkat pembelajaran</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left w-8">No</th>
                  <th className="px-5 py-3 text-left">Nama Dokumen</th>
                  <th className="px-5 py-3 text-left">Guru</th>
                  <th className="px-5 py-3 text-center">Jenis</th>
                  <th className="px-5 py-3 text-left">Tgl Upload</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((d, i) => (
                  <tr key={d.id || i} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{d.nama_dokumen || "—"}</p>
                      {d.deskripsi && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{d.deskripsi}</p>}
                    </td>
                    <td className="px-5 py-3 text-blue-600 text-xs font-semibold">{d.guru_id || "—"}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${JENIS_COLOR[d.jenis_dokumen] || JENIS_COLOR["Lainnya"]}`}>
                        {d.jenis_dokumen || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{d.tanggal_upload || "—"}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">✓ Ada</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Preview: gambar → modal, PDF → tab baru */}
                        <button
                          onClick={() => bukaPreview(d)}
                          disabled={previewLoading === d.id}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
                        >
                          {previewLoading === d.id ? "..." : "👁 Lihat"}
                        </button>
                        <button
                          onClick={() => handleDownload(d)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200"
                        >
                          ⬇ Unduh
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rekap per Guru */}
        {rekapGuru.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Rekap Kelengkapan per Guru</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rekapGuru.map((g) => (
                <div key={g.guru} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <p className="font-bold text-gray-800 text-sm truncate mb-1">{g.guru}</p>
                  <p className="text-xs text-gray-500 mb-2">{g.items.length} dokumen diunggah</p>
                  <div className="flex flex-wrap gap-1">
                    {[...g.jenis].map((j) => (
                      <span key={j} className={`px-2 py-0.5 rounded text-xs font-semibold ${JENIS_COLOR[j] || JENIS_COLOR["Lainnya"]}`}>{j}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}