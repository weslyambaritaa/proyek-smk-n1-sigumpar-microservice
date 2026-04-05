import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getAbsensiGuru } from "../../../api/learningApi";
import { learningApi } from "../../../api/learningApi";
import { academicApi } from "../../../api/academicApi";
import axiosInstance from "../../../api/axiosInstance";

const HARI_ORDER = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

const STATUS_COLOR = {
  hadir:     "bg-green-100 text-green-700",
  terlambat: "bg-yellow-100 text-yellow-700",
  izin:      "bg-blue-100 text-blue-700",
  sakit:     "bg-orange-100 text-orange-700",
  alpa:      "bg-red-100 text-red-700",
};

export default function WakakurLaporanPage() {
  const [activeTab,   setActiveTab]   = useState("absensi"); // absensi | jadwal | perangkat
  const [loading,     setLoading]     = useState(false);

  // Data
  const [absensiRows,  setAbsensiRows]  = useState([]);
  const [jadwalRows,   setJadwalRows]   = useState([]);
  const [perangkatRows,setPerangkatRows]= useState([]);
  const [kelasList,    setKelasList]    = useState([]);
  const [mapelList,    setMapelList]    = useState([]);

  // Filter global
  const [filterKelas, setFilterKelas] = useState("");
  const [filterMapel, setFilterMapel] = useState("");
  const [filterGuru,  setFilterGuru]  = useState("");
  const [filterTgl,   setFilterTgl]   = useState(new Date().toISOString().slice(0,10));

  // ─── Fetch semua data sekaligus ───────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rAbsensi, rJadwal, rPerangkat, rKelas, rMapel, rUsers] = await Promise.allSettled([
        getAbsensiGuru(filterTgl ? { tanggal: filterTgl } : {}),
        academicApi.getAllJadwal(),
        learningApi.getAllPerangkat(),
        academicApi.getAllKelas(),
        axiosInstance.get("/api/academic/mapel"),
        axiosInstance.get("/api/auth"),
      ]);

      const users   = rUsers.status   === "fulfilled" ? (Array.isArray(rUsers.value.data)   ? rUsers.value.data   : rUsers.value.data?.data   || []) : [];
      const kelas   = rKelas.status   === "fulfilled" ? (Array.isArray(rKelas.value.data)   ? rKelas.value.data   : rKelas.value.data?.data   || []) : [];
      const mapel   = rMapel.status   === "fulfilled" ? (Array.isArray(rMapel.value.data)   ? rMapel.value.data   : rMapel.value.data?.data   || []) : [];
      const absensi = rAbsensi.status === "fulfilled" ? (Array.isArray(rAbsensi.value.data?.data) ? rAbsensi.value.data.data : []) : [];
      const jadwal  = rJadwal.status  === "fulfilled" ? (Array.isArray(rJadwal.value.data)  ? rJadwal.value.data  : rJadwal.value.data?.data  || []) : [];
      const perangkat = rPerangkat.status === "fulfilled" ? (Array.isArray(rPerangkat.value.data?.data) ? rPerangkat.value.data.data : []) : [];

      // Enrich jadwal
      const enrichedJadwal = jadwal.map((j) => {
        const g = users.find((u) => u.id === j.guru_id);
        const k = kelas.find((k) => String(k.id) === String(j.kelas_id));
        const m = mapel.find((m) => String(m.id) === String(j.mapel_id));
        return { ...j, nama_guru: g ? (g.nama_lengkap || g.username) : (j.nama_guru || "—"), nama_kelas: k ? k.nama_kelas : (j.nama_kelas || "—"), nama_mapel: m ? m.nama_mapel : (j.nama_mapel || "—") };
      });

      setAbsensiRows(absensi);
      setJadwalRows(enrichedJadwal);
      setPerangkatRows(perangkat);
      setKelasList(kelas);
      setMapelList(mapel);
    } catch { toast.error("Gagal memuat data laporan"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterTgl]);

  // ─── Filtered data ────────────────────────────────────────────────────────
  const filteredAbsensi = useMemo(() => absensiRows.filter((r) =>
    (!filterGuru  || r.namaGuru?.toLowerCase().includes(filterGuru.toLowerCase()))
  ), [absensiRows, filterGuru]);

  const filteredJadwal = useMemo(() => [...jadwalRows]
    .sort((a,b) => HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari))
    .filter((j) =>
      (!filterKelas || String(j.kelas_id) === filterKelas) &&
      (!filterMapel || String(j.mapel_id) === filterMapel) &&
      (!filterGuru  || j.nama_guru?.toLowerCase().includes(filterGuru.toLowerCase()))
    ), [jadwalRows, filterKelas, filterMapel, filterGuru]);

  const filteredPerangkat = useMemo(() => perangkatRows.filter((d) =>
    (!filterGuru || d.guru_id?.toLowerCase().includes(filterGuru.toLowerCase())) &&
    (!filterMapel || d.nama_dokumen?.toLowerCase().includes(filterMapel.toLowerCase()))
  ), [perangkatRows, filterGuru, filterMapel]);

  // ─── Summary cards ────────────────────────────────────────────────────────
  const absensiStats = useMemo(() =>
    absensiRows.reduce((a,r) => { a.total++; a[r.status]=(a[r.status]||0)+1; return a; }, { total:0,hadir:0,terlambat:0,izin:0,sakit:0,alpa:0 }),
    [absensiRows]);

  const handlePrint = () => window.print();

  const tabs = [
    { id: "absensi",  label: "📊 Rekap Absensi Guru",  count: filteredAbsensi.length },
    { id: "jadwal",   label: "📅 Rekap Jadwal Mengajar", count: filteredJadwal.length },
    { id: "perangkat",label: "📁 Rekap Perangkat Ajar",  count: filteredPerangkat.length },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">LAPORAN RINGKAS AKADEMIK</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wakil Kepala Sekolah — Rekap terpadu: absensi guru, jadwal, dan perangkat pembelajaran</p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Summary top */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Total Guru Hadir",    v: absensiStats.hadir,    c: "text-green-700", cls: "bg-green-50 border border-green-200" },
            { l: "Tidak Hadir (Alpa)",  v: absensiStats.alpa,     c: "text-red-700",   cls: absensiStats.alpa > 0 ? "bg-red-50 border border-red-200" : "bg-white border" },
            { l: "Total Jadwal",        v: jadwalRows.length,     c: "text-blue-700",  cls: "bg-blue-50 border border-blue-200" },
            { l: "Total Perangkat",     v: perangkatRows.length,  c: "text-purple-700",cls: "bg-purple-50 border border-purple-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-60 mb-1">{l}</p>
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter + Cetak */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Filter Laporan</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tanggal (untuk absensi)</label>
              <input type="date" value={filterTgl} onChange={(e) => setFilterTgl(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kelas</label>
              <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mata Pelajaran</label>
              <select value={filterMapel} onChange={(e) => setFilterMapel(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Mapel</option>
                {mapelList.map((m) => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Guru</label>
              <input type="text" value={filterGuru} onChange={(e) => setFilterGuru(e.target.value)}
                placeholder="Cari nama guru..."
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44" />
            </div>
            <div className="flex gap-2 self-end">
              <button onClick={() => { setFilterKelas(""); setFilterMapel(""); setFilterGuru(""); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
                🔄 Reset
              </button>
              <button onClick={fetchAll} disabled={loading}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                {loading ? "..." : "↻ Refresh"}
              </button>
              <button onClick={handlePrint}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                🖨️ Cetak
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-gray-100">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 px-4 py-4 text-xs font-bold transition-all border-b-2 ${
                  activeTab === t.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === t.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-0">

            {/* ── Tab: Rekap Absensi Guru ── */}
            {activeTab === "absensi" && (
              <>
                {/* Mini stats absensi */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-4 bg-gray-50 border-b border-gray-100">
                  {["total","hadir","terlambat","izin","sakit","alpa"].map((s) => (
                    <div key={s} className="text-center">
                      <p className="text-xs text-gray-400 capitalize">{s}</p>
                      <p className="text-lg font-bold text-gray-800">{absensiStats[s] || 0}</p>
                    </div>
                  ))}
                </div>
                {loading ? (
                  <div className="py-12 text-center text-gray-400">
                    <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                    <p className="text-xs">Memuat...</p>
                  </div>
                ) : filteredAbsensi.length === 0 ? (
                  <div className="py-12 text-center text-gray-400"><p className="text-3xl mb-2">📋</p><p className="text-sm">Belum ada data absensi</p></div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3 text-left">No</th>
                        <th className="px-5 py-3 text-left">Nama Guru</th>
                        <th className="px-5 py-3 text-left">Tanggal</th>
                        <th className="px-5 py-3 text-left">Jam Masuk</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-left">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAbsensi.map((r, i) => (
                        <tr key={r.id_absensiGuru || i} className="hover:bg-gray-50/70">
                          <td className="px-5 py-2.5 text-gray-400 text-xs">{i+1}</td>
                          <td className="px-5 py-2.5 font-semibold text-gray-800">{r.namaGuru||"—"}</td>
                          <td className="px-5 py-2.5 text-gray-500 text-xs">{r.tanggal||"—"}</td>
                          <td className="px-5 py-2.5 text-gray-500 font-mono text-xs">
                            {r.jamMasuk ? new Date(r.jamMasuk).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})+" WIB" : "—"}
                          </td>
                          <td className="px-5 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_COLOR[r.status]||"bg-gray-100 text-gray-600"}`}>{r.status}</span>
                          </td>
                          <td className="px-5 py-2.5 text-gray-500 text-xs max-w-xs truncate">{r.keterangan||"—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* ── Tab: Rekap Jadwal ── */}
            {activeTab === "jadwal" && (
              loading ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                  <p className="text-xs">Memuat...</p>
                </div>
              ) : filteredJadwal.length === 0 ? (
                <div className="py-12 text-center text-gray-400"><p className="text-3xl mb-2">📅</p><p className="text-sm">Belum ada data jadwal</p></div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Hari</th>
                      <th className="px-5 py-3 text-left">Jam</th>
                      <th className="px-5 py-3 text-left">Guru</th>
                      <th className="px-5 py-3 text-left">Mata Pelajaran</th>
                      <th className="px-5 py-3 text-left">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredJadwal.map((j, i) => (
                      <tr key={j.id||i} className="hover:bg-gray-50/70">
                        <td className="px-5 py-2.5 text-gray-400 text-xs">{i+1}</td>
                        <td className="px-5 py-2.5"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{j.hari}</span></td>
                        <td className="px-5 py-2.5 text-gray-600 font-mono text-xs">{j.jam_mulai||"—"}{j.jam_selesai?` – ${j.jam_selesai}`:""}</td>
                        <td className="px-5 py-2.5 font-semibold text-gray-800">{j.nama_guru}</td>
                        <td className="px-5 py-2.5 text-gray-600">{j.nama_mapel}</td>
                        <td className="px-5 py-2.5"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">{j.nama_kelas}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* ── Tab: Rekap Perangkat ── */}
            {activeTab === "perangkat" && (
              loading ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                  <p className="text-xs">Memuat...</p>
                </div>
              ) : filteredPerangkat.length === 0 ? (
                <div className="py-12 text-center text-gray-400"><p className="text-3xl mb-2">📁</p><p className="text-sm">Belum ada data perangkat</p></div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Nama Dokumen</th>
                      <th className="px-5 py-3 text-left">Guru</th>
                      <th className="px-5 py-3 text-center">Jenis</th>
                      <th className="px-5 py-3 text-left">Tgl Upload</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPerangkat.map((d, i) => (
                      <tr key={d.id||i} className="hover:bg-gray-50/70">
                        <td className="px-5 py-2.5 text-gray-400 text-xs">{i+1}</td>
                        <td className="px-5 py-2.5 font-semibold text-gray-800">{d.nama_dokumen||"—"}</td>
                        <td className="px-5 py-2.5 text-blue-600 text-xs font-semibold">{d.guru_id||"—"}</td>
                        <td className="px-5 py-2.5 text-center">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">{d.jenis_dokumen||"—"}</span>
                        </td>
                        <td className="px-5 py-2.5 text-gray-500 text-xs">{d.tanggal_upload||"—"}</td>
                        <td className="px-5 py-2.5 text-center">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ Ada</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}