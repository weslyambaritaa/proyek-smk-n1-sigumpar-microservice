import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getAbsensiGuru } from "../../api/learningApi";
import { learningApi } from "../../api/learningApi";
import axiosInstance from "../../api/axiosInstance";

const TODAY = new Date().toISOString().slice(0, 10);

function Stat({ label, value, color = "text-gray-800", bg = "bg-white border" }) {
  return (
    <div className={`rounded-xl p-4 text-center ${bg}`}>
      <p className="text-xs font-semibold opacity-60 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function WakakurLaporanPage() {
  const [loading,      setLoading]      = useState(false);
  const [tanggal,      setTanggal]      = useState(TODAY);

  // Data
  const [absensiRows,  setAbsensiRows]  = useState([]);
  const [jadwalRows,   setJadwalRows]   = useState([]);
  const [perangkatRows,setPerangkatRows]= useState([]);

  // Filter tampilan
  const [activeTab,    setActiveTab]    = useState("absensi"); // absensi | jadwal | perangkat
  const [searchAbsensi,setSearchAbsensi]= useState("");
  const [searchJadwal, setSearchJadwal] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [abRes, jadRes, perRes] = await Promise.allSettled([
        getAbsensiGuru(tanggal ? { tanggal } : {}),
        axiosInstance.get("/api/academic/jadwal"),
        learningApi.getAllPerangkat(),
      ]);

      if (abRes.status === "fulfilled") {
        setAbsensiRows(Array.isArray(abRes.value.data?.data) ? abRes.value.data.data : []);
      }
      if (jadRes.status === "fulfilled") {
        const data = jadRes.value.data;
        setJadwalRows(Array.isArray(data) ? data : (data?.data || []));
      }
      if (perRes.status === "fulfilled") {
        setPerangkatRows(Array.isArray(perRes.value.data?.data) ? perRes.value.data.data : []);
      }
    } catch {
      toast.error("Gagal memuat beberapa data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [tanggal]);

  // ── Stats Absensi ──────────────────────────────────────────────────────
  const absensiStats = useMemo(() =>
    absensiRows.reduce(
      (a, r) => { a.total++; a[r.status] = (a[r.status] || 0) + 1; return a; },
      { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 }
    ), [absensiRows]);

  // ── Stats Jadwal ───────────────────────────────────────────────────────
  const jadwalStats = useMemo(() => ({
    total:   jadwalRows.length,
    guru:    new Set(jadwalRows.map(r => r.guru_id).filter(Boolean)).size,
    kelas:   new Set(jadwalRows.map(r => r.kelas_id).filter(Boolean)).size,
  }), [jadwalRows]);

  // ── Stats Perangkat ────────────────────────────────────────────────────
  const perangkatStats = useMemo(() => ({
    total:   perangkatRows.length,
    lengkap: perangkatRows.filter(d => d.status === "lengkap").length,
    belum:   perangkatRows.filter(d => d.status !== "lengkap").length,
    guru:    new Set(perangkatRows.map(d => d.guru_id).filter(Boolean)).size,
  }), [perangkatRows]);

  // ── Filtered ───────────────────────────────────────────────────────────
  const filteredAbsensi = useMemo(() =>
    searchAbsensi
      ? absensiRows.filter(r => (r.namaGuru || "").toLowerCase().includes(searchAbsensi.toLowerCase()))
      : absensiRows,
    [absensiRows, searchAbsensi]
  );

  const filteredJadwal = useMemo(() =>
    searchJadwal
      ? jadwalRows.filter(r =>
          (r.mata_pelajaran || "").toLowerCase().includes(searchJadwal.toLowerCase()) ||
          (r.nama_kelas || "").toLowerCase().includes(searchJadwal.toLowerCase()) ||
          (r.nama_guru || "").toLowerCase().includes(searchJadwal.toLowerCase())
        )
      : jadwalRows,
    [jadwalRows, searchJadwal]
  );

  const tabs = [
    { key: "absensi",   label: "📋 Absensi Guru",   count: absensiRows.length },
    { key: "jadwal",    label: "📅 Jadwal Mengajar", count: jadwalRows.length },
    { key: "perangkat", label: "📁 Perangkat",       count: perangkatRows.length },
  ];

  const STATUS_BADGE = {
    hadir:     "bg-green-100 text-green-700",
    terlambat: "bg-yellow-100 text-yellow-700",
    izin:      "bg-blue-100 text-blue-700",
    sakit:     "bg-orange-100 text-orange-700",
    alpa:      "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">LAPORAN RINGKAS AKADEMIK</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Rekap cepat: absensi guru · jadwal mengajar · perangkat pembelajaran
        </p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Kontrol Tanggal + Refresh */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Tanggal (untuk data absensi)
            </label>
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={loadAll} disabled={loading}
            className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl">
            {loading ? "Memuat..." : "↻ Refresh Semua Data"}
          </button>
          {loading && (
            <div className="mt-5 flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span>Mengambil data...</span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Guru Hadir"     value={absensiStats.hadir}     color="text-green-700" bg="bg-green-50 border border-green-200" />
          <Stat label="Guru Alpa/Izin" value={absensiStats.alpa + absensiStats.izin + absensiStats.sakit} color="text-red-700" bg="bg-red-50 border border-red-200" />
          <Stat label="Total Jadwal"   value={jadwalStats.total}       color="text-blue-700"  bg="bg-blue-50 border border-blue-200" />
          <Stat label="Perangkat Lengkap" value={perangkatStats.lengkap} color="text-purple-700" bg="bg-purple-50 border border-purple-200" />
        </div>

        {/* Rekap Absensi Singkat */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { l: "Total",     v: absensiStats.total,     c: "text-gray-800",   cls: "bg-white border" },
            { l: "Hadir",     v: absensiStats.hadir,     c: "text-green-700",  cls: "bg-green-50 border border-green-200" },
            { l: "Terlambat", v: absensiStats.terlambat, c: "text-yellow-700", cls: "bg-yellow-50 border border-yellow-200" },
            { l: "Izin",      v: absensiStats.izin,      c: "text-blue-700",   cls: "bg-blue-50 border border-blue-200" },
            { l: "Sakit",     v: absensiStats.sakit,     c: "text-orange-700", cls: "bg-orange-50 border border-orange-200" },
            { l: "Alpa",      v: absensiStats.alpa,      c: "text-red-700",    cls: "bg-red-50 border border-red-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-3 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{l}</p>
              <p className={`text-xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Tabs Detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-gray-100">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 px-4 py-3.5 text-sm font-bold transition-colors ${
                  activeTab === t.key
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-xs font-normal opacity-60">({t.count})</span>
              </button>
            ))}
          </div>

          {/* Tab: Absensi Guru */}
          {activeTab === "absensi" && (
            <div>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                <input type="text" value={searchAbsensi} onChange={e => setSearchAbsensi(e.target.value)}
                  placeholder="Cari nama guru..."
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-52" />
                <span className="text-xs text-gray-400">Tanggal: {tanggal}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Nama Guru</th>
                    <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left">Jam Masuk</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAbsensi.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400">
                      <p className="text-3xl mb-2">📋</p><p>Belum ada data absensi</p>
                    </td></tr>
                  ) : filteredAbsensi.map((r, i) => (
                    <tr key={r.id_absensiGuru || i} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.namaGuru || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.mataPelajaran || "-"}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">
                        {r.jamMasuk ? new Date(r.jamMasuk).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {r.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{r.keterangan || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Jadwal Mengajar */}
          {activeTab === "jadwal" && (
            <div>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                <input type="text" value={searchJadwal} onChange={e => setSearchJadwal(e.target.value)}
                  placeholder="Cari mapel / kelas / guru..."
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64" />
                <div className="flex gap-3 ml-auto text-xs text-gray-400">
                  <span>👨‍🏫 {jadwalStats.guru} guru</span>
                  <span>🏫 {jadwalStats.kelas} kelas</span>
                  <span>📅 {jadwalStats.total} jam</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Hari</th>
                    <th className="px-4 py-3 text-left">Waktu</th>
                    <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left">Kelas</th>
                    <th className="px-4 py-3 text-left">Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredJadwal.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400">
                      <p className="text-3xl mb-2">📅</p><p>Belum ada data jadwal</p>
                    </td></tr>
                  ) : filteredJadwal.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{r.hari}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {(r.waktu_mulai || "").slice(0, 5)} – {(r.waktu_berakhir || "").slice(0, 5)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.mata_pelajaran || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.nama_kelas || `#${r.kelas_id}` || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.nama_guru || `#${r.guru_id}` || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Perangkat */}
          {activeTab === "perangkat" && (
            <div>
              <div className="px-5 py-3 border-b border-gray-100 flex gap-4 text-xs text-gray-400">
                <span>📁 Total: {perangkatStats.total}</span>
                <span className="text-green-600 font-semibold">✓ Lengkap: {perangkatStats.lengkap}</span>
                <span className="text-red-500 font-semibold">✗ Belum: {perangkatStats.belum}</span>
                <span>👨‍🏫 Guru: {perangkatStats.guru}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Nama Dokumen</th>
                    <th className="px-4 py-3 text-left">Guru</th>
                    <th className="px-4 py-3 text-center">Jenis</th>
                    <th className="px-4 py-3 text-left">Tgl Upload</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {perangkatRows.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400">
                      <p className="text-3xl mb-2">📁</p><p>Belum ada perangkat</p>
                    </td></tr>
                  ) : perangkatRows.map((d, i) => (
                    <tr key={d.id || i} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{d.nama_dokumen || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{d.nama_guru || `#${d.guru_id}` || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{d.jenis_dokumen || "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{d.tanggal_upload || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d.status === "lengkap" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {d.status === "lengkap" ? "✓ Lengkap" : "✗ Belum"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}