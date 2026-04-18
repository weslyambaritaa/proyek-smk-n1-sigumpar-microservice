import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../../api/academicApi";

const STATUS_OPTS = ["hadir", "izin", "sakit", "alpa", "terlambat"];
const STATUS_COLOR = {
  hadir:     "bg-green-500 text-white",
  izin:      "bg-yellow-400 text-white",
  sakit:     "bg-blue-500 text-white",
  alpa:      "bg-red-500 text-white",
  terlambat: "bg-orange-400 text-white",
};
const STATUS_BADGE = {
  hadir:     "bg-green-100 text-green-700",
  izin:      "bg-yellow-100 text-yellow-700",
  sakit:     "bg-blue-100 text-blue-700",
  alpa:      "bg-red-100 text-red-700",
  terlambat: "bg-orange-100 text-orange-700",
};

const TABS = [
  { key: "input",   label: "Input Absensi",  icon: "✏️" },
  { key: "riwayat", label: "Riwayat",        icon: "📋" },
  { key: "rekap",   label: "Rekap",          icon: "📊" },
];

export default function AbsensiSiswa() {
  const [tab, setTab] = useState("input");

  // ── State Input ──
  const [kelasList,     setKelasList]     = useState([]);
  const [mapelList,     setMapelList]     = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [tanggal,       setTanggal]       = useState(new Date().toISOString().slice(0, 10));
  const [siswaList,     setSiswaList]     = useState([]);
  const [absensi,       setAbsensi]       = useState({});
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [sudahCari,     setSudahCari]     = useState(false);

  // ── State Riwayat ──
  const [riwayatKelas,   setRiwayatKelas]   = useState("");
  const [riwayatTanggal, setRiwayatTanggal] = useState("");
  const [riwayatData,    setRiwayatData]    = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  // ── State Rekap ──
  const [rekapKelas,  setRekapKelas]  = useState("");
  const [rekapMulai,  setRekapMulai]  = useState("");
  const [rekapAkhir,  setRekapAkhir]  = useState("");
  const [rekapData,   setRekapData]   = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  useEffect(() => {
    Promise.all([academicApi.getAllKelas(), academicApi.getAllMapel()])
      .then(([kr, mr]) => {
        setKelasList(Array.isArray(kr.data) ? kr.data : (kr.data?.data || []));
        setMapelList(Array.isArray(mr.data) ? mr.data : (mr.data?.data || []));
      })
      .catch(() => toast.error("Gagal memuat data kelas/mapel"));
  }, []);

  // Load siswa saat kelas berubah
  useEffect(() => {
    if (!selectedKelas) { setSiswaList([]); setAbsensi({}); return; }
    academicApi.getAllSiswa({ kelas_id: selectedKelas })
      .then(r => {
        const list = Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : []);
        setSiswaList(list);
        const map = {};
        list.forEach(s => { map[s.id] = { status: "hadir", keterangan: "" }; });
        setAbsensi(map);
      })
      .catch(() => toast.error("Gagal memuat data siswa"));
  }, [selectedKelas]);

  // Load absensi yang sudah ada
  useEffect(() => {
    if (!selectedKelas || !tanggal) return;
    academicApi.getAbsensiSiswa({ kelas_id: selectedKelas, tanggal, mapel_id: selectedMapel || undefined })
      .then(r => {
        const data = Array.isArray(r.data?.data) ? r.data.data : [];
        if (data.length > 0) {
          const map = {};
          data.forEach(a => { map[a.siswa_id] = { status: a.status, keterangan: a.keterangan || "" }; });
          setAbsensi(prev => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});
  }, [selectedKelas, tanggal, selectedMapel]);

  const stats = useMemo(() => {
    const s = { hadir: 0, izin: 0, sakit: 0, alpa: 0, terlambat: 0 };
    Object.values(absensi).forEach(v => { if (v?.status && s.hasOwnProperty(v.status)) s[v.status]++; });
    return s;
  }, [absensi]);

  const setStatus = (id, status) =>
    setAbsensi(prev => ({ ...prev, [id]: { ...prev[id], status } }));

  const tandaiSemua = (status) => {
    const map = {};
    siswaList.forEach(s => { map[s.id] = { status, keterangan: "" }; });
    setAbsensi(map);
  };

  const handleSimpan = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    if (!tanggal)       { toast.error("Pilih tanggal terlebih dahulu"); return; }
    setSaving(true);
    try {
      const payload = {
        kelas_id:  selectedKelas,
        mapel_id:  selectedMapel || null,
        tanggal,
        data_absensi: siswaList.map(s => ({
          siswa_id:   s.id,
          status:     absensi[s.id]?.status || "hadir",
          keterangan: absensi[s.id]?.keterangan || "",
        })),
      };
      await academicApi.createAbsensiSiswa(payload);
      toast.success("Absensi berhasil disimpan!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadRiwayat = async () => {
    if (!riwayatKelas && !riwayatTanggal) {
      toast.error("Pilih kelas atau tanggal untuk melihat riwayat");
      return;
    }
    setLoadingRiwayat(true);
    try {
      const res = await academicApi.getAbsensiSiswa({
        kelas_id: riwayatKelas || undefined,
        tanggal:  riwayatTanggal || undefined,
      });
      setRiwayatData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat riwayat absensi");
      setRiwayatData([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const handleLoadRekap = async () => {
    if (!rekapKelas) { toast.error("Pilih kelas untuk melihat rekap"); return; }
    setLoadingRekap(true);
    try {
      const res = await academicApi.getRekapAbsensiWali({
        kelas_id:      rekapKelas,
        tanggal_mulai: rekapMulai || undefined,
        tanggal_akhir: rekapAkhir || undefined,
      });
      setRekapData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat rekap absensi");
      setRekapData([]);
    } finally {
      setLoadingRekap(false);
    }
  };

  const namaKelas = kelasList.find(k => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <h1 className="text-xl font-bold text-gray-800">Absensi Siswa</h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">

        {/* ── TAB INPUT ── */}
        {tab === "input" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label>
                  <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mata Pelajaran</label>
                  <select value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Mapel --</option>
                    {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label>
                  <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  {STATUS_OPTS.slice(0, 2).map(s => (
                    <button key={s} onClick={() => tandaiSemua(s)}
                      className={`flex-1 px-2 py-2.5 rounded-xl text-xs font-bold ${STATUS_COLOR[s]} opacity-80 hover:opacity-100 transition-opacity`}>
                      Semua {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedKelas && siswaList.length > 0 && (
              <>
                {/* Statistik */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "Total",     val: siswaList.length, cls: "bg-white border border-gray-200 text-gray-800" },
                    { label: "Hadir",     val: stats.hadir,     cls: "bg-green-50 border border-green-200 text-green-700" },
                    { label: "Izin",      val: stats.izin,      cls: "bg-yellow-50 border border-yellow-200 text-yellow-700" },
                    { label: "Sakit",     val: stats.sakit,     cls: "bg-blue-50 border border-blue-200 text-blue-700" },
                    { label: "Alpa",      val: stats.alpa,      cls: "bg-red-50 border border-red-200 text-red-700" },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className={`rounded-xl p-3 text-center ${cls}`}>
                      <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
                      <p className="text-2xl font-bold">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                      <h2 className="font-bold text-gray-800">Daftar Siswa — {namaKelas}</h2>
                      <p className="text-xs text-gray-400">{tanggal}</p>
                    </div>
                    <div className="flex gap-2">
                      {STATUS_OPTS.map(s => (
                        <button key={s} onClick={() => tandaiSemua(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${STATUS_COLOR[s]} opacity-75 hover:opacity-100 transition-opacity`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3 text-left">No</th>
                        <th className="px-5 py-3 text-left">Nama Siswa</th>
                        <th className="px-5 py-3 text-left">NISN</th>
                        <th className="px-5 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {siswaList.map((s, i) => (
                        <tr key={s.id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-5 py-3 font-semibold text-gray-800">{s.nama_lengkap}</td>
                          <td className="px-5 py-3 text-gray-500 text-xs">{s.nisn}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {STATUS_OPTS.map(status => (
                                <button key={status} onClick={() => setStatus(s.id, status)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    absensi[s.id]?.status === status
                                      ? STATUS_COLOR[status] + " ring-2 ring-offset-1 ring-current shadow"
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                  }`}>
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button onClick={handleSimpan} disabled={saving}
                      className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow transition-all">
                      {saving ? "Menyimpan..." : "💾 Simpan Absensi"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {selectedKelas && siswaList.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">👤</p>
                <p>Tidak ada siswa di kelas ini</p>
              </div>
            )}
          </>
        )}

        {/* ── TAB RIWAYAT ── */}
        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">Filter Riwayat Absensi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kelas</label>
                  <select value={riwayatKelas} onChange={e => setRiwayatKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Semua Kelas</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tanggal</label>
                  <input type="date" value={riwayatTanggal} onChange={e => setRiwayatTanggal(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleLoadRiwayat} disabled={loadingRiwayat}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
                  {loadingRiwayat ? "Memuat..." : "🔍 Tampilkan Riwayat"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loadingRiwayat ? (
                <div className="py-12 text-center text-gray-400">Memuat data...</div>
              ) : riwayatData.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Pilih filter dan klik Tampilkan Riwayat</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Tanggal</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-left">Kelas</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {riwayatData.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3 text-gray-600">{r.tanggal}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{r.nama_lengkap || r.nama_siswa || "-"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{r.nama_kelas || "-"}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-600"}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── TAB REKAP ── */}
        {tab === "rekap" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">Rekap Absensi Siswa</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kelas</label>
                  <select value={rekapKelas} onChange={e => setRekapKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tanggal Mulai</label>
                  <input type="date" value={rekapMulai} onChange={e => setRekapMulai(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tanggal Akhir</label>
                  <input type="date" value={rekapAkhir} onChange={e => setRekapAkhir(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleLoadRekap} disabled={loadingRekap}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
                  {loadingRekap ? "Memuat..." : "📊 Tampilkan Rekap"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loadingRekap ? (
                <div className="py-12 text-center text-gray-400">Memuat data...</div>
              ) : rekapData.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-2">📊</p>
                  <p>Pilih kelas dan klik Tampilkan Rekap</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-center">Hadir</th>
                      <th className="px-5 py-3 text-center">Izin</th>
                      <th className="px-5 py-3 text-center">Sakit</th>
                      <th className="px-5 py-3 text-center">Alpa</th>
                      <th className="px-5 py-3 text-center">Total</th>
                      <th className="px-5 py-3 text-center">% Hadir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rekapData.map((r, i) => {
                      const total = (r.hadir||0)+(r.izin||0)+(r.sakit||0)+(r.alpa||0);
                      const pct = total ? Math.round((r.hadir||0)/total*100) : 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-5 py-3 font-semibold text-gray-800">{r.nama_lengkap || r.nama_siswa || "-"}</td>
                          <td className="px-5 py-3 text-center text-green-600 font-bold">{r.hadir || 0}</td>
                          <td className="px-5 py-3 text-center text-yellow-600 font-bold">{r.izin || 0}</td>
                          <td className="px-5 py-3 text-center text-blue-600 font-bold">{r.sakit || 0}</td>
                          <td className="px-5 py-3 text-center text-red-600 font-bold">{r.alpa || 0}</td>
                          <td className="px-5 py-3 text-center text-gray-600 font-bold">{total}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${pct >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}