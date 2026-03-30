import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";

// =============================================
// KONSTANTA
// =============================================
const BOBOT = { tugas: 15, kuis: 15, uts: 20, uas: 30, praktik: 20 };

const TAHUN_AJAR_OPTIONS = [
  "2023/2024",
  "2024/2025",
  "2025/2026",
  "2026/2027",
];

function hitungNilaiAkhir(row) {
  const t = Number(row.nilai_tugas) || 0;
  const k = Number(row.nilai_kuis) || 0;
  const u = Number(row.nilai_uts) || 0;
  const a = Number(row.nilai_uas) || 0;
  const p = Number(row.nilai_praktik) || 0;
  return (
    (t * BOBOT.tugas + k * BOBOT.kuis + u * BOBOT.uts + a * BOBOT.uas + p * BOBOT.praktik) /
    100
  ).toFixed(2);
}

// =============================================
// KOMPONEN UTAMA
// =============================================
export default function InputNilaiPage() {
  // ----- State: filter -----
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("2023/2024");
  const [searchNama, setSearchNama] = useState("");

  // ----- State: data -----
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

  // ----- Pagination -----
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // =============================================
  // Fetch master data (mapel & kelas)
  // =============================================
  useEffect(() => {
    Promise.all([academicApi.getAllMapel(), academicApi.getAllKelas()])
      .then(([mapelRes, kelasRes]) => {
        setMapelList(mapelRes.data || []);
        setKelasList(kelasRes.data || []);
      })
      .catch(() => toast.error("Gagal memuat data mapel/kelas"));
  }, []);

  // =============================================
  // Fetch siswa + nilai
  // =============================================
  const fetchData = useCallback(async () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    setLoading(true);
    setSudahCari(true);
    try {
      const res = await academicApi.getSiswaByKelas({
        kelas_id: selectedKelas,
        mapel_id: selectedMapel || undefined,
        tahun_ajar: selectedTahun || undefined,
      });
      const data = res.data?.data || [];
      // Filter nama lokal
      const filtered = searchNama
        ? data.filter((r) =>
            r.nama_lengkap.toLowerCase().includes(searchNama.toLowerCase())
          )
        : data;
      setRows(
        filtered.map((r) => ({
          ...r,
          _dirty: false, // tandai apakah baris ini berubah
        }))
      );
      setPage(1);
    } catch {
      toast.error("Gagal memuat data nilai siswa");
    } finally {
      setLoading(false);
    }
  }, [selectedKelas, selectedMapel, selectedTahun, searchNama]);

  // =============================================
  // Handle perubahan input nilai
  // =============================================
  const handleNilaiChange = (idx, field, val) => {
    const parsed = val === "" ? "" : Math.min(100, Math.max(0, Number(val)));
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, [field]: parsed, _dirty: true } : r
      )
    );
  };

  // =============================================
  // Simpan semua nilai
  // =============================================
  const handleSimpan = async () => {
    if (!selectedMapel) {
      toast.error("Pilih mata pelajaran sebelum menyimpan");
      return;
    }
    if (!selectedKelas) {
      toast.error("Pilih kelas sebelum menyimpan");
      return;
    }

    setSaving(true);
    try {
      const nilaiPayload = rows.map((r) => ({
        siswa_id: r.siswa_id,
        nilai_tugas: Number(r.nilai_tugas) || 0,
        nilai_kuis: Number(r.nilai_kuis) || 0,
        nilai_uts: Number(r.nilai_uts) || 0,
        nilai_uas: Number(r.nilai_uas) || 0,
        nilai_praktik: Number(r.nilai_praktik) || 0,
      }));

      await academicApi.saveNilaiBulk({
        mapel_id: selectedMapel,
        kelas_id: selectedKelas,
        tahun_ajar: selectedTahun,
        nilai: nilaiPayload,
      });

      toast.success("Semua nilai berhasil disimpan!");
      setRows((prev) => prev.map((r) => ({ ...r, _dirty: false })));
    } catch {
      toast.error("Gagal menyimpan nilai. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // =============================================
  // Reset filter
  // =============================================
  const handleReset = () => {
    setSelectedMapel("");
    setSelectedKelas("");
    setSelectedTahun("2023/2024");
    setSearchNama("");
    setRows([]);
    setSudahCari(false);
    setPage(1);
  };

  // =============================================
  // Pagination
  // =============================================
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // helper: nama kelas / mapel terpilih
  const namaKelas =
    kelasList.find((k) => String(k.id) === String(selectedKelas))
      ?.nama_kelas || "";
  const namaMapel =
    mapelList.find((m) => String(m.id) === String(selectedMapel))
      ?.nama_mapel || "";

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      {/* ===== HEADER ===== */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          INPUT &amp; KELOLA NILAI
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Kelola nilai tugas, kuis, UTS, UAS, dan praktik siswa
        </p>
      </div>

      {/* ===== PANEL FILTER ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          {/* Mapel */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Mapel
            </label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">-- Pilih Mapel --</option>
              {mapelList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama_mapel}
                </option>
              ))}
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Kelas
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun Ajar */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Tahun Ajar
            </label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {TAHUN_AJAR_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Cari Nama */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Cari Nama
            </label>
            <input
              type="text"
              value={searchNama}
              onChange={(e) => setSearchNama(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              placeholder="Ketik nama..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Tombol */}
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm shadow-blue-200 active:scale-95"
            >
              {loading ? "..." : "CARI"}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all active:scale-95"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABEL NILAI ===== */}
      {sudahCari && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Header tabel */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Daftar Nilai
                {namaKelas && (
                  <span className="text-gray-500 font-normal">
                    {" "}— {namaKelas}
                  </span>
                )}
              </h2>
              {rows.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {rows.length} siswa ditemukan
                </p>
              )}
            </div>
            {namaMapel && (
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {namaMapel}
              </span>
            )}
          </div>

          {/* Bobot info */}
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>📊 Bobot Nilai:</span>
            <span className="font-medium text-gray-700">Tugas {BOBOT.tugas}%</span>
            <span>·</span>
            <span className="font-medium text-gray-700">Kuis {BOBOT.kuis}%</span>
            <span>·</span>
            <span className="font-medium text-gray-700">UTS {BOBOT.uts}%</span>
            <span>·</span>
            <span className="font-medium text-gray-700">UAS {BOBOT.uas}%</span>
            <span>·</span>
            <span className="font-medium text-gray-700">Praktik {BOBOT.praktik}%</span>
          </div>

          {/* Tabel */}
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-medium">Tidak ada siswa ditemukan</p>
              <p className="text-sm mt-1">Coba pilih kelas yang berbeda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left w-10">No</th>
                    <th className="px-4 py-3 text-left">Nama Siswa</th>
                    <th className="px-4 py-3 text-center w-24">Tugas</th>
                    <th className="px-4 py-3 text-center w-24">Kuis</th>
                    <th className="px-4 py-3 text-center w-24">UTS</th>
                    <th className="px-4 py-3 text-center w-24">UAS</th>
                    <th className="px-4 py-3 text-center w-24">Praktik</th>
                    <th className="px-4 py-3 text-center w-28">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedRows.map((row, localIdx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + localIdx;
                    const akhir = hitungNilaiAkhir(row);
                    const isModified = row._dirty;

                    return (
                      <tr
                        key={row.siswa_id}
                        className={`transition-colors ${
                          isModified ? "bg-yellow-50/60" : "hover:bg-gray-50/70"
                        }`}
                      >
                        {/* No */}
                        <td className="px-4 py-3 text-gray-400 font-medium">
                          {globalIdx + 1}
                        </td>

                        {/* Nama */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">
                            {row.nama_lengkap}
                          </div>
                          <div className="text-xs text-gray-400">
                            NIS: {row.nisn}
                          </div>
                        </td>

                        {/* Input Nilai */}
                        {[
                          "nilai_tugas",
                          "nilai_kuis",
                          "nilai_uts",
                          "nilai_uas",
                          "nilai_praktik",
                        ].map((field) => (
                          <td key={field} className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row[field]}
                              onChange={(e) =>
                                handleNilaiChange(globalIdx, field, e.target.value)
                              }
                              className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white"
                            />
                          </td>
                        ))}

                        {/* Nilai Akhir */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-bold text-base ${
                              Number(akhir) >= 75
                                ? "text-blue-600"
                                : Number(akhir) >= 60
                                ? "text-yellow-600"
                                : "text-red-500"
                            }`}
                          >
                            {akhir}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && rows.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                HALAMAN {page} DARI {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-all"
                >
                  SEBELUMNYA
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-all"
                >
                  SELANJUTNYA
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TOMBOL SIMPAN ===== */}
      {sudahCari && rows.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSimpan}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 px-10 rounded-2xl text-sm tracking-wide shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {saving ? "MENYIMPAN..." : "SIMPAN SEMUA NILAI"}
          </button>
        </div>
      )}
    </div>
  );
}
