import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";

const BOBOT = { tugas: 15, kuis: 15, uts: 20, uas: 30, praktik: 20 };
const TAHUN_AJAR_OPTIONS = ["2023/2024", "2024/2025", "2025/2026", "2026/2027"];

function hitungNilaiAkhir(row) {
  const t = Number(row.nilai_tugas) || 0;
  const k = Number(row.nilai_kuis) || 0;
  const u = Number(row.nilai_uts) || 0;
  const a = Number(row.nilai_uas) || 0;
  const p = Number(row.nilai_praktik) || 0;
  return (
    (t * BOBOT.tugas + k * BOBOT.kuis + u * BOBOT.uts + a * BOBOT.uas + p * BOBOT.praktik) / 100
  ).toFixed(2);
}

function getPredikat(nilai) {
  const n = Number(nilai);
  if (n >= 90) return { label: "A", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (n >= 80) return { label: "B", color: "text-blue-600 bg-blue-50 border-blue-200" };
  if (n >= 70) return { label: "C", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
  if (n >= 60) return { label: "D", color: "text-orange-600 bg-orange-50 border-orange-200" };
  return { label: "E", color: "text-red-600 bg-red-50 border-red-200" };
}

export default function RekapNilaiPage() {
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("2023/2024");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);
  const [searchNama, setSearchNama] = useState("");
  const [sortField, setSortField] = useState("nama_lengkap");
  const [sortDir, setSortDir] = useState("asc");
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([academicApi.getAllMapel(), academicApi.getAllKelas()])
      .then(([mapelRes, kelasRes]) => {
        const mapels = Array.isArray(mapelRes.data?.data) ? mapelRes.data.data : Array.isArray(mapelRes.data) ? mapelRes.data : [];
        const kelas = Array.isArray(kelasRes.data?.data) ? kelasRes.data.data : Array.isArray(kelasRes.data) ? kelasRes.data : [];
        setMapelList(mapels);
        setKelasList(kelas);
      })
      .catch(() => toast.error("Gagal memuat data mapel/kelas"));
  }, []);

  const fetchData = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    if (!selectedMapel) { toast.error("Pilih mata pelajaran terlebih dahulu"); return; }
    setLoading(true);
    setSudahCari(true);
    try {
      const res = await academicApi.getSiswaByKelas({
        kelas_id: selectedKelas,
        mapel_id: selectedMapel,
        tahun_ajar: selectedTahun,
      });
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setRows(data);
      setPage(1);
    } catch {
      toast.error("Gagal memuat data rekap nilai");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = rows.filter(r =>
    r.nama_lengkap?.toLowerCase().includes(searchNama.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let va = sortField === "nilai_akhir" ? Number(hitungNilaiAkhir(a)) : a[sortField] ?? "";
    let vb = sortField === "nilai_akhir" ? Number(hitungNilaiAkhir(b)) : b[sortField] ?? "";
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pagedRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const namaKelas = kelasList.find(k => String(k.id) === String(selectedKelas))?.nama_kelas || "";
  const namaMapel = mapelList.find(m => String(m.id) === String(selectedMapel))?.nama_mapel || "";

  // Statistik
  const nilaiAkhirList = filtered.map(r => Number(hitungNilaiAkhir(r)));
  const rataRata = nilaiAkhirList.length ? (nilaiAkhirList.reduce((a, b) => a + b, 0) / nilaiAkhirList.length).toFixed(2) : "-";
  const tertinggi = nilaiAkhirList.length ? Math.max(...nilaiAkhirList).toFixed(2) : "-";
  const terendah = nilaiAkhirList.length ? Math.min(...nilaiAkhirList).toFixed(2) : "-";
  const lulus = nilaiAkhirList.filter(n => n >= 70).length;

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-8 bg-blue-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-800">Rekap Nilai Siswa</h1>
        </div>
        <p className="text-gray-400 text-sm ml-4">Lihat dan analisis rekap nilai berdasarkan mapel, kelas, dan tahun ajar</p>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Mata Pelajaran</label>
            <select value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">-- Pilih Mapel --</option>
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label>
            <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Tahun Ajar</label>
            <select value={selectedTahun} onChange={e => setSelectedTahun(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              {TAHUN_AJAR_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={fetchData} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-sm shadow-blue-200 active:scale-95">
            {loading ? "Memuat..." : "🔍 Tampilkan Rekap"}
          </button>
        </div>
      </div>

      {sudahCari && !loading && rows.length > 0 && (
        <>
          {/* STATISTIK */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Rata-rata Kelas", value: rataRata, icon: "📊", color: "blue" },
              { label: "Nilai Tertinggi", value: tertinggi, icon: "🏆", color: "emerald" },
              { label: "Nilai Terendah", value: terendah, icon: "📉", color: "red" },
              { label: "Siswa Lulus (≥70)", value: `${lulus}/${filtered.length}`, icon: "✅", color: "violet" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* TABEL */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-gray-100 gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Rekap Nilai
                  {namaKelas && <span className="text-gray-400 font-normal"> — {namaKelas}</span>}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{namaMapel} · {selectedTahun} · {filtered.length} siswa</p>
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <input type="text" value={searchNama} onChange={e => { setSearchNama(e.target.value); setPage(1); }}
                  placeholder="Cari nama siswa..."
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48" />
              </div>
            </div>

            {/* Bobot */}
            <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
              <span>📊 Bobot:</span>
              <span>Tugas <b>{BOBOT.tugas}%</b></span>·
              <span>Kuis <b>{BOBOT.kuis}%</b></span>·
              <span>UTS <b>{BOBOT.uts}%</b></span>·
              <span>UAS <b>{BOBOT.uas}%</b></span>·
              <span>Praktik <b>{BOBOT.praktik}%</b></span>
              <span className="ml-auto text-gray-400">Klik header kolom untuk mengurutkan</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left w-10">No</th>
                    <th className="px-4 py-3 text-left cursor-pointer hover:text-gray-800 transition-colors" onClick={() => handleSort("nama_lengkap")}>
                      Nama Siswa <SortIcon field="nama_lengkap" />
                    </th>
                    {["nilai_tugas","nilai_kuis","nilai_uts","nilai_uas","nilai_praktik"].map(f => (
                      <th key={f} className="px-4 py-3 text-center cursor-pointer hover:text-gray-800 transition-colors w-20" onClick={() => handleSort(f)}>
                        {f.replace("nilai_","").toUpperCase()} <SortIcon field={f} />
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center cursor-pointer hover:text-gray-800 transition-colors w-28" onClick={() => handleSort("nilai_akhir")}>
                      AKHIR <SortIcon field="nilai_akhir" />
                    </th>
                    <th className="px-4 py-3 text-center w-20">PREDIKAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedRows.map((row, localIdx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + localIdx;
                    const akhir = hitungNilaiAkhir(row);
                    const predikat = getPredikat(akhir);
                    return (
                      <tr key={row.siswa_id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-medium">{globalIdx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{row.nama_lengkap}</div>
                          <div className="text-xs text-gray-400">NIS: {row.nisn}</div>
                        </td>
                        {["nilai_tugas","nilai_kuis","nilai_uts","nilai_uas","nilai_praktik"].map(f => (
                          <td key={f} className="px-4 py-3 text-center">
                            <span className={`font-medium ${Number(row[f]) >= 70 ? "text-gray-700" : "text-red-500"}`}>
                              {row[f] ?? "-"}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-base ${Number(akhir) >= 75 ? "text-blue-600" : Number(akhir) >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                            {akhir}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${predikat.color}`}>
                            {predikat.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sorted.length > PAGE_SIZE && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Halaman {page} dari {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-all">
                    ← Sebelumnya
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-all">
                    Selanjutnya →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {sudahCari && !loading && rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium">Belum ada data nilai</p>
          <p className="text-sm mt-1">Silakan input nilai terlebih dahulu di halaman Input Nilai</p>
        </div>
      )}

      {!sudahCari && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center text-gray-400">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-medium text-gray-600">Pilih Mapel, Kelas, dan Tahun Ajar</p>
          <p className="text-sm mt-1">lalu klik Tampilkan Rekap untuk melihat nilai siswa</p>
        </div>
      )}
    </div>
  );
}