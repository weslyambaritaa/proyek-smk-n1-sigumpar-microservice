import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";

const TAHUN_OPTS = ["2023/2024", "2024/2025", "2025/2026", "2026/2027"];
const BOBOT = { tugas: 15, kuis: 15, uts: 20, uas: 30, praktik: 20 };

function hitungNilaiAkhir(row) {
  const t = Number(row.nilai_tugas) || 0;
  const k = Number(row.nilai_kuis) || 0;
  const u = Number(row.nilai_uts) || 0;
  const a = Number(row.nilai_uas) || 0;
  const p = Number(row.nilai_praktik) || 0;
  return (
    (t * BOBOT.tugas +
      k * BOBOT.kuis +
      u * BOBOT.uts +
      a * BOBOT.uas +
      p * BOBOT.praktik) /
    100
  ).toFixed(2);
}

function getPredikat(nilai) {
  const n = Number(nilai);
  if (n >= 90)
    return {
      label: "A",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    };
  if (n >= 80)
    return { label: "B", color: "text-blue-600 bg-blue-50 border-blue-200" };
  if (n >= 70)
    return {
      label: "C",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    };
  if (n >= 60)
    return {
      label: "D",
      color: "text-orange-600 bg-orange-50 border-orange-200",
    };
  return { label: "E", color: "text-red-600 bg-red-50 border-red-200" };
}

const TABS = [
  { key: "rekap", label: "Rekap Nilai", icon: "📊" },
  { key: "riwayat", label: "Riwayat", icon: "📋" },
];

const PAGE_SIZE = 15;

export default function RekapNilaiPage() {
  const [tab, setTab] = useState("rekap");
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  // ── Rekap ──
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [tahun, setTahun] = useState("2024/2025");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);
  const [searchNama, setSearchNama] = useState("");
  const [page, setPage] = useState(1);

  // ── Riwayat ──
  const [riwayatKelas, setRiwayatKelas] = useState("");
  const [riwayatMapel, setRiwayatMapel] = useState("");
  const [riwayatTahun, setRiwayatTahun] = useState("2024/2025");
  const [riwayatData, setRiwayatData] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [riwayatPage, setRiwayatPage] = useState(1);

  useEffect(() => {
    Promise.all([academicApi.getAllKelas(), academicApi.getAllMapel()])
      .then(([kr, mr]) => {
        setKelasList(Array.isArray(kr.data) ? kr.data : kr.data?.data || []);
        setMapelList(Array.isArray(mr.data) ? mr.data : mr.data?.data || []);
      })
      .catch(() => {});
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    setLoading(true);
    setSudahCari(true);
    try {
      const res = await studentApi.getRekapNilai({
        kelas_id: selectedKelas,
        mapel_id: selectedMapel || undefined,
        tahun_ajar: tahun,
      });
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setPage(1);
    } catch {
      toast.error("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRiwayat = async () => {
    if (!riwayatKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    setLoadingRiwayat(true);
    try {
      const res = await academicApi.getSiswaByKelas({
        kelas_id: riwayatKelas,
        mapel_id: riwayatMapel || undefined,
        tahun_ajar: riwayatTahun,
      });
      setRiwayatData(Array.isArray(res.data?.data) ? res.data.data : []);
      setRiwayatPage(1);
    } catch {
      toast.error("Gagal memuat riwayat nilai");
      setRiwayatData([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const filtered = data.filter((r) =>
    r.nama_lengkap?.toLowerCase().includes(searchNama.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const riwayatTotalPages = Math.max(
    1,
    Math.ceil(riwayatData.length / PAGE_SIZE),
  );
  const pagedRiwayat = riwayatData.slice(
    (riwayatPage - 1) * PAGE_SIZE,
    riwayatPage * PAGE_SIZE,
  );

  // Statistik rekap
  const nilaiList = filtered.map((r) => Number(hitungNilaiAkhir(r)));
  const rataRata = nilaiList.length
    ? (nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length).toFixed(2)
    : "-";
  const tertinggi = nilaiList.length ? Math.max(...nilaiList).toFixed(2) : "-";
  const terendah = nilaiList.length ? Math.min(...nilaiList).toFixed(2) : "-";
  const lulus = nilaiList.filter((n) => n >= 70).length;

  const namaKelas =
    kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas ||
    "";
  const namaMapel =
    mapelList.find((m) => String(m.id) === String(selectedMapel))?.nama_mapel ||
    "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <h1 className="text-xl font-bold text-gray-800">Rekap Nilai Siswa</h1>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* ── TAB REKAP ── */}
        {tab === "rekap" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={selectedKelas}
                    onChange={(e) => setSelectedKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Mata Pelajaran
                  </label>
                  <select
                    value={selectedMapel}
                    onChange={(e) => setSelectedMapel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Mapel</option>
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Tahun Ajar
                  </label>
                  <select
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TAHUN_OPTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCari}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {loading ? "Memuat..." : "📊 Tampilkan Rekap"}
                </button>
              </div>
            </div>

            {sudahCari && !loading && data.length > 0 && (
              <>
                {/* Statistik */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Rata-rata", value: rataRata, icon: "📊" },
                    { label: "Tertinggi", value: tertinggi, icon: "🏆" },
                    { label: "Terendah", value: terendah, icon: "📉" },
                    {
                      label: `Lulus (≥70)`,
                      value: `${lulus}/${filtered.length}`,
                      icon: "✅",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {s.value}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-gray-100 gap-3">
                    <div>
                      <h2 className="font-bold text-gray-800">
                        Rekap Nilai
                        {namaKelas && (
                          <span className="text-gray-400 font-normal">
                            {" "}
                            — {namaKelas}
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {namaMapel || "Semua Mapel"} · {tahun} ·{" "}
                        {filtered.length} siswa
                      </p>
                    </div>
                    <input
                      type="text"
                      value={searchNama}
                      onChange={(e) => {
                        setSearchNama(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Cari nama siswa..."
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 text-left">No</th>
                          <th className="px-5 py-3 text-left">Nama Siswa</th>
                          <th className="px-5 py-3 text-center">Tugas</th>
                          <th className="px-5 py-3 text-center">Kuis</th>
                          <th className="px-5 py-3 text-center">UTS</th>
                          <th className="px-5 py-3 text-center">UAS</th>
                          <th className="px-5 py-3 text-center">Praktik</th>
                          <th className="px-5 py-3 text-center">Akhir</th>
                          <th className="px-5 py-3 text-center">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pagedRows.map((r, i) => {
                          const akhir = hitungNilaiAkhir(r);
                          const pred = getPredikat(akhir);
                          return (
                            <tr
                              key={i}
                              className="hover:bg-blue-50/30 transition-colors"
                            >
                              <td className="px-5 py-3 text-gray-400">
                                {(page - 1) * PAGE_SIZE + i + 1}
                              </td>
                              <td className="px-5 py-3">
                                <div className="font-semibold text-gray-800">
                                  {r.nama_lengkap}
                                </div>
                                <div className="text-xs text-gray-400">
                                  NIS: {r.nisn}
                                </div>
                              </td>
                              {[
                                "nilai_tugas",
                                "nilai_kuis",
                                "nilai_uts",
                                "nilai_uas",
                                "nilai_praktik",
                              ].map((f) => (
                                <td
                                  key={f}
                                  className={`px-5 py-3 text-center font-medium ${Number(r[f]) >= 70 ? "text-gray-700" : "text-red-500"}`}
                                >
                                  {r[f] ?? "-"}
                                </td>
                              ))}
                              <td className="px-5 py-3 text-center">
                                <span
                                  className={`font-bold ${Number(akhir) >= 75 ? "text-blue-600" : Number(akhir) >= 60 ? "text-yellow-600" : "text-red-500"}`}
                                >
                                  {akhir}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded-full border ${pred.color}`}
                                >
                                  {pred.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filtered.length > PAGE_SIZE && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Halaman {page} dari {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                        >
                          ← Sebelumnya
                        </button>
                        <button
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page >= totalPages}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                        >
                          Selanjutnya →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {sudahCari && !loading && data.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p>Belum ada data nilai untuk filter ini</p>
              </div>
            )}

            {!sudahCari && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">📊</p>
                <p className="font-medium text-gray-600">
                  Pilih Kelas dan Tahun Ajar
                </p>
                <p className="text-sm mt-1">lalu klik Tampilkan Rekap</p>
              </div>
            )}
          </>
        )}

        {/* ── TAB RIWAYAT ── */}
        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">
                Riwayat Nilai Siswa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={riwayatKelas}
                    onChange={(e) => setRiwayatKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Mapel
                  </label>
                  <select
                    value={riwayatMapel}
                    onChange={(e) => setRiwayatMapel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Mapel</option>
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Tahun Ajar
                  </label>
                  <select
                    value={riwayatTahun}
                    onChange={(e) => setRiwayatTahun(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TAHUN_OPTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleLoadRiwayat}
                  disabled={loadingRiwayat}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {loadingRiwayat ? "Memuat..." : "🔍 Tampilkan Riwayat"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loadingRiwayat ? (
                <div className="py-12 text-center text-gray-400">
                  Memuat data...
                </div>
              ) : riwayatData.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Pilih filter dan klik Tampilkan Riwayat</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3 text-left">No</th>
                        <th className="px-5 py-3 text-left">Nama Siswa</th>
                        <th className="px-5 py-3 text-center">Tugas</th>
                        <th className="px-5 py-3 text-center">Kuis</th>
                        <th className="px-5 py-3 text-center">UTS</th>
                        <th className="px-5 py-3 text-center">UAS</th>
                        <th className="px-5 py-3 text-center">Praktik</th>
                        <th className="px-5 py-3 text-center">Akhir</th>
                        <th className="px-5 py-3 text-center">Predikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedRiwayat.map((r, i) => {
                        const akhir = hitungNilaiAkhir(r);
                        const pred = getPredikat(akhir);
                        return (
                          <tr key={i} className="hover:bg-gray-50/70">
                            <td className="px-5 py-3 text-gray-400">
                              {(riwayatPage - 1) * PAGE_SIZE + i + 1}
                            </td>
                            <td className="px-5 py-3 font-semibold text-gray-800">
                              {r.nama_lengkap}
                            </td>
                            {[
                              "nilai_tugas",
                              "nilai_kuis",
                              "nilai_uts",
                              "nilai_uas",
                              "nilai_praktik",
                            ].map((f) => (
                              <td
                                key={f}
                                className="px-5 py-3 text-center text-gray-600"
                              >
                                {r[f] ?? "-"}
                              </td>
                            ))}
                            <td className="px-5 py-3 text-center">
                              <span
                                className={`font-bold ${Number(akhir) >= 75 ? "text-blue-600" : Number(akhir) >= 60 ? "text-yellow-600" : "text-red-500"}`}
                              >
                                {akhir}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full border ${pred.color}`}
                              >
                                {pred.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {riwayatData.length > PAGE_SIZE && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Halaman {riwayatPage} dari {riwayatTotalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setRiwayatPage((p) => Math.max(1, p - 1))
                          }
                          disabled={riwayatPage <= 1}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                        >
                          ← Sebelumnya
                        </button>
                        <button
                          onClick={() =>
                            setRiwayatPage((p) =>
                              Math.min(riwayatTotalPages, p + 1),
                            )
                          }
                          disabled={riwayatPage >= riwayatTotalPages}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                        >
                          Selanjutnya →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
