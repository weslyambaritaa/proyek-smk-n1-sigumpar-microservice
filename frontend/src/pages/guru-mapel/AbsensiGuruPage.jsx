import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import keycloak from "../../keycloak";
import {
  createAbsensiGuru,
  deleteAbsensiGuru,
  getAbsensiGuru,
  updateAbsensiGuru,
} from "../../api/learningApi";

// ── Helpers ────────────────────────────────────────────────
const NOW_WIB = () => {
  const now = new Date();
  return now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }) + " WIB";
};

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

const STATUS_BATAS_JAM = 7;
const STATUS_BATAS_MENIT = 30;

function statusBadgeClass(status) {
  switch (status) {
    case "hadir":     return "bg-green-500 text-white";
    case "terlambat": return "bg-yellow-400 text-white";
    case "izin":      return "bg-blue-500 text-white";
    case "sakit":     return "bg-orange-400 text-white";
    case "alpa":      return "bg-red-500 text-white";
    default:          return "bg-gray-300 text-gray-700";
  }
}

// ── Komponen ────────────────────────────────────────────────
export default function AbsensiGuruPage() {
  const namaGuru = keycloak.tokenParsed?.name || "Guru";
  const userId   = keycloak.tokenParsed?.sub   || "";
  const initials = namaGuru.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // form state
  const [tanggal,       setTanggal]       = useState(TODAY_ISO());
  const [status,        setStatus]        = useState("hadir");
  const [keterangan,    setKeterangan]    = useState("");
  const [fotoPreview,   setFotoPreview]   = useState(null);
  const [fotoBase64,    setFotoBase64]    = useState(null);
  const fileInputRef = useRef();

  // jam live
  const [jamSekarang, setJamSekarang] = useState(NOW_WIB());
  useEffect(() => {
    const t = setInterval(() => setJamSekarang(NOW_WIB()), 30_000);
    return () => clearInterval(t);
  }, []);

  // data tabel
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [filterTanggal, setFilterTanggal] = useState(TODAY_ISO());

  // pagination
  const PAGE_SIZE = 7;
  const [page, setPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAbsensiGuru(filterTanggal ? { tanggal: filterTanggal } : {});
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setRows(data);
      setPage(1);
    } catch {
      toast.error("Gagal memuat absensi guru");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterTanggal]);

  // summary
  const summary = useMemo(() =>
    rows.reduce(
      (acc, r) => { acc.total++; acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
      { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 }
    ), [rows]);

  // foto handler
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result);
      setFotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tanggal) { toast.error("Tanggal wajib diisi"); return; }

    setSaving(true);
    try {
      await createAbsensiGuru({
        user_id: userId,
        namaGuru,
        mataPelajaran: "-",
        tanggal,
        status,
        keterangan,
        foto: fotoBase64,
      });
      toast.success("Absensi berhasil dikirim!");
      setKeterangan("");
      setFotoPreview(null);
      setFotoBase64(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // refresh tabel jika filter sama dengan tanggal form
      if (filterTanggal === tanggal) loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan absensi";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (row, s) => {
    try {
      await updateAbsensiGuru(row.id_absensiGuru, { status: s });
      toast.success("Status diperbarui");
      loadData();
    } catch { toast.error("Gagal memperbarui status"); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Hapus absensi ${row.namaGuru}?`)) return;
    try {
      await deleteAbsensiGuru(row.id_absensiGuru);
      toast.success("Absensi dihapus");
      loadData();
    } catch { toast.error("Gagal menghapus absensi"); }
  };

  // pagination
  const totalPages  = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows   = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── RENDER ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── HEADER ─────────────────────────────────────── */}
      <div className="bg-white border-b px-8 py-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ABSENSI MANDIRI GURU</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Batas waktu pengiriman absensi adalah pukul 0{STATUS_BATAS_JAM}:{String(STATUS_BATAS_MENIT).padStart(2,"0")} WIB
        </p>
      </div>

      <div className="px-8 pb-10 max-w-5xl mx-auto space-y-6">

        {/* ─── KARTU FORM ABSENSI ──────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Info Guru */}
          <div className="flex items-center justify-between px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow">
                {initials}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-base">{namaGuru}</p>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Guru Mata Pelajaran</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Waktu Sekarang</p>
              <p className="text-2xl font-bold text-gray-800 tabular-nums">{jamSekarang}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex flex-col md:flex-row gap-6">

              {/* Kiri: Form Fields */}
              <div className="flex-1 space-y-5">
                {/* Tanggal */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Pilih Tanggal Absensi
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Status Kehadiran
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hadir">HADIR</option>
                      <option value="terlambat">TERLAMBAT</option>
                      <option value="izin">IZIN</option>
                      <option value="sakit">SAKIT</option>
                      <option value="alpa">ALPA</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
                  </div>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Keterangan / Catatan
                  </label>
                  <textarea
                    rows={4}
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Tulis alasan jika Izin/Sakit..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Kanan: Upload Foto */}
              <div className="w-full md:w-60 flex flex-col gap-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Unggah Bukti Foto (Selfie)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden"
                >
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto selfie" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="text-4xl text-gray-300 mb-2">📷</div>
                      <p className="text-xs text-gray-400 text-center px-3">Klik untuk ambil foto / upload</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFotoChange}
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 text-xs text-yellow-700">
                  ℹ️ Pastikan foto yang diunggah adalah foto asli pada hari ini. Sistem akan menolak absensi jika dikirim melewati pukul 0{STATUS_BATAS_JAM}:{String(STATUS_BATAS_MENIT).padStart(2,"0")} WIB.
                </div>
              </div>
            </div>

            {/* Tombol Submit */}
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={saving}
                className="px-16 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95 tracking-wider"
              >
                {saving ? "MENGIRIM..." : "KIRIM ABSENSI"}
              </button>
            </div>
          </form>
        </div>

        {/* ─── RINGKASAN STATISTIK ─────────────────────── */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Total",     val: summary.total,     cls: "bg-white border text-gray-800" },
            { label: "Hadir",     val: summary.hadir,     cls: "bg-green-50 border border-green-200 text-green-700" },
            { label: "Terlambat", val: summary.terlambat, cls: "bg-yellow-50 border border-yellow-200 text-yellow-700" },
            { label: "Izin",      val: summary.izin,      cls: "bg-blue-50 border border-blue-200 text-blue-700" },
            { label: "Sakit",     val: summary.sakit,     cls: "bg-orange-50 border border-orange-200 text-orange-700" },
            { label: "Alpa",      val: summary.alpa,      cls: "bg-red-50 border border-red-200 text-red-700" },
          ].map(({ label, val, cls }) => (
            <div key={label} className={`rounded-xl p-3 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
              <p className="text-2xl font-bold">{val}</p>
            </div>
          ))}
        </div>

        {/* ─── TABEL RIWAYAT ───────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Daftar Absensi Guru</h2>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={loadData}
                disabled={loading}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                {loading ? "..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">No</th>
                  <th className="px-5 py-3 text-left">Nama Guru</th>
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-left">Jam Masuk</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Keterangan</th>
                  <th className="px-5 py-3 text-center">Ubah Status</th>
                  <th className="px-5 py-3 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                      <p>Memuat data...</p>
                    </td>
                  </tr>
                ) : pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <p className="text-3xl mb-2">📋</p>
                      <p>Belum ada data absensi untuk tanggal ini</p>
                    </td>
                  </tr>
                ) : pagedRows.map((row, i) => (
                  <tr key={row.id_absensiGuru} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3 text-gray-400 font-medium">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{row.namaGuru}</td>
                    <td className="px-5 py-3 text-gray-600">{row.tanggal}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {row.jamMasuk
                        ? new Date(row.jamMasuk).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
                        : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{row.keterangan || "-"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center flex-wrap gap-1">
                        {["hadir","terlambat","izin","sakit","alpa"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleQuickStatus(row, s)}
                            disabled={row.status === s}
                            className={`px-2 py-0.5 rounded text-xs font-semibold capitalize transition-all disabled:opacity-30 ${statusBadgeClass(s)}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition-all"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && rows.length > PAGE_SIZE && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Halaman {page} dari {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  ← Sebelumnya
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
