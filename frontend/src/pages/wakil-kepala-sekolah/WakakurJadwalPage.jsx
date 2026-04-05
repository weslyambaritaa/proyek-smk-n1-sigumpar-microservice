import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../../api/academicApi";
import axiosInstance from "../../../api/axiosInstance";

const HARI_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function sortByHari(arr) {
  return [...arr].sort((a, b) => {
    const ia = HARI_ORDER.indexOf(a.hari);
    const ib = HARI_ORDER.indexOf(b.hari);
    if (ia !== ib) return ia - ib;
    return (a.jam_mulai || "").localeCompare(b.jam_mulai || "");
  });
}

export default function WakakurJadwalPage() {
  const [jadwal,    setJadwal]    = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [loading,   setLoading]   = useState(false);

  // Filter
  const [filterKelas, setFilterKelas] = useState("");
  const [filterMapel, setFilterMapel] = useState("");
  const [filterGuru,  setFilterGuru]  = useState("");
  const [filterHari,  setFilterHari]  = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rJadwal, rKelas, rMapel, rUsers] = await Promise.allSettled([
        academicApi.getAllJadwal(),
        academicApi.getAllKelas(),
        axiosInstance.get("/api/academic/mapel"),
        axiosInstance.get("/api/auth"),
      ]);

      const users  = rUsers.status  === "fulfilled" ? (Array.isArray(rUsers.value.data)  ? rUsers.value.data  : rUsers.value.data?.data  || []) : [];
      const kelas  = rKelas.status  === "fulfilled" ? (Array.isArray(rKelas.value.data)  ? rKelas.value.data  : rKelas.value.data?.data  || []) : [];
      const mapel  = rMapel.status  === "fulfilled" ? (Array.isArray(rMapel.value.data)  ? rMapel.value.data  : rMapel.value.data?.data  || []) : [];
      const rawJ   = rJadwal.status === "fulfilled" ? (Array.isArray(rJadwal.value.data) ? rJadwal.value.data : rJadwal.value.data?.data || []) : [];

      const enriched = rawJ.map((j) => {
        const guru  = users.find((u) => u.id === j.guru_id);
        const k     = kelas.find((k) => String(k.id) === String(j.kelas_id));
        const m     = mapel.find((m) => String(m.id) === String(j.mapel_id));
        return {
          ...j,
          nama_guru:  guru  ? (guru.nama_lengkap  || guru.username) : (j.nama_guru  || "—"),
          nama_kelas: k     ? k.nama_kelas                          : (j.nama_kelas || "—"),
          nama_mapel: m     ? m.nama_mapel                          : (j.nama_mapel || "—"),
        };
      });

      setJadwal(enriched);
      setKelasList(kelas);
      setMapelList(mapel);
    } catch { toast.error("Gagal memuat data jadwal"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Deteksi bentrok: guru yang mengajar hari+jam yang sama lebih dari 1 kelas
  const bentrokIds = useMemo(() => {
    const ids = new Set();
    const map = {};
    jadwal.forEach((j) => {
      if (!j.guru_id || !j.hari || !j.jam_mulai) return;
      const key = `${j.guru_id}__${j.hari}__${j.jam_mulai}`;
      if (!map[key]) map[key] = [];
      map[key].push(j.id);
    });
    Object.values(map).forEach((arr) => {
      if (arr.length > 1) arr.forEach((id) => ids.add(id));
    });
    return ids;
  }, [jadwal]);

  const filtered = useMemo(() => {
    return sortByHari(jadwal.filter((j) =>
      (!filterKelas || String(j.kelas_id) === filterKelas) &&
      (!filterMapel || String(j.mapel_id) === filterMapel) &&
      (!filterGuru  || j.nama_guru?.toLowerCase().includes(filterGuru.toLowerCase())) &&
      (!filterHari  || j.hari === filterHari)
    ));
  }, [jadwal, filterKelas, filterMapel, filterGuru, filterHari]);

  const totalBentrok = filtered.filter((j) => bentrokIds.has(j.id)).length;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">MONITORING JADWAL MENGAJAR</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wakil Kepala Sekolah — Pantau & filter jadwal seluruh guru dan kelas</p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Ringkasan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Total Jadwal",   v: jadwal.length,    c: "text-gray-800",  cls: "bg-white border" },
            { l: "Tampil",         v: filtered.length,  c: "text-blue-700",  cls: "bg-blue-50 border border-blue-200" },
            { l: "Indikasi Bentrok", v: totalBentrok,   c: "text-red-700",   cls: totalBentrok > 0 ? "bg-red-50 border border-red-200" : "bg-white border" },
            { l: "Kelas Terdaftar", v: kelasList.length, c: "text-green-700", cls: "bg-green-50 border border-green-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-60 mb-1">{l}</p>
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Filter Jadwal</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
            </select>

            <select value={filterMapel} onChange={(e) => setFilterMapel(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Mapel</option>
              {mapelList.map((m) => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
            </select>

            <input type="text" value={filterGuru} onChange={(e) => setFilterGuru(e.target.value)}
              placeholder="Cari nama guru..."
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <select value={filterHari} onChange={(e) => setFilterHari(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Hari</option>
              {HARI_ORDER.map((h) => <option key={h}>{h}</option>)}
            </select>

            <div className="flex gap-2">
              <button onClick={() => { setFilterKelas(""); setFilterMapel(""); setFilterGuru(""); setFilterHari(""); }}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
                🔄 Reset
              </button>
              <button onClick={handlePrint}
                className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                🖨️ Cetak
              </button>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Daftar Jadwal Mengajar</h2>
            {totalBentrok > 0 && (
              <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full border border-red-200">
                ⚠️ {totalBentrok} jadwal bentrok terdeteksi
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data jadwal...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📅</p>
              <p>Belum ada jadwal ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left w-8">No</th>
                    <th className="px-5 py-3 text-left">Hari</th>
                    <th className="px-5 py-3 text-left">Jam</th>
                    <th className="px-5 py-3 text-left">Guru</th>
                    <th className="px-5 py-3 text-left">Mata Pelajaran</th>
                    <th className="px-5 py-3 text-left">Kelas</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((j, i) => {
                    const isBentrok = bentrokIds.has(j.id);
                    return (
                      <tr key={j.id || i} className={`hover:bg-gray-50/70 ${isBentrok ? "bg-red-50/50" : ""}`}>
                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">{j.hari}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-700 font-mono text-xs">
                          {j.jam_mulai || "—"}{j.jam_selesai ? ` – ${j.jam_selesai}` : ""}
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{j.nama_guru}</td>
                        <td className="px-5 py-3 text-gray-600">{j.nama_mapel}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">{j.nama_kelas}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isBentrok ? (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">⚠️ Bentrok</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">✓ OK</span>
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
      </div>
    </div>
  );
}