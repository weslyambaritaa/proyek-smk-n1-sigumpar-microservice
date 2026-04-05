import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { academicApi } from "../../api/academicApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const BASE_URL = import.meta.env.VITE_ACADEMIC_URL || "";

function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  return `${BASE_URL}${foto_url}`;
}

export default function WakakurParentingPage() {
  const [kelasList,   setKelasList]   = useState([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [previewSrc,  setPreviewSrc]  = useState(null);
  const [previewName, setPreviewName] = useState("");

  useEffect(() => {
    academicApi.getAllKelas()
      .then(r => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = filterKelas ? `?kelas_id=${filterKelas}` : "";
      const res = await axiosInstance.get(`/api/academic/wali/parenting${params}`);
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data parenting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterKelas]);

  const filtered = useMemo(() =>
    search
      ? rows.filter(r =>
          (r.agenda || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.ringkasan || "").toLowerCase().includes(search.toLowerCase())
        )
      : rows,
    [rows, search]
  );

  const stats = useMemo(() => ({
    total:   rows.length,
    denganFoto: rows.filter(r => r.foto_url).length,
    totalOrtu:  rows.reduce((a, r) => a + (Number(r.kehadiran_ortu) || 0), 0),
  }), [rows]);

  const namaKelas = (id) =>
    kelasList.find(k => String(k.id) === String(id))?.nama_kelas || `Kelas #${id}`;

  return (
    <div className="min-h-screen bg-gray-100">
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewName}
          onClose={() => { setPreviewSrc(null); setPreviewName(""); }}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">MONITORING PARENTING</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Lihat laporan kegiatan parenting per kelas <span className="italic">(read-only untuk Wakil Kepala Sekolah)</span>
        </p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">

        {/* Info Banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
          <span className="text-blue-400 text-xl mt-0.5">ℹ️</span>
          <p className="text-sm text-blue-700">
            Modul Parenting dikelola oleh Wali Kelas. Wakil Kepala Sekolah dapat memantau laporan dan dokumentasi foto seluruh kelas di sini.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Total Pertemuan", v: stats.total,      c: "text-gray-800",  cls: "bg-white border" },
            { l: "Ada Dokumentasi", v: stats.denganFoto, c: "text-blue-700",  cls: "bg-blue-50 border border-blue-200" },
            { l: "Total Orang Tua", v: stats.totalOrtu,  c: "text-green-700", cls: "bg-green-50 border border-green-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{l}</p>
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Filter Kelas</label>
              <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Kelas</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Cari Agenda / Ringkasan</label>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari agenda..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={loadData} disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl">
              {loading ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* Laporan Parenting */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Histori Parenting
              <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length} laporan)</span>
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">👨‍👩‍👧</p>
              <p>Belum ada laporan parenting</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((row, i) => (
                <div key={row.id || i} className="px-6 py-4 hover:bg-gray-50/70 flex gap-4 items-start">
                  {/* Nomor */}
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>

                  {/* Foto dokumentasi — klik untuk preview fullscreen */}
                  <div className="flex-shrink-0">
                    {row.foto_url ? (
                      <div>
                        <img
                          src={getFullFotoUrl(row.foto_url)}
                          alt="Dokumentasi Parenting"
                          className="w-24 h-18 object-cover rounded-xl border-2 border-blue-100 shadow cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                          style={{ height: "72px" }}
                          onClick={() => {
                            setPreviewSrc(getFullFotoUrl(row.foto_url));
                            setPreviewName(`Parenting — ${namaKelas(row.kelas_id)} · ${row.tanggal}`);
                          }}
                          title="Klik untuk preview foto"
                        />
                        <button
                          className="w-full mt-1 text-[10px] text-blue-500 hover:text-blue-700 font-semibold text-center"
                          onClick={() => {
                            setPreviewSrc(getFullFotoUrl(row.foto_url));
                            setPreviewName(`Parenting — ${namaKelas(row.kelas_id)} · ${row.tanggal}`);
                          }}
                        >
                          🔍 Preview
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-18 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-300 text-2xl" style={{ height: "72px" }}>
                        📷
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {namaKelas(row.kelas_id)}
                      </span>
                      <span className="text-xs text-gray-400">{row.tanggal || "-"}</span>
                      {row.kehadiran_ortu > 0 && (
                        <span className="text-xs text-green-600 font-semibold">
                          👥 {row.kehadiran_ortu} orang tua hadir
                        </span>
                      )}
                    </div>
                    {row.agenda && (
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">📌 {row.agenda}</p>
                    )}
                    {row.ringkasan && (
                      <p className="text-xs text-gray-500 line-clamp-2">{row.ringkasan}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}