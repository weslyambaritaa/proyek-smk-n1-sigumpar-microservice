import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getAbsensiGuru } from "../../api/learningApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const BASE_URL = import.meta.env.VITE_LEARNING_URL || "";

function getTodayJakartaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getFullFotoUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith("data:") || foto.startsWith("http")) return foto;
  return `${BASE_URL}${foto}`;
}

function formatDate(value) {
  if (!value) return "-";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Date(value).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatTime(value) {
  if (!value) return "-";

  return `${new Date(value).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  })} WIB`;
}

function normalizeAbsensiGuruRow(row) {
  return {
    ...row,
    id: row.id || row.id_absensiGuru || row.id_absensi_guru,
    namaGuru:
      row.namaGuru || row.nama_guru || row.nama || row.nama_lengkap || "-",
    mataPelajaran:
      row.mataPelajaran ||
      row.mata_pelajaran ||
      row.mapel ||
      row.nama_mapel ||
      "-",
    jamMasuk: row.jamMasuk || row.jam_masuk || row.jam_masuk_guru || null,
    tanggal: row.tanggal || null,
    status: row.status || "-",
    keterangan: row.keterangan || "-",
    foto:
      row.foto || row.foto_url || row.fotoAbsensi || row.foto_absensi || null,
  };
}

const STATUS_COLOR = {
  hadir: "bg-green-100 text-green-700 border-green-200",
  terlambat: "bg-yellow-100 text-yellow-700 border-yellow-200",
  izin: "bg-blue-100 text-blue-700 border-blue-200",
  sakit: "bg-orange-100 text-orange-700 border-orange-200",
  alpa: "bg-red-100 text-red-700 border-red-200",
};

export default function WakakurAbsensiGuruPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(getTodayJakartaDate());
  const [searchGuru, setSearchGuru] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMapel, setFilterMapel] = useState("");
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewName, setPreviewName] = useState("");

  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);

  const loadData = async () => {
    setLoading(true);

    try {
      const params = {};
      if (tanggal) params.tanggal = tanggal;

      const res = await getAbsensiGuru(params);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const mappedData = data.map(normalizeAbsensiGuruRow);

      setRows(mappedData);
      setPage(1);
    } catch (err) {
      console.error(
        "Gagal memuat data absensi guru:",
        err.response?.data || err,
      );
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal memuat data absensi guru",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tanggal]);

  const stats = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          const status = String(row.status || "").toLowerCase();

          acc.total += 1;
          if (status) {
            acc[status] = (acc[status] || 0) + 1;
          }

          return acc;
        },
        { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 },
      ),
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const namaGuru = String(row.namaGuru || "").toLowerCase();
      const mataPelajaran = String(row.mataPelajaran || "").toLowerCase();
      const status = String(row.status || "").toLowerCase();

      if (searchGuru && !namaGuru.includes(searchGuru.toLowerCase())) {
        return false;
      }

      if (filterStatus && status !== filterStatus) {
        return false;
      }

      if (filterMapel && !mataPelajaran.includes(filterMapel.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [rows, searchGuru, filterStatus, filterMapel]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePreviewFoto = (foto, namaGuru) => {
    const url = getFullFotoUrl(foto);

    if (!url) {
      toast("Tidak ada foto bukti untuk absensi ini");
      return;
    }

    setPreviewSrc(url);
    setPreviewName(`Foto Bukti — ${namaGuru || "Guru"}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewName}
          onClose={() => {
            setPreviewSrc(null);
            setPreviewName("");
          }}
        />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">
          MONITORING ABSENSI GURU
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Rekap kehadiran guru mapel — termasuk foto bukti absensi
        </p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            {
              l: "Total",
              v: stats.total,
              c: "text-gray-800",
              cls: "bg-white border",
            },
            {
              l: "Hadir",
              v: stats.hadir,
              c: "text-green-700",
              cls: "bg-green-50 border border-green-200",
            },
            {
              l: "Terlambat",
              v: stats.terlambat,
              c: "text-yellow-700",
              cls: "bg-yellow-50 border border-yellow-200",
            },
            {
              l: "Izin",
              v: stats.izin,
              c: "text-blue-700",
              cls: "bg-blue-50 border border-blue-200",
            },
            {
              l: "Sakit",
              v: stats.sakit,
              c: "text-orange-700",
              cls: "bg-orange-50 border border-orange-200",
            },
            {
              l: "Alpa",
              v: stats.alpa,
              c: "text-red-700",
              cls: "bg-red-50 border border-red-200",
            },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-3 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{l}</p>
              <p className={`text-2xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Filter Absensi
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Nama Guru
              </label>
              <input
                type="text"
                value={searchGuru}
                onChange={(e) => setSearchGuru(e.target.value)}
                placeholder="Cari nama guru..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Mata Pelajaran
              </label>
              <input
                type="text"
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                placeholder="Cari mapel..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="terlambat">Terlambat</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpa">Alpa</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl"
              >
                {loading ? "..." : "↻ Muat"}
              </button>

              <button
                onClick={() => {
                  setTanggal(getTodayJakartaDate());
                  setSearchGuru("");
                  setFilterStatus("");
                  setFilterMapel("");
                }}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Data Kehadiran Guru
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({filtered.length} data · halaman {page}/{totalPages || 1})
              </span>
            </h2>

            <p className="text-xs text-gray-400">
              * Klik "Foto Bukti" untuk preview foto absensi
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data absensi...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>Belum ada data absensi untuk filter ini</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left w-8">No</th>
                      <th className="px-4 py-3 text-left">Nama Guru</th>
                      <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jam Masuk</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-left">Keterangan</th>
                      <th className="px-4 py-3 text-center">Foto Bukti</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {paginated.map((row, index) => {
                      const statusKey = String(row.status || "").toLowerCase();

                      return (
                        <tr
                          key={
                            row.id || `${row.namaGuru}-${row.tanggal}-${index}`
                          }
                          className="hover:bg-gray-50/70"
                        >
                          <td className="px-4 py-3 text-gray-400">
                            {(page - 1) * PAGE_SIZE + index + 1}
                          </td>

                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {row.namaGuru || "-"}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {row.mataPelajaran || "-"}
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(row.tanggal)}
                          </td>

                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                            {formatTime(row.jamMasuk)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                                STATUS_COLOR[statusKey] ||
                                "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {row.status || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                            {row.keterangan || "-"}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {row.foto ? (
                              <button
                                onClick={() =>
                                  handlePreviewFoto(row.foto, row.namaGuru)
                                }
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1 mx-auto"
                              >
                                📷 Foto Bukti
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300 font-medium">
                                Tidak ada foto
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Menampilkan {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)} dari{" "}
                    {filtered.length} data
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, k) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 2, totalPages - 4),
                      );
                      const p = start + k;

                      if (p > totalPages) return null;

                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            p === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
