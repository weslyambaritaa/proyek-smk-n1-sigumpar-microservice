import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

const HARI_ORDER = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 7 };

function formatTime(t) {
  if (!t) return "-";
  return t.slice(0, 5);
}

export default function WakakurJadwalPage() {
  const [rows,         setRows]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [filterHari,   setFilterHari]   = useState("");
  const [filterKelas,  setFilterKelas]  = useState("");
  const [filterMapel,  setFilterMapel]  = useState("");
  const [filterGuru,   setFilterGuru]   = useState("");
  const [showBentrok,  setShowBentrok]  = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/academic/wakil/jadwal");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRows(data);
    } catch {
      toast.error("Gagal memuat data jadwal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Deteksi Bentrok: gunakan is_bentrok dari server, fallback ke client-side ──
  const bentrokIds = useMemo(() => {
    const ids = new Set();
    // Prioritaskan is_bentrok dari server (endpoint wakil/jadwal)
    const hasServerBentrok = rows.some(r => r.is_bentrok !== undefined);
    if (hasServerBentrok) {
      rows.forEach(r => { if (r.is_bentrok) ids.add(r.id); });
      return ids;
    }
    // Fallback: hitung client-side jika pakai endpoint lain
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i], b = rows[j];
        if (!a.guru_id || !b.guru_id) continue;
        if (a.guru_id !== b.guru_id) continue;
        if (a.hari !== b.hari) continue;
        const aStart = a.waktu_mulai, aEnd = a.waktu_berakhir;
        const bStart = b.waktu_mulai, bEnd = b.waktu_berakhir;
        if (aStart < bEnd && bStart < aEnd) {
          ids.add(a.id); ids.add(b.id);
        }
      }
    }
    return ids;
  }, [rows]);

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = rows;
    if (filterHari)  result = result.filter(r => r.hari === filterHari);
    if (filterKelas) result = result.filter(r =>
      (r.nama_kelas || "").toLowerCase().includes(filterKelas.toLowerCase()) ||
      String(r.kelas_id) === filterKelas
    );
    if (filterMapel) result = result.filter(r =>
      (r.mata_pelajaran || "").toLowerCase().includes(filterMapel.toLowerCase())
    );
    if (filterGuru)  result = result.filter(r =>
      (r.nama_guru || String(r.guru_id) || "").toLowerCase().includes(filterGuru.toLowerCase())
    );
    if (showBentrok) result = result.filter(r => bentrokIds.has(r.id));
    return [...result].sort((a, b) =>
      (HARI_ORDER[a.hari] || 9) - (HARI_ORDER[b.hari] || 9) ||
      (a.waktu_mulai || "").localeCompare(b.waktu_mulai || "")
    );
  }, [rows, filterHari, filterKelas, filterMapel, filterGuru, showBentrok, bentrokIds]);

  // ── List unik untuk filter ─────────────────────────────────────────────
  const hariList  = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const totalBentrok = bentrokIds.size;

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalJam  = rows.length;
  const totalGuru = new Set(rows.map(r => r.guru_id).filter(Boolean)).size;
  const totalKelas= new Set(rows.map(r => r.kelas_id).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">MONITORING JADWAL MENGAJAR</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pantau dan filter jadwal seluruh kelas & guru</p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Total Jam Mengajar", v: totalJam,    c: "text-gray-800",   cls: "bg-white border" },
            { l: "Guru Terjadwal",     v: totalGuru,   c: "text-blue-700",   cls: "bg-blue-50 border border-blue-200" },
            { l: "Kelas Terjadwal",    v: totalKelas,  c: "text-green-700",  cls: "bg-green-50 border border-green-200" },
            { l: "Potensi Bentrok",    v: totalBentrok,c: "text-red-700",    cls: `${totalBentrok > 0 ? "bg-red-50 border border-red-200" : "bg-gray-50 border"}` },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{l}</p>
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Filter Jadwal</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hari</label>
              <select value={filterHari} onChange={e => setFilterHari(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Hari</option>
                {hariList.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kelas</label>
              <input type="text" value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
                placeholder="Cari kelas..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mata Pelajaran</label>
              <input type="text" value={filterMapel} onChange={e => setFilterMapel(e.target.value)}
                placeholder="Cari mapel..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Guru</label>
              <input type="text" value={filterGuru} onChange={e => setFilterGuru(e.target.value)}
                placeholder="Cari nama guru..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowBentrok(v => !v)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  showBentrok
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-red-600 border-red-300 hover:bg-red-50"
                }`}
              >
                {showBentrok ? "✓ Hanya Bentrok" : "⚠️ Tampilkan Bentrok"}
              </button>
              <button
                onClick={() => { setFilterHari(""); setFilterKelas(""); setFilterMapel(""); setFilterGuru(""); setShowBentrok(false); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 font-semibold"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Peringatan Bentrok */}
        {totalBentrok > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-bold text-red-700">
                Terdeteksi {totalBentrok} jadwal berpotensi bentrok!
              </p>
              <p className="text-xs text-red-500">Guru yang sama dijadwalkan mengajar di 2 kelas pada waktu yang bersamaan.</p>
            </div>
            <button onClick={() => setShowBentrok(true)}
              className="ml-auto px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg">
              Lihat Bentrok
            </button>
          </div>
        )}

        {/* Tabel Jadwal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Daftar Jadwal Mengajar
              <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length} jam)</span>
            </h2>
            <button onClick={loadData} disabled={loading}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
              {loading ? "..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data jadwal...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📅</p>
              <p>Tidak ada jadwal yang sesuai filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-8">No</th>
                    <th className="px-4 py-3 text-left">Hari</th>
                    <th className="px-4 py-3 text-left">Waktu</th>
                    <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left">Kelas</th>
                    <th className="px-4 py-3 text-left">Guru</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r, i) => {
                    const isBentrok = bentrokIds.has(r.id);
                    return (
                      <tr key={r.id || i} className={`hover:bg-gray-50/70 ${isBentrok ? "bg-red-50/60" : ""}`}>
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                            {r.hari}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {formatTime(r.waktu_mulai)} – {formatTime(r.waktu_berakhir)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{r.mata_pelajaran || "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{r.nama_kelas || `Kelas #${r.kelas_id}` || "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{r.nama_guru || `Guru #${r.guru_id}` || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {isBentrok ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">⚠️ Bentrok</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs font-bold">✓ OK</span>
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

        {/* Tampilan per Hari */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Rekapitulasi Per Hari</h2>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {hariList.map(hari => {
              const count = rows.filter(r => r.hari === hari).length;
              return (
                <button
                  key={hari}
                  onClick={() => setFilterHari(filterHari === hari ? "" : hari)}
                  className={`p-3 rounded-xl text-center border transition-all ${
                    filterHari === hari
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <p className="text-xs font-bold mb-1">{hari}</p>
                  <p className="text-xl font-black">{count}</p>
                  <p className="text-xs opacity-70">jam</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}