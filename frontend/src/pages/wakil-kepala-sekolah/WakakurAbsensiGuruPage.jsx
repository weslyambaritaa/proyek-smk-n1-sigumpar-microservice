import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getAbsensiGuru } from "../../../api/learningApi";
import ImagePreviewModal from "../../../components/common/ImagePreviewModal";

const STATUS_COLOR = {
  hadir:     "bg-green-500 text-white",
  terlambat: "bg-yellow-400 text-white",
  izin:      "bg-blue-500 text-white",
  sakit:     "bg-orange-400 text-white",
  alpa:      "bg-red-500 text-white",
};

const STATUS_LIST = ["hadir", "terlambat", "izin", "sakit", "alpa"];

export default function WakakurAbsensiGuruPage() {
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [filterStatus,  setFilterStatus]  = useState("");
  const [searchGuru,    setSearchGuru]    = useState("");
  const [previewSrc,    setPreviewSrc]    = useState(null);
  const [previewName,   setPreviewName]   = useState("");

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAbsensiGuru(filterTanggal ? { tanggal: filterTanggal } : {});
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
      setPage(1);
    } catch { toast.error("Gagal memuat data absensi guru"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filterTanggal]);

  const filtered = useMemo(() => rows.filter((r) =>
    (!filterStatus || r.status === filterStatus) &&
    (!searchGuru   || r.namaGuru?.toLowerCase().includes(searchGuru.toLowerCase()))
  ), [rows, filterStatus, searchGuru]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() =>
    rows.reduce(
      (a, r) => { a.total++; a[r.status] = (a[r.status] || 0) + 1; return a; },
      { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 }
    ), [rows]);

  const bukaFotoBukti = (e, url, nama) => {
    e.preventDefault();
    if (/^data:image|(\.(jpg|jpeg|png|gif|webp))(\?.*)?$/i.test(url)) {
      setPreviewSrc(url);
      setPreviewName(nama || "Foto Bukti Absensi");
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
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">MONITORING ABSENSI GURU MAPEL</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wakil Kepala Sekolah — Pantau kehadiran, status, dan bukti foto guru</p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Statistik */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { l: "Total",     v: stats.total,     c: "text-gray-800",   cls: "bg-white border" },
            { l: "Hadir",     v: stats.hadir,     c: "text-green-700",  cls: "bg-green-50 border border-green-200" },
            { l: "Terlambat", v: stats.terlambat, c: "text-yellow-700", cls: "bg-yellow-50 border border-yellow-200" },
            { l: "Izin",      v: stats.izin,      c: "text-blue-700",   cls: "bg-blue-50 border border-blue-200" },
            { l: "Sakit",     v: stats.sakit,     c: "text-orange-700", cls: "bg-orange-50 border border-orange-200" },
            { l: "Alpa",      v: stats.alpa,      c: "text-red-700",    cls: "bg-red-50 border border-red-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-3 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-60 mb-1">{l}</p>
              <p className={`text-2xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Filter Absensi</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tanggal</label>
              <input type="date" value={filterTanggal} onChange={(e) => { setFilterTanggal(e.target.value); }}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Status</option>
                {STATUS_LIST.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nama Guru</label>
              <input type="text" value={searchGuru} onChange={(e) => { setSearchGuru(e.target.value); setPage(1); }}
                placeholder="Cari nama guru..."
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52" />
            </div>
            <button onClick={() => { setFilterStatus(""); setSearchGuru(""); setPage(1); }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
              🔄 Reset
            </button>
            <button onClick={loadData} disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
              {loading ? "..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              Data Kehadiran Guru — {filterTanggal || "Semua Tanggal"}
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} data</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data absensi...</p>
            </div>
          ) : paged.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>Belum ada data absensi ditemukan</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left w-8">No</th>
                    <th className="px-5 py-3 text-left">Nama Guru</th>
                    <th className="px-5 py-3 text-left">Tanggal</th>
                    <th className="px-5 py-3 text-left">Jam Masuk</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-left">Keterangan</th>
                    <th className="px-5 py-3 text-center">Foto Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paged.map((r, i) => (
                    <tr key={r.id_absensiGuru || i} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3 text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{r.namaGuru || "—"}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{r.tanggal || "—"}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                        {r.jamMasuk
                          ? new Date(r.jamMasuk).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLOR[r.status] || "bg-gray-200 text-gray-600"}`}>
                          {r.status || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs max-w-xs truncate">{r.keterangan || "—"}</td>
                      <td className="px-5 py-3 text-center">
                        {r.foto ? (
                          <button
                            onClick={(e) => bukaFotoBukti(e, r.foto, `Foto Bukti – ${r.namaGuru}`)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-blue-200"
                          >
                            🖼️ Lihat Foto
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Halaman {page} dari {totalPages} ({filtered.length} data)
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const p = start + i;
                      return p <= totalPages ? (
                        <button key={p} onClick={() => setPage(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                          {p}
                        </button>
                      ) : null;
                    })}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}