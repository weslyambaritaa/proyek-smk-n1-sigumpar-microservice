import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import { academicApi } from "../../api/academicApi";

const BOBOT_DEFAULT = { praktik: 40, sikap: 30, laporan: 30 };
const KOMPONEN = [
  { key: "praktik", label: "Praktik", field: "nilai_praktik" },
  { key: "sikap",   label: "Sikap",   field: "nilai_sikap" },
  { key: "laporan", label: "Laporan", field: "nilai_laporan" },
];

function calcAkhir(r, bobot) {
  const total = Object.values(bobot).reduce((a, b) => a + b, 0);
  if (total === 0) return "0.0";
  return (
    (Number(r.nilai_praktik) * bobot.praktik +
     Number(r.nilai_sikap)   * bobot.sikap +
     Number(r.nilai_laporan) * bobot.laporan) / total
  ).toFixed(1);
}

function getStatus(nilai) {
  const n = Number(nilai);
  if (n >= 75) return { label: "Tuntas",       cls: "bg-green-100 text-green-700" };
  if (n >= 60) return { label: "Cukup",        cls: "bg-yellow-100 text-yellow-700" };
  return       { label: "Belum Tuntas",         cls: "bg-red-100 text-red-700" };
}

const TABS = [
  { key: "input",   label: "Input Nilai",  icon: "✏️" },
  { key: "riwayat", label: "Riwayat",      icon: "📋" },
  { key: "rekap",   label: "Rekap",        icon: "📊" },
];
const PAGE_SIZE = 10;

function BobotEditor({ bobot, onChange, onReset }) {
  const total = Object.values(bobot).reduce((a, b) => a + b, 0);
  const isValid = total === 100;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-amber-800 text-sm">⚖️ Pengaturan Bobot Nilai PKL</h3>
          <p className="text-xs text-amber-600 mt-0.5">
            Total harus 100%. Saat ini:{" "}
            <span className={`font-bold ${isValid ? "text-green-600" : "text-red-600"}`}>{total}%</span>
          </p>
        </div>
        <button onClick={onReset}
          className="text-xs px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 font-semibold">
          Reset Default
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {KOMPONEN.map(k => (
          <div key={k.key}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{k.label}</label>
            <div className="relative">
              <input type="number" min="0" max="100" value={bobot[k.key]}
                onChange={e => onChange(k.key, Math.max(0, Math.min(100, Number(e.target.value))))}
                className={`w-full text-center px-2 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 pr-6 ${
                  isValid ? "border-gray-200 focus:ring-blue-400" : "border-red-300 bg-red-50 focus:ring-red-400"
                }`} />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
            </div>
          </div>
        ))}
      </div>
      {!isValid && (
        <p className="text-xs text-red-600 mt-2 font-medium">
          ⚠️ Selisih: {total > 100 ? `-${total - 100}` : `+${100 - total}`}% — sesuaikan agar total = 100%
        </p>
      )}
    </div>
  );
}

export default function NilaiPKLPage() {
  const [tab,           setTab]           = useState("input");
  const [bobot,         setBobot]         = useState({ ...BOBOT_DEFAULT });
  const [showBobot,     setShowBobot]     = useState(false);
  const [kelasList,     setKelasList]     = useState([]);

  // Input state
  const [selectedKelas, setSelectedKelas] = useState("");
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [sudahCari,     setSudahCari]     = useState(false);
  const [page,          setPage]          = useState(1);

  // Riwayat state
  const [riwayatKelas,   setRiwayatKelas]   = useState("");
  const [riwayatData,    setRiwayatData]    = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [riwayatPage,    setRiwayatPage]    = useState(1);

  // Rekap state
  const [rekapKelas,   setRekapKelas]   = useState("");
  const [rekapData,    setRekapData]    = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  useEffect(() => {
    academicApi.getAllKelas()
      .then(r => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
  }, []);

  const totalBobot = Object.values(bobot).reduce((a, b) => a + b, 0);
  const bobotValid = totalBobot === 100;

  const handleBobotChange = (key, val) => setBobot(prev => ({ ...prev, [key]: val }));
  const handleBobotReset  = () => { setBobot({ ...BOBOT_DEFAULT }); toast.success("Bobot dikembalikan ke default"); };

  const namaKelas = kelasList.find(k => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  // ── Input ──
  const handleCari = async () => {
    if (!selectedKelas) return toast.error("Pilih kelas terlebih dahulu");
    setLoading(true); setSudahCari(true);
    try {
      const [siswaRes, nilaiRes] = await Promise.all([
        academicApi.getAllSiswa({ kelas_id: selectedKelas }),
        vocationalApi.getNilaiPKL({ kelas_id: selectedKelas }),
      ]);
      const allSiswa = Array.isArray(siswaRes.data?.data) ? siswaRes.data.data : (Array.isArray(siswaRes.data) ? siswaRes.data : []);
      const nilaiData = nilaiRes.data?.data || [];
      setRows(allSiswa.map(s => {
        const existing = nilaiData.find(n => String(n.siswa_id) === String(s.id)) || {};
        return {
          siswa_id:      s.id,
          nama_lengkap:  s.nama_lengkap,
          nisn:          s.nisn,
          nilai_praktik: existing.nilai_praktik ?? 0,
          nilai_sikap:   existing.nilai_sikap   ?? 0,
          nilai_laporan: existing.nilai_laporan ?? 0,
          _dirty: false,
        };
      }));
      setPage(1);
    } catch (err) {
      toast.error("Gagal memuat data: " + (err?.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const handleChange = (idx, field, val) => {
    const num = Math.min(100, Math.max(0, Number(val)));
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: num, _dirty: true } : r));
  };

  const handleSimpan = async () => {
    if (!selectedKelas) return;
    if (!bobotValid) { toast.error("Total bobot harus 100%"); return; }
    setSaving(true);
    try {
      await vocationalApi.saveNilaiPKLBulk({
        kelas_id: selectedKelas,
        nilai: rows.map(r => ({
          siswa_id:      r.siswa_id,
          nama_siswa:    r.nama_lengkap,
          nilai_praktik: Number(r.nilai_praktik),
          nilai_sikap:   Number(r.nilai_sikap),
          nilai_laporan: Number(r.nilai_laporan),
        })),
      });
      toast.success("Nilai PKL berhasil disimpan!");
      setRows(prev => prev.map(r => ({ ...r, _dirty: false })));
    } catch (err) {
      toast.error(err?.response?.data?.error || "Gagal menyimpan nilai");
    } finally { setSaving(false); }
  };

  // ── Riwayat ──
  const handleLoadRiwayat = async () => {
    if (!riwayatKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoadingRiwayat(true);
    try {
      const [siswaRes, nilaiRes] = await Promise.all([
        academicApi.getAllSiswa({ kelas_id: riwayatKelas }),
        vocationalApi.getNilaiPKL({ kelas_id: riwayatKelas }),
      ]);
      const allSiswa  = Array.isArray(siswaRes.data?.data) ? siswaRes.data.data : (Array.isArray(siswaRes.data) ? siswaRes.data : []);
      const nilaiData = nilaiRes.data?.data || [];
      const merged = allSiswa.map(s => {
        const existing = nilaiData.find(n => String(n.siswa_id) === String(s.id)) || {};
        return {
          siswa_id:      s.id,
          nama_lengkap:  s.nama_lengkap,
          nisn:          s.nisn,
          nilai_praktik: existing.nilai_praktik ?? null,
          nilai_sikap:   existing.nilai_sikap   ?? null,
          nilai_laporan: existing.nilai_laporan ?? null,
          sudah_diinput: !!existing.siswa_id,
        };
      });
      setRiwayatData(merged.filter(r => r.sudah_diinput));
      setRiwayatPage(1);
    } catch { toast.error("Gagal memuat riwayat"); setRiwayatData([]); }
    finally { setLoadingRiwayat(false); }
  };

  // ── Rekap ──
  const handleLoadRekap = async () => {
    if (!rekapKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoadingRekap(true);
    try {
      const [siswaRes, nilaiRes] = await Promise.all([
        academicApi.getAllSiswa({ kelas_id: rekapKelas }),
        vocationalApi.getNilaiPKL({ kelas_id: rekapKelas }),
      ]);
      const allSiswa  = Array.isArray(siswaRes.data?.data) ? siswaRes.data.data : (Array.isArray(siswaRes.data) ? siswaRes.data : []);
      const nilaiData = nilaiRes.data?.data || [];
      setRekapData(allSiswa.map(s => {
        const existing = nilaiData.find(n => String(n.siswa_id) === String(s.id)) || {};
        return {
          siswa_id:      s.id,
          nama_lengkap:  s.nama_lengkap,
          nisn:          s.nisn,
          nilai_praktik: existing.nilai_praktik ?? 0,
          nilai_sikap:   existing.nilai_sikap   ?? 0,
          nilai_laporan: existing.nilai_laporan ?? 0,
          sudah_diinput: !!existing.siswa_id,
        };
      }));
    } catch { toast.error("Gagal memuat rekap"); setRekapData([]); }
    finally { setLoadingRekap(false); }
  };

  // Pagination
  const totalPages        = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows         = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const riwayatTotalPages = Math.max(1, Math.ceil(riwayatData.length / PAGE_SIZE));
  const pagedRiwayat      = riwayatData.slice((riwayatPage - 1) * PAGE_SIZE, riwayatPage * PAGE_SIZE);

  // Statistik rekap
  const nilaiList = rekapData.filter(r => r.sudah_diinput).map(r => Number(calcAkhir(r, bobot)));
  const rataRata  = nilaiList.length ? (nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length).toFixed(1) : "-";
  const tertinggi = nilaiList.length ? Math.max(...nilaiList).toFixed(1) : "-";
  const terendah  = nilaiList.length ? Math.min(...nilaiList).toFixed(1) : "-";
  const tuntas    = nilaiList.filter(n => n >= 75).length;

  // Statistik input
  const inputNilaiList = rows.map(r => Number(calcAkhir(r, bobot)));
  const rata2Input = rows.length ? (inputNilaiList.reduce((a, b) => a + b, 0) / inputNilaiList.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-blue-600 rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Input Nilai PKL</h1>
              <p className="text-xs text-gray-400 mt-0.5">Data siswa dari Tata Usaha — nilai disimpan di database</p>
            </div>
          </div>
          <button onClick={() => setShowBobot(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              showBobot ? "bg-amber-100 border-amber-300 text-amber-800"
              : bobotValid ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              : "bg-red-50 border-red-300 text-red-700"
            }`}>
            ⚖️ Atur Bobot
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${bobotValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {totalBobot}%
            </span>
          </button>
        </div>

        {showBobot && <BobotEditor bobot={bobot} onChange={handleBobotChange} onReset={handleBobotReset} />}

        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">

        {/* TAB INPUT */}
        {tab === "input" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pilih Kelas</label>
                  <select value={selectedKelas} onChange={e => { setSelectedKelas(e.target.value); setSudahCari(false); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <button onClick={handleCari} disabled={loading || !selectedKelas}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
                  {loading ? "Memuat..." : "🔍 Tampilkan Siswa"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3 bg-blue-50 rounded-lg px-3 py-2">
                💡 Daftar siswa dari Tata Usaha. Nilai yang sudah diinput sebelumnya tampil otomatis.
              </p>
            </div>

            {sudahCari && rows.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Siswa",  val: rows.length,                                           cls: "bg-white border border-gray-200 text-gray-800" },
                  { label: "Tuntas (≥75)", val: rows.filter(r => Number(calcAkhir(r, bobot)) >= 75).length, cls: "bg-green-50 border border-green-200 text-green-700" },
                  { label: "Belum Tuntas", val: rows.filter(r => Number(calcAkhir(r, bobot)) < 75).length,  cls: "bg-red-50 border border-red-200 text-red-700" },
                  { label: "Rata-rata",    val: rata2Input,                                            cls: "bg-blue-50 border border-blue-200 text-blue-700" },
                ].map(({ label, val, cls }) => (
                  <div key={label} className={`rounded-2xl p-4 text-center ${cls}`}>
                    <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
                    <p className="text-2xl font-bold">{val}</p>
                  </div>
                ))}
              </div>
            )}

            {sudahCari && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-gray-800">Input Nilai PKL — {namaKelas}</h2>
                  </div>
                </div>

                {/* Bobot strip */}
                <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex gap-3 text-xs text-amber-700 items-center">
                  <span className="font-semibold">⚖️ Bobot aktif:</span>
                  {KOMPONEN.map(k => (
                    <span key={k.key}>{k.label} <span className="font-bold text-blue-600">{bobot[k.key]}%</span></span>
                  ))}
                  {!bobotValid && <span className="text-red-600 font-bold ml-2">⚠️ Total {totalBobot}% — harus 100%!</span>}
                </div>

                {loading ? (
                  <div className="py-16 text-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                    <p>Memuat data...</p>
                  </div>
                ) : rows.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <p className="text-4xl mb-3">📋</p>
                    <p>Tidak ada siswa di kelas ini</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3 text-left">No</th>
                            <th className="px-4 py-3 text-left">Nama Siswa</th>
                            <th className="px-4 py-3 text-left">NISN</th>
                            {KOMPONEN.map(k => (
                              <th key={k.key} className="px-4 py-3 text-center">
                                {k.label}
                                <div className="text-blue-500 font-normal normal-case">{bobot[k.key]}%</div>
                              </th>
                            ))}
                            <th className="px-4 py-3 text-center">Nilai Akhir</th>
                            <th className="px-4 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {pagedRows.map((r, localIdx) => {
                            const globalIdx = (page - 1) * PAGE_SIZE + localIdx;
                            const na = calcAkhir(r, bobot);
                            const { label, cls } = getStatus(na);
                            return (
                              <tr key={r.siswa_id} className={`transition-colors ${r._dirty ? "bg-yellow-50/60" : "hover:bg-gray-50/70"}`}>
                                <td className="px-4 py-3 text-gray-400">{globalIdx + 1}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{r.nama_lengkap}</td>
                                <td className="px-4 py-3 text-gray-400 text-xs">{r.nisn}</td>
                                {KOMPONEN.map(k => (
                                  <td key={k.key} className="px-4 py-2 text-center">
                                    <input type="number" min="0" max="100" value={r[k.field]}
                                      onChange={e => handleChange(globalIdx, k.field, e.target.value)}
                                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                  </td>
                                ))}
                                <td className="px-4 py-3 text-center font-bold text-base text-gray-800">{na}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {rows.length > PAGE_SIZE && (
                      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Halaman {page} dari {totalPages}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50">← Sebelumnya</button>
                          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50">Selanjutnya →</button>
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                      <button onClick={handleSimpan} disabled={saving || !bobotValid}
                        title={!bobotValid ? "Total bobot harus 100%" : ""}
                        className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow transition-all">
                        {saving ? "Menyimpan..." : "💾 Simpan Semua Nilai"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB RIWAYAT */}
        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">Riwayat Nilai PKL</h2>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kelas</label>
                  <select value={riwayatKelas} onChange={e => setRiwayatKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <button onClick={handleLoadRiwayat} disabled={loadingRiwayat}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
                  {loadingRiwayat ? "Memuat..." : "🔍 Tampilkan"}
                </button>
              </div>
            </div>

            {loadingRiwayat ? (
              <div className="py-12 text-center text-gray-400">Memuat data...</div>
            ) : riwayatData.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p>Pilih kelas dan klik Tampilkan</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex gap-3 text-xs text-amber-700 items-center">
                  <span className="font-semibold">⚖️ Bobot:</span>
                  {KOMPONEN.map(k => <span key={k.key}>{k.label} <span className="font-bold">{bobot[k.key]}%</span></span>)}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3 text-left">No</th>
                        <th className="px-5 py-3 text-left">Nama Siswa</th>
                        <th className="px-5 py-3 text-left">NISN</th>
                        {KOMPONEN.map(k => <th key={k.key} className="px-5 py-3 text-center">{k.label}</th>)}
                        <th className="px-5 py-3 text-center">Nilai Akhir</th>
                        <th className="px-5 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedRiwayat.map((r, i) => {
                        const na = calcAkhir(r, bobot);
                        const { label, cls } = getStatus(na);
                        return (
                          <tr key={r.siswa_id} className="hover:bg-gray-50/70">
                            <td className="px-5 py-3 text-gray-400">{(riwayatPage - 1) * PAGE_SIZE + i + 1}</td>
                            <td className="px-5 py-3 font-semibold text-gray-800">{r.nama_lengkap}</td>
                            <td className="px-5 py-3 text-xs text-gray-400">{r.nisn}</td>
                            {KOMPONEN.map(k => <td key={k.key} className="px-5 py-3 text-center text-gray-600">{r[k.field] ?? "-"}</td>)}
                            <td className="px-5 py-3 text-center font-bold text-gray-800">{na}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {riwayatData.length > PAGE_SIZE && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Halaman {riwayatPage} dari {riwayatTotalPages}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setRiwayatPage(p => Math.max(1, p - 1))} disabled={riwayatPage <= 1}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50">← Sebelumnya</button>
                      <button onClick={() => setRiwayatPage(p => Math.min(riwayatTotalPages, p + 1))} disabled={riwayatPage >= riwayatTotalPages}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50">Selanjutnya →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB REKAP */}
        {tab === "rekap" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kelas</label>
                  <select value={rekapKelas} onChange={e => setRekapKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <button onClick={handleLoadRekap} disabled={loadingRekap}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
                  {loadingRekap ? "Memuat..." : "📊 Tampilkan Rekap"}
                </button>
              </div>
            </div>

            {rekapData.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Siswa",    value: rekapData.length,                   icon: "👥" },
                    { label: "Rata-rata",      value: rataRata,                           icon: "📊" },
                    { label: "Tertinggi",      value: tertinggi,                          icon: "🏆" },
                    { label: "Tuntas (≥75)",   value: `${tuntas}/${nilaiList.length}`,    icon: "✅" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex gap-3 text-xs text-amber-700 items-center">
                    <span className="font-semibold">⚖️ Bobot aktif:</span>
                    {KOMPONEN.map(k => <span key={k.key}>{k.label} <span className="font-bold text-blue-600">{bobot[k.key]}%</span></span>)}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 text-left">No</th>
                          <th className="px-5 py-3 text-left">Nama Siswa</th>
                          <th className="px-5 py-3 text-left">NISN</th>
                          {KOMPONEN.map(k => <th key={k.key} className="px-5 py-3 text-center">{k.label}</th>)}
                          <th className="px-5 py-3 text-center">Nilai Akhir</th>
                          <th className="px-5 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rekapData.map((r, i) => {
                          const na = calcAkhir(r, bobot);
                          const { label, cls } = getStatus(na);
                          return (
                            <tr key={r.siswa_id} className={`hover:bg-gray-50/70 ${!r.sudah_diinput ? "opacity-50" : ""}`}>
                              <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                              <td className="px-5 py-3 font-semibold text-gray-800">{r.nama_lengkap}</td>
                              <td className="px-5 py-3 text-xs text-gray-400">{r.nisn}</td>
                              {KOMPONEN.map(k => (
                                <td key={k.key} className={`px-5 py-3 text-center font-medium ${r.sudah_diinput && Number(r[k.field]) < 60 ? "text-red-500" : "text-gray-700"}`}>
                                  {r.sudah_diinput ? r[k.field] : "—"}
                                </td>
                              ))}
                              <td className="px-5 py-3 text-center font-bold text-gray-800">
                                {r.sudah_diinput ? na : "—"}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.sudah_diinput ? cls : "bg-gray-100 text-gray-500"}`}>
                                  {r.sudah_diinput ? label : "Belum Dinilai"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!loadingRekap && rekapData.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">📊</p>
                <p>Pilih kelas dan klik Tampilkan Rekap</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}