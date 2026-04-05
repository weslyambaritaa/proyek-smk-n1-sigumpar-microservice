import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

const TAHUN_OPTS = ["2023/2024", "2024/2025", "2025/2026"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const gradeColor = (v) =>
  Number(v) >= 75
    ? "text-green-600 font-semibold"
    : Number(v) >= 60
    ? "text-yellow-600 font-semibold"
    : "text-red-500 font-semibold";

const gradeLabel = (v) =>
  Number(v) >= 75 ? "Tuntas" : Number(v) >= 60 ? "Cukup" : "Belum Tuntas";

const gradeBadge = (v) =>
  Number(v) >= 75
    ? "bg-green-100 text-green-700 border border-green-200"
    : Number(v) >= 60
    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
    : "bg-red-100 text-red-500 border border-red-200";

// ─── Modal Detail Nilai Satu Siswa ────────────────────────────────────────────

function DetailSiswaModal({ siswaId, tahunAjar, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siswaId) return;
    setLoading(true);
    const qs = tahunAjar ? `?tahun_ajar=${tahunAjar}` : "";
    axiosInstance
      .get(`/api/academic/kepsek/rekap-nilai-final/detail-siswa/${siswaId}${qs}`)
      .then((r) => setDetail(r.data?.data || null))
      .catch(() => toast.error("Gagal memuat detail nilai siswa"))
      .finally(() => setLoading(false));
  }, [siswaId, tahunAjar]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Detail Nilai Siswa</h2>
            {detail && (
              <p className="text-sm text-gray-500 mt-0.5">
                {detail.nama_lengkap} · {detail.nisn} · {detail.nama_kelas}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !detail ? (
            <p className="text-center text-gray-400 py-16">Data tidak ditemukan.</p>
          ) : (
            <>
              {/* Rata-rata umum */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Rata-rata Semua Mapel
                  </p>
                  <p className={`text-3xl font-bold mt-0.5 ${gradeColor(detail.rata_rata_umum)}`}>
                    {detail.rata_rata_umum}
                  </p>
                </div>
                <span
                  className={`ml-auto text-sm px-3 py-1 rounded-full font-semibold ${gradeBadge(detail.rata_rata_umum)}`}
                >
                  {gradeLabel(detail.rata_rata_umum)}
                </span>
              </div>

              {/* Tabel nilai per mapel */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                      <th className="px-3 py-3 text-center">Tugas</th>
                      <th className="px-3 py-3 text-center">Kuis</th>
                      <th className="px-3 py-3 text-center">UTS</th>
                      <th className="px-3 py-3 text-center">UAS</th>
                      <th className="px-3 py-3 text-center">Praktik</th>
                      <th className="px-3 py-3 text-center">Akhir</th>
                      <th className="px-3 py-3 text-center">Predikat</th>
                      <th className="px-3 py-3 text-center">Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.nilai_mapel.map((nm, i) => (
                      <tr
                        key={nm.mapel_id}
                        className={`border-t border-gray-100 ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-4 py-2.5 font-medium text-gray-700">{nm.nama_mapel}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{nm.nilai_tugas}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{nm.nilai_kuis}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{nm.nilai_uts}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{nm.nilai_uas}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{nm.nilai_praktik}</td>
                        <td className={`px-3 py-2.5 text-center ${gradeColor(nm.nilai_akhir)}`}>
                          {nm.nilai_akhir}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${gradeBadge(nm.nilai_akhir)}`}>
                            {gradeLabel(nm.nilai_akhir)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {nm.sudah_dikonfirmasi ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              ✓ Terverifikasi
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              Belum
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────

export default function RekapNilaiFinalPage() {
  const [kelasList,     setKelasList]     = useState([]);
  const [mapelList,     setMapelList]     = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [tahun,         setTahun]         = useState("2024/2025");
  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [sudahCari,     setSudahCari]     = useState(false);
  const [detailSiswaId, setDetailSiswaId] = useState(null);
  const [filterKonfirmasi, setFilterKonfirmasi] = useState("semua"); // semua | terverifikasi | belum

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/api/academic/kelas"),
      axiosInstance.get("/api/academic/mapel"),
    ])
      .then(([kr, mr]) => {
        setKelasList(Array.isArray(kr.data) ? kr.data : (kr.data?.data || []));
        setMapelList(Array.isArray(mr.data) ? mr.data : (mr.data?.data || []));
      })
      .catch(() => toast.error("Gagal memuat data kelas/mapel"));
  }, []);

  const mapelFiltered = mapelList.filter(
    (m) => !selectedKelas || String(m.kelas_id) === String(selectedKelas)
  );

  const handleCari = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoading(true);
    setSudahCari(true);
    try {
      const params = new URLSearchParams({ kelas_id: selectedKelas, tahun_ajar: tahun });
      if (selectedMapel) params.append("mapel_id", selectedMapel);
      const res = await axiosInstance.get(`/api/academic/kepsek/rekap-nilai-final?${params}`);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data nilai final");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Kelompokkan rows per siswa
  const siswaMap = {};
  data.forEach((row) => {
    if (!siswaMap[row.siswa_id]) {
      siswaMap[row.siswa_id] = {
        siswa_id:          row.siswa_id,
        nisn:              row.nisn,
        nama_lengkap:      row.nama_lengkap,
        nama_kelas:        row.nama_kelas,
        mapel:             [],
        semua_dikonfirmasi: true,
      };
    }
    siswaMap[row.siswa_id].mapel.push(row);
    if (!row.sudah_dikonfirmasi) siswaMap[row.siswa_id].semua_dikonfirmasi = false;
  });

  Object.values(siswaMap).forEach((s) => {
    const total          = s.mapel.reduce((acc, m) => acc + Number(m.nilai_akhir), 0);
    s.rata_rata          = s.mapel.length ? Math.round((total / s.mapel.length) * 100) / 100 : 0;
    s.jumlah_mapel       = s.mapel.length;
    s.mapel_terverifikasi = s.mapel.filter((m) => m.sudah_dikonfirmasi).length;
  });

  let siswaList = Object.values(siswaMap);
  if (filterKonfirmasi === "terverifikasi") siswaList = siswaList.filter((s) =>  s.semua_dikonfirmasi);
  if (filterKonfirmasi === "belum")         siswaList = siswaList.filter((s) => !s.semua_dikonfirmasi);

  const allSiswa          = Object.values(siswaMap);
  const totalTerverifikasi = allSiswa.filter((s) => s.semua_dikonfirmasi).length;
  const namaKelas         = kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">REKAP NILAI FINAL SISWA</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Nilai final yang telah diinput Guru Mapel dan dikonfirmasi Wali Kelas
        </p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* ── Filter ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => { setSelectedKelas(e.target.value); setSelectedMapel(""); }}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Mata Pelajaran
              </label>
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Mapel</option>
                {mapelFiltered.map((m) => (
                  <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Tahun Ajar
              </label>
              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TAHUN_OPTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCari}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              Tampilkan
            </button>
          </div>
        </div>

        {/* ── Kartu Statistik (klik untuk filter) ────────────────────────────── */}
        {sudahCari && !loading && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                key:       "semua",
                label:     "Total Siswa",
                val:        allSiswa.length,
                valColor:  "text-gray-800",
                border:    "border-blue-500",
                bg:        "bg-blue-50",
                sub:       `Kelas ${namaKelas}`,
              },
              {
                key:       "terverifikasi",
                label:     "Sudah Diverifikasi",
                val:        totalTerverifikasi,
                valColor:  "text-green-600",
                border:    "border-green-500",
                bg:        "bg-green-50",
                sub:       "Semua mapel terkonfirmasi",
              },
              {
                key:       "belum",
                label:     "Belum Diverifikasi",
                val:        allSiswa.length - totalTerverifikasi,
                valColor:  "text-orange-500",
                border:    "border-orange-500",
                bg:        "bg-orange-50",
                sub:       "Menunggu konfirmasi Wali Kelas",
              },
            ].map(({ key, label, val, valColor, border, bg, sub }) => (
              <button
                key={key}
                onClick={() => setFilterKonfirmasi(key)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  filterKonfirmasi === key ? `${border} ${bg}` : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${valColor}`}>{val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>
        )}

        {/* ── Tabel Hasil ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Memuat data nilai…</p>
            </div>
          </div>
        ) : sudahCari ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {siswaList.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-500 font-medium">
                  {data.length === 0
                    ? "Belum ada nilai yang diinput untuk kelas ini."
                    : "Tidak ada siswa yang sesuai filter."}
                </p>
                {filterKonfirmasi !== "semua" && (
                  <button
                    onClick={() => setFilterKonfirmasi("semua")}
                    className="mt-3 text-sm text-blue-500 hover:underline"
                  >
                    Tampilkan semua siswa
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="px-5 py-3.5 border-b bg-gray-50 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-600">
                    {siswaList.length} siswa — {namaKelas} · {tahun}
                    {filterKonfirmasi !== "semua" && (
                      <span className="ml-2 text-xs text-gray-400">
                        (filter: {filterKonfirmasi === "terverifikasi" ? "terverifikasi" : "belum diverifikasi"})
                      </span>
                    )}
                  </p>
                  {filterKonfirmasi !== "semua" && (
                    <button
                      onClick={() => setFilterKonfirmasi("semua")}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Tampilkan semua
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="px-4 py-3 text-left w-8">No</th>
                        <th className="px-4 py-3 text-left">Nama Siswa</th>
                        <th className="px-3 py-3 text-left">NISN</th>
                        <th className="px-3 py-3 text-left">Kelas</th>
                        <th className="px-3 py-3 text-center">Jml Mapel</th>
                        <th className="px-3 py-3 text-center">Rata-rata</th>
                        <th className="px-3 py-3 text-center">Predikat</th>
                        <th className="px-3 py-3 text-center">Status Verifikasi</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siswaList.map((s, i) => (
                        <tr
                          key={s.siswa_id}
                          className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{s.nama_lengkap}</td>
                          <td className="px-3 py-3 text-gray-500 font-mono text-xs">{s.nisn}</td>
                          <td className="px-3 py-3 text-gray-600">{s.nama_kelas}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium">
                              {s.jumlah_mapel}
                            </span>
                          </td>
                          <td className={`px-3 py-3 text-center text-base ${gradeColor(s.rata_rata)}`}>
                            {s.rata_rata}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${gradeBadge(s.rata_rata)}`}>
                              {gradeLabel(s.rata_rata)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {s.semua_dikonfirmasi ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Terverifikasi
                              </span>
                            ) : (
                              <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full font-medium">
                                {s.mapel_terverifikasi}/{s.jumlah_mapel} mapel
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setDetailSiswaId(s.siswa_id)}
                              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🏫</div>
            <p className="text-gray-500">
              Pilih kelas dan klik <strong>Tampilkan</strong> untuk melihat rekap nilai final.
            </p>
          </div>
        )}
      </div>

      {/* Modal Detail Siswa */}
      {detailSiswaId && (
        <DetailSiswaModal
          siswaId={detailSiswaId}
          tahunAjar={tahun}
          onClose={() => setDetailSiswaId(null)}
        />
      )}
    </div>
  );
}