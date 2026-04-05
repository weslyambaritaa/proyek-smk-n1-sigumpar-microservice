import { useState, useEffect, useMemo } from "react";
import { vocationalApi } from "../../../api/vocationalApi";
import { academicApi } from "../../../api/academicApi";
import toast from "react-hot-toast";

const STATUS_OPTS = ["Hadir", "Izin", "Sakit", "Alpa"];
const STATUS_COLOR = {
  Hadir: "bg-green-500 text-white",
  Izin:  "bg-yellow-400 text-white",
  Sakit: "bg-blue-500 text-white",
  Alpa:  "bg-red-500 text-white",
};
const STATUS_BADGE = {
  Hadir: "bg-green-100 text-green-700",
  Izin:  "bg-yellow-100 text-yellow-700",
  Sakit: "bg-blue-100 text-blue-700",
  Alpa:  "bg-red-100 text-red-700",
};

export default function AbsensiPramukaPage() {
  const [kelasList,      setKelasList]      = useState([]);
  const [selectedKelas,  setSelectedKelas]  = useState("");
  const [siswaAbsensi,   setSiswaAbsensi]   = useState([]);
  const [tanggal,        setTanggal]        = useState(new Date().toISOString().slice(0, 10));
  const [deskripsi,      setDeskripsi]      = useState("");
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [loadingSiswa,   setLoadingSiswa]   = useState(false);

  // Tab
  const [tab, setTab] = useState("input"); // "input" | "rekap"

  // Rekap
  const [rekapData,      setRekapData]      = useState([]);
  const [rekapKelas,     setRekapKelas]     = useState("");
  const [tanggalMulai,   setTanggalMulai]   = useState("");
  const [tanggalAkhir,   setTanggalAkhir]   = useState("");
  const [loadingRekap,   setLoadingRekap]   = useState(false);

  // Load kelas dari academic service
  useEffect(() => {
    academicApi.getAllKelas()
      .then(r => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => toast.error("Gagal memuat daftar kelas"));
  }, []);

  // Load siswa berdasarkan kelas dari academic service
  useEffect(() => {
    if (!selectedKelas) { setSiswaAbsensi([]); return; }
    setLoadingSiswa(true);
    academicApi.getAllSiswa({ kelas_id: selectedKelas })
      .then(r => {
        const list = Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : []);
        setSiswaAbsensi(list.map(s => ({ ...s, status_kehadiran: "Hadir", keterangan: "" })));
      })
      .catch(() => toast.error("Gagal memuat data siswa"))
      .finally(() => setLoadingSiswa(false));
  }, [selectedKelas]);

  const summary = useMemo(() => {
    const s = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 };
    siswaAbsensi.forEach(x => { s[x.status_kehadiran] = (s[x.status_kehadiran] || 0) + 1; });
    return { ...s, total: siswaAbsensi.length };
  }, [siswaAbsensi]);

  const setStatus = (id, status) =>
    setSiswaAbsensi(prev => prev.map(s => s.id === id ? { ...s, status_kehadiran: status } : s));

  const tandaiSemua = (status) =>
    setSiswaAbsensi(prev => prev.map(s => ({ ...s, status_kehadiran: status })));

  const handleSubmit = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    if (siswaAbsensi.length === 0) { toast.error("Tidak ada siswa di kelas ini"); return; }

    const payload = {
      kelas_id: selectedKelas,
      tanggal,
      deskripsi,
      data_absensi: siswaAbsensi.map(s => ({
        siswa_id: s.id,
        nama_lengkap: s.nama_lengkap,
        status: s.status_kehadiran,
      })),
    };

    setIsSubmitting(true);
    try {
      await vocationalApi.submitAbsensiPramuka(payload);
      toast.success("Absensi Pramuka berhasil disimpan!");
      setDeskripsi("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Gagal menyimpan absensi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadRekap = async () => {
    setLoadingRekap(true);
    try {
      const res = await vocationalApi.getAbsensiPramuka({
        kelas_id: rekapKelas || undefined,
        tanggal_mulai: tanggalMulai || undefined,
        tanggal_akhir: tanggalAkhir || undefined,
      });
      setRekapData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setRekapData([]); }
    finally { setLoadingRekap(false); }
  };

  const namaKelas = kelasList.find(k => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ABSENSI PRAMUKA</h1>
        <p className="text-sm text-gray-500 mt-0.5">Input & rekap absensi kegiatan pramuka per kelas</p>
      </div>

      {/* Tab */}
      <div className="px-8 pt-5">
        <div className="flex gap-2 bg-white border rounded-xl p-1 w-fit">
          {[{ key: "input", label: "📋 Input Absensi" }, { key: "rekap", label: "📊 Riwayat & Rekap" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-5 max-w-5xl mx-auto space-y-5">
        {tab === "input" && (
          <>
            {/* Pilih Kelas & Tanggal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label>
                  <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal Kegiatan</label>
                  <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deskripsi Kegiatan</label>
                  <input type="text" value={deskripsi} onChange={e => setDeskripsi(e.target.value)}
                    placeholder="Contoh: Baris-berbaris, P3K..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {selectedKelas && (
              <>
                {/* Statistik */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "Total", val: summary.total, cls: "bg-white border text-gray-800" },
                    { label: "Hadir", val: summary.Hadir, cls: "bg-green-50 border border-green-200 text-green-700" },
                    { label: "Izin",  val: summary.Izin,  cls: "bg-yellow-50 border border-yellow-200 text-yellow-700" },
                    { label: "Sakit", val: summary.Sakit, cls: "bg-blue-50 border border-blue-200 text-blue-700" },
                    { label: "Alpa",  val: summary.Alpa,  cls: "bg-red-50 border border-red-200 text-red-700" },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className={`rounded-xl p-3 text-center ${cls}`}>
                      <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
                      <p className="text-2xl font-bold">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Daftar Siswa */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                      <h2 className="font-bold text-gray-800">Daftar Siswa — {namaKelas}</h2>
                      <p className="text-xs text-gray-400">{tanggal}</p>
                    </div>
                    <div className="flex gap-2">
                      {STATUS_OPTS.map(s => (
                        <button key={s} onClick={() => tandaiSemua(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${STATUS_COLOR[s]} opacity-80 hover:opacity-100 transition-opacity`}>
                          Semua {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingSiswa ? (
                    <div className="py-12 text-center text-gray-400">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                      <p>Memuat daftar siswa...</p>
                    </div>
                  ) : siswaAbsensi.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <p className="text-3xl mb-2">👤</p>
                      <p>Tidak ada siswa di kelas ini</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 text-left">No</th>
                          <th className="px-5 py-3 text-left">Nama Siswa</th>
                          <th className="px-5 py-3 text-left">NISN</th>
                          <th className="px-5 py-3 text-center">Status Kehadiran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {siswaAbsensi.map((s, i) => (
                          <tr key={s.id} className="hover:bg-gray-50/70">
                            <td className="px-5 py-3 text-gray-400 font-medium">{i + 1}</td>
                            <td className="px-5 py-3 font-semibold text-gray-800">{s.nama_lengkap}</td>
                            <td className="px-5 py-3 text-gray-500 text-xs">{s.nisn}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {STATUS_OPTS.map(status => (
                                  <button key={status} onClick={() => setStatus(s.id, status)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                      s.status_kehadiran === status
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
                  )}

                  {siswaAbsensi.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                      <button onClick={handleSubmit} disabled={isSubmitting}
                        className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow transition-all">
                        {isSubmitting ? "Menyimpan..." : "💾 Simpan Absensi"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === "rekap" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">Filter Riwayat Absensi</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kelas</label>
                  <select value={rekapKelas} onChange={e => setRekapKelas(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Semua Kelas</option>
                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tanggal Mulai</label>
                  <input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tanggal Akhir</label>
                  <input type="date" value={tanggalAkhir} onChange={e => setTanggalAkhir(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleLoadRekap} disabled={loadingRekap}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
                  {loadingRekap ? "..." : "🔍 Tampilkan"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingRekap ? (
                <div className="py-12 text-center text-gray-400">Memuat data...</div>
              ) : rekapData.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-3xl mb-2">📊</p>
                  <p>Klik Tampilkan untuk melihat riwayat absensi</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Tanggal</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-left">Kelas</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rekapData.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 text-gray-600">{r.tanggal}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{r.nama_lengkap || r.nama_siswa || "-"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{r.nama_kelas || r.nama_regu || "-"}</td>
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
      </div>
    </div>
  );
}
