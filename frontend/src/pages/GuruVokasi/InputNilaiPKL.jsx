import AppLayout from "@/Layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import { getAllPKL, getPenilaianStats, upsertPenilaian } from "@/lib/api";

// ── Konstanta bobot penilaian ─────────────────────────────────
const BOBOT = {
  disiplin: { label: "Disiplin", pct: 15, weight: 0.15 },
  teknis: { label: "Kompetensi Teknis", pct: 35, weight: 0.35 },
  komunikasi: { label: "Komunikasi", pct: 15, weight: 0.15 },
  laporan: { label: "Laporan PKL", pct: 20, weight: 0.2 },
  presentasi: { label: "Presentasi / Ujian", pct: 15, weight: 0.15 },
};

const hitungNilai = (s) =>
  Object.keys(BOBOT).reduce(
    (sum, k) => sum + Number(s[k] || 0) * BOBOT[k].weight,
    0,
  );

const getGrade = (n) => {
  if (n >= 85) return "A";
  if (n >= 75) return "B";
  if (n >= 65) return "C";
  if (n >= 50) return "D";
  return "E";
};

const gradeBadge = {
  A: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  B: "bg-sky-50 text-sky-700 border border-sky-200",
  C: "bg-amber-50 text-amber-700 border border-amber-200",
  D: "bg-orange-50 text-orange-700 border border-orange-200",
  E: "bg-rose-50 text-rose-700 border border-rose-200",
};

const statusBadge = {
  Simpan: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Draft: "bg-slate-100 text-slate-500 border border-slate-200",
};

export default function InputNilaiPKL() {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [pklList, setPklList] = useState([]);
  const [stats, setStats] = useState({
    total_siswa: 0,
    nilai_sudah_diisi: 0,
    nilai_belum_diisi: 0,
    rata_rata_nilai: 0,
  });
  const [nilaiMap, setNilaiMap] = useState({}); // { submission_id: { disiplin, teknis, ... } }
  const [catatanMap, setCatatanMap] = useState({}); // { submission_id: string }
  const [statusMap, setStatusMap] = useState({}); // { submission_id: 'Draft' | 'Simpan' }
  const [saving, setSaving] = useState(null); // submission_id yang sedang disimpan
  const [searchNama, setSearchNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch data ──────────────────────────────────────────────
  const fetchData = useCallback(async (nama = "") => {
    setLoading(true);
    setError(null);
    try {
      const [pklRes, statsRes] = await Promise.all([
        getAllPKL(nama),
        getPenilaianStats(),
      ]);

      const list = pklRes.data || [];
      setPklList(list);
      setStats(statsRes.data || {});

      // Inisialisasi nilai dari data yang sudah ada
      const initNilai = {};
      const initCatatan = {};
      const initStatus = {};
      list.forEach((item) => {
        initNilai[item.id] = {
          disiplin: item.disiplin ?? "",
          teknis: item.teknis ?? "",
          komunikasi: item.komunikasi ?? "",
          laporan: item.laporan ?? "",
          presentasi: item.presentasi ?? "",
        };
        initCatatan[item.id] = item.catatan_guru || "";
        initStatus[item.id] = item.status_penilaian || "Draft";
      });
      setNilaiMap(initNilai);
      setCatatanMap(initCatatan);
      setStatusMap(initStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handler perubahan nilai input ──────────────────────────
  const handleNilaiChange = (submissionId, field, value) => {
    const clamped = Math.min(100, Math.max(0, Number(value)));
    setNilaiMap((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: clamped },
    }));
  };

  // ── Simpan satu baris ──────────────────────────────────────
  const handleSimpan = async (submissionId, status = "Draft") => {
    setSaving(submissionId);
    try {
      const nilai = nilaiMap[submissionId] || {};
      await upsertPenilaian({
        submission_id: submissionId,
        disiplin: nilai.disiplin || 0,
        teknis: nilai.teknis || 0,
        komunikasi: nilai.komunikasi || 0,
        laporan: nilai.laporan || 0,
        presentasi: nilai.presentasi || 0,
        catatan_guru: catatanMap[submissionId] || "",
        status_penilaian: status,
      });
      setStatusMap((prev) => ({ ...prev, [submissionId]: status }));
      // Refresh stats
      const statsRes = await getPenilaianStats();
      setStats(statsRes.data || {});
      alert(
        `Nilai berhasil ${status === "Simpan" ? "disimpan & difinalisasi" : "disimpan sebagai draft"}!`,
      );
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchNama);
  };

  return (
    <AppLayout title="Input Nilai PKL">
      <Head title="Input Nilai PKL" />

      <div className="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
              Sistem Monitoring PKL
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mt-1">
              INPUT NILAI PKL
            </h1>
            <p className="text-sm text-slate-500 font-bold mt-1">
              Guru Vokasi: {user?.name}
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchNama}
              onChange={(e) => setSearchNama(e.target.value)}
              placeholder="Cari nama siswa..."
              className="border-slate-200 rounded-xl text-sm font-bold px-4 py-2.5 focus:ring-2 focus:ring-blue-500 w-56"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest"
            >
              Cari
            </button>
          </form>
        </div>

        {/* ── Stats Cards ────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Siswa PKL",
              value: stats.total_siswa,
              color: "blue",
            },
            {
              label: "Nilai Sudah Diisi",
              value: stats.nilai_sudah_diisi,
              color: "emerald",
            },
            {
              label: "Belum Diisi",
              value: stats.nilai_belum_diisi,
              color: "amber",
            },
            {
              label: "Rata-rata Nilai",
              value: Number(stats.rata_rata_nilai || 0).toFixed(1),
              color: "violet",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className={`text-3xl font-black mt-2 text-${s.color}-600`}>
                {loading ? "—" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Error ──────────────────────────────────────── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-bold">
            ⚠ Gagal memuat data: {error}. Pastikan backend berjalan dan token
            valid.
          </div>
        )}

        {/* ── Tabel Nilai ────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Daftar Siswa & Input Nilai
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {pklList.length} siswa
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400 font-bold text-sm">
              Memuat data...
            </div>
          ) : pklList.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-bold text-sm">
              Tidak ada data PKL ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-50/40 border-b border-blue-50">
                  <tr>
                    {[
                      "Siswa",
                      "Industri",
                      "Disiplin\n(15%)",
                      "Teknis\n(35%)",
                      "Komunikasi\n(15%)",
                      "Laporan\n(20%)",
                      "Presentasi\n(15%)",
                      "Nilai Akhir",
                      "Grade",
                      "Status",
                      "Aksi",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-4 text-[9px] font-black text-blue-400 uppercase tracking-widest whitespace-pre-line text-center"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pklList.map((item) => {
                    const n = nilaiMap[item.id] || {};
                    const nilaiAkhir = hitungNilai(n);
                    const grade = getGrade(nilaiAkhir);
                    const status = statusMap[item.id] || "Draft";
                    const isSaving = saving === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/20 transition-colors"
                      >
                        {/* Siswa */}
                        <td className="px-4 py-5 min-w-[150px]">
                          <p className="font-black text-slate-800 uppercase text-[10px]">
                            {item.nama_lengkap}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                            {item.nisn} · {item.kelas}
                          </p>
                        </td>

                        {/* Industri */}
                        <td className="px-4 py-5 min-w-[130px]">
                          <p className="text-[10px] font-bold text-blue-600 uppercase">
                            {item.nama_perusahaan}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {item.judul_penempatan}
                          </p>
                        </td>

                        {/* Input Nilai */}
                        {[
                          "disiplin",
                          "teknis",
                          "komunikasi",
                          "laporan",
                          "presentasi",
                        ].map((field) => (
                          <td key={field} className="px-2 py-5 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={n[field] ?? ""}
                              onChange={(e) =>
                                handleNilaiChange(
                                  item.id,
                                  field,
                                  e.target.value,
                                )
                              }
                              disabled={status === "Simpan" || isSaving}
                              className="w-16 text-center border border-slate-200 rounded-lg py-1.5 font-black text-xs focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                          </td>
                        ))}

                        {/* Nilai Akhir */}
                        <td className="px-4 py-5 text-center">
                          <span className="font-black text-slate-800 text-sm">
                            {nilaiAkhir.toFixed(1)}
                          </span>
                        </td>

                        {/* Grade */}
                        <td className="px-4 py-5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${gradeBadge[grade]}`}
                          >
                            {grade}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-5 text-center">
                          <span
                            className={`px-2 py-1 rounded-lg text-[9px] font-black ${statusBadge[status] || statusBadge.Draft}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-5 text-center">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => handleSimpan(item.id, "Draft")}
                              disabled={isSaving || status === "Simpan"}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black px-2.5 py-1.5 rounded-lg text-[9px] uppercase disabled:opacity-40"
                            >
                              {isSaving ? "..." : "Draft"}
                            </button>
                            <button
                              onClick={() => handleSimpan(item.id, "Simpan")}
                              disabled={isSaving || status === "Simpan"}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-2.5 py-1.5 rounded-lg text-[9px] uppercase disabled:opacity-40"
                            >
                              {isSaving ? "..." : "Simpan"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Bobot Penilaian (Info) ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Bobot Penilaian
            </h3>
            {Object.entries(BOBOT).map(([, v]) => (
              <div
                key={v.label}
                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
              >
                <span className="text-xs font-bold text-slate-600">
                  {v.label}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${v.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-800 w-8 text-right">
                    {v.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              Catatan Guru Vokasi
            </h3>
            <textarea
              className="w-full min-h-[160px] border-slate-200 rounded-2xl font-bold text-sm p-4 focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Tambahkan catatan umum penilaian, rekomendasi, atau evaluasi batch untuk semua siswa..."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
