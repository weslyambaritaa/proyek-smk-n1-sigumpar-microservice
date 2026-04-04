import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useTeacherAttendance } from "../../../hooks/useTeacherAttendance";

// ── Helpers ─────────────────────────────────────────────────
function statusBadge(status) {
  switch (status) {
    case "hadir":     return "bg-green-500 text-white";
    case "izin":      return "bg-yellow-400 text-white";
    case "sakit":     return "bg-blue-400 text-white";
    case "alpa":      return "bg-red-500 text-white";
    case "terlambat": return "bg-orange-400 text-white";
    default:          return "bg-gray-300 text-gray-700";
  }
}

const PAGE_SIZE = 10;

// ── Komponen Utama ───────────────────────────────────────────
const AbsensiSiswa = () => {
  const {
    classes, selectedClass, setSelectedClass,
    subjects, selectedSubject, setSelectedSubject,
    students, attendance, setAttendance,
    loading, error,
    fetchClasses, fetchSubjects, fetchStudents, fetchAttendance,
    saveAttendance, computeStats,
  } = useTeacherAttendance();

  const [tanggal,    setTanggal]    = useState("");
  const [searchNama, setSearchNama] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [sudahCari,  setSudahCari]  = useState(false);
  const [page,       setPage]       = useState(1);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  // Ambil mapel & siswa saat kelas berubah
  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass.id);
      fetchStudents(selectedClass.id);
      setSudahCari(false);
      setAttendance({});
      setPage(1);
    }
  }, [selectedClass]);

  // Ambil absensi yang sudah ada
  useEffect(() => {
    if (selectedClass && tanggal && selectedSubject) {
      fetchAttendance(selectedClass.id, tanggal, selectedSubject.id);
    }
  }, [selectedClass, tanggal, selectedSubject]);

  useEffect(() => { computeStats(); }, [students, attendance]);

  // ── Statistik ────────────────────────────────────────────
  const stats = useMemo(() => {
    const s = { hadir: 0, izin: 0, sakit: 0, alpa: 0, terlambat: 0 };
    Object.values(attendance).forEach((v) => {
      if (v?.status && s.hasOwnProperty(v.status)) s[v.status]++;
    });
    return s;
  }, [attendance]);

  // ── Filter siswa ─────────────────────────────────────────
  const filtered = useMemo(() =>
    students.filter((s) =>
      !searchNama ||
      (s.namasiswa || "").toLowerCase().includes(searchNama.toLowerCase()) ||
      (s.nis || "").toLowerCase().includes(searchNama.toLowerCase())
    ), [students, searchNama]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Handlers ─────────────────────────────────────────────
  const handleCari = () => {
    if (!selectedClass)  { toast.error("Pilih kelas terlebih dahulu");   return; }
    if (!tanggal)        { toast.error("Pilih tanggal terlebih dahulu"); return; }
    setSudahCari(true);
    setPage(1);
  };

  const handleStatusChange = (id, field, val) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: val },
    }));
  };

  const handleTandaiSemua = (s) => {
    const all = {};
    students.forEach((st) => {
      all[st.id_siswa] = { status: s, keterangan: attendance[st.id_siswa]?.keterangan || "" };
    });
    setAttendance(all);
  };

  const handleSimpan = async () => {
    if (!selectedClass)   { toast.error("Pilih kelas dulu");           return; }
    if (!tanggal)         { toast.error("Pilih tanggal dulu");         return; }
    if (!selectedSubject) { toast.error("Pilih mata pelajaran dulu");  return; }
    const hasAny = Object.values(attendance).some((v) => v?.status);
    if (!hasAny) { toast.error("Belum ada status absensi yang diisi"); return; }

    setSaving(true);
    try {
      await saveAttendance(selectedClass.id, tanggal, selectedSubject.id, attendance);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── HEADER ──────────────────────────────────────── */}
      <div className="bg-white border-b px-8 py-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ABSENSI SISWA</h1>
        <p className="text-sm text-gray-500 mt-0.5">Laporan kehadiran seluruh siswa SMK N 1 Sigumpar</p>
      </div>

      <div className="px-8 pb-10 max-w-6xl mx-auto space-y-6">

        {/* ─── PANEL FILTER ────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">

            {/* Pilih Kelas */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Pilih Kelas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedClass?.id || ""}
                  onChange={(e) => {
                    const cls = classes.find((c) => String(c.id) === e.target.value);
                    setSelectedClass(cls || null);
                    setSelectedSubject(null);
                    setSudahCari(false);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
            </div>

            {/* Pilih Tanggal */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Pilih Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Nama Siswa (opsional) */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Nama Siswa <span className="text-gray-300 font-normal normal-case">(opsional)</span>
              </label>
              <input
                type="text"
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCari()}
                placeholder="Masukkan nama siswa..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tombol Cari */}
            <button
              onClick={handleCari}
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
            >
              {loading ? "..." : "Cari"}
            </button>
          </div>
        </div>

        {/* ─── STATISTIK KEHADIRAN ─────────────────────── */}
        {sudahCari && students.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: "Hadir",     val: stats.hadir,     color: "text-green-600",  border: "border-green-400",  bg: "bg-white" },
              { label: "Ijin",      val: stats.izin,      color: "text-yellow-500", border: "border-yellow-400", bg: "bg-white" },
              { label: "Sakit",     val: stats.sakit,     color: "text-blue-500",   border: "border-blue-400",   bg: "bg-white" },
              { label: "Alpha",     val: stats.alpa,      color: "text-red-500",    border: "border-red-400",    bg: "bg-white" },
              { label: "Terlambat", val: stats.terlambat, color: "text-orange-500", border: "border-orange-400", bg: "bg-white" },
            ].map(({ label, val, color, border, bg }) => (
              <div key={label} className={`${bg} border-b-4 ${border} rounded-xl p-4 text-center shadow-sm`}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-4xl font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── TABEL DAFTAR SISWA ──────────────────────── */}
        {sudahCari && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Sub-header: mapel + tandai semua */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 border-b border-gray-100 gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-bold text-gray-800">Daftar Kehadiran Siswa</h2>
                {filtered.length > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2.5 py-1 rounded-full">
                    {filtered.length} Total Data
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Pilih Mapel */}
                <div className="relative">
                  <select
                    value={selectedSubject?.id || ""}
                    onChange={(e) => {
                      const sub = subjects.find((s) => String(s.id) === e.target.value);
                      setSelectedSubject(sub || null);
                    }}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama_mapel}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                </div>
                {/* Tandai Semua */}
                <button
                  type="button"
                  onClick={() => handleTandaiSemua("hadir")}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  ✓ Semua Hadir
                </button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Tabel */}
            {loading ? (
              <div className="py-16 text-center text-gray-400">
                <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p>Memuat data siswa...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">👥</p>
                <p className="font-medium">Tidak ada siswa ditemukan</p>
                <p className="text-sm mt-1">Coba ubah filter pencarian</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left w-12">No</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-left">Kelas</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pagedStudents.map((student, idx) => {
                      const currStatus = attendance[student.id_siswa]?.status || "";
                      return (
                        <tr key={student.id_siswa} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-3 text-gray-400 font-medium">
                            {(page - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-800">
                            {student.namasiswa}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            {selectedClass?.nama_kelas || "-"}
                          </td>
                          <td className="px-5 py-3">
                            {currStatus ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer ${statusBadge(currStatus)}`}
                                  onClick={() => {
                                    const opts = ["hadir","izin","sakit","alpa","terlambat",""];
                                    const next = opts[(opts.indexOf(currStatus) + 1) % opts.length];
                                    handleStatusChange(student.id_siswa, "status", next);
                                  }}
                                >
                                  {currStatus}
                                </span>
                                <span className="text-gray-300 text-xs">klik ganti</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {["hadir","izin","sakit","alpa","terlambat"].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleStatusChange(student.id_siswa, "status", s)}
                                    className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all hover:opacity-80 ${
                                      s === "hadir"     ? "border-green-400 text-green-600 hover:bg-green-50" :
                                      s === "izin"      ? "border-yellow-400 text-yellow-600 hover:bg-yellow-50" :
                                      s === "sakit"     ? "border-blue-400 text-blue-600 hover:bg-blue-50" :
                                      s === "alpa"      ? "border-red-400 text-red-600 hover:bg-red-50" :
                                                          "border-orange-400 text-orange-600 hover:bg-orange-50"
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <input
                              type="text"
                              value={attendance[student.id_siswa]?.keterangan || ""}
                              onChange={(e) => handleStatusChange(student.id_siswa, "keterangan", e.target.value)}
                              placeholder="Catatan..."
                              className="border border-gray-200 rounded-lg px-3 py-1 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Halaman {page} dari {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="px-3 py-1.5 border rounded-lg font-semibold disabled:opacity-40 hover:bg-gray-50">
                    Sebelumnya
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-3 py-1.5 border rounded-lg font-semibold disabled:opacity-40 hover:bg-gray-50">
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

            {/* Tombol Simpan */}
            {!loading && students.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
                <button
                  type="button"
                  onClick={handleSimpan}
                  disabled={saving || !selectedSubject}
                  className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-200 transition-all active:scale-95"
                >
                  {saving ? "Menyimpan..." : "Simpan Absensi"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AbsensiSiswa;
