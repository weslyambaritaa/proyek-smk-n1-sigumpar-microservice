import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { getAbsensiGuru } from "../../api/learningApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const STATUS_COLOR = {
  hadir: "bg-green-500 text-white",
  terlambat: "bg-yellow-400 text-white",
  izin: "bg-blue-500 text-white",
  sakit: "bg-orange-400 text-white",
  alpa: "bg-red-500 text-white",
};

const formatDate = (value) => {
  if (!value) return "-";
  return String(value).slice(0, 10);
};

const formatTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RekapAbsensiGuruPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modeFilter, setModeFilter] = useState("harian");
  const [tanggal, setTanggal] = useState(today);
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalAkhir, setTanggalAkhir] = useState(today);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [previewImg, setPreviewImg] = useState(null);

  const buildParams = () => {
    const params = {};

    if (modeFilter === "harian") {
      if (tanggal) params.tanggal = tanggal;
    }

    if (modeFilter === "range") {
      if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
      if (tanggalAkhir) params.tanggal_akhir = tanggalAkhir;
    }

    if (status) params.status = status;

    return params;
  };

  const loadData = async () => {
    setLoading(true);

    try {
      const res = await getAbsensiGuru(buildParams());
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(
        "Gagal memuat rekap absensi guru:",
        err.response?.data || err,
      );
      toast.error(
        err.response?.data?.message || "Gagal memuat data absensi guru",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modeFilter, tanggal, tanggalMulai, tanggalAkhir, status]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return rows.filter((row) => {
      const nama = row.namaGuru || row.nama_guru || "";
      return nama.toLowerCase().includes(keyword);
    });
  }, [rows, search]);

  const stats = useMemo(() => {
    return filtered.reduce(
      (acc, row) => {
        acc.total += 1;
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        hadir: 0,
        terlambat: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
      },
    );
  }, [filtered]);

  const exportExcel = () => {
    if (filtered.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const data = filtered.map((row, index) => ({
      No: index + 1,
      "Nama Guru": row.namaGuru || row.nama_guru || "-",
      "Mata Pelajaran": row.mataPelajaran || row.mata_pelajaran || "-",
      Tanggal: formatDate(row.tanggal),
      "Jam Masuk": formatTime(row.jamMasuk || row.jam_masuk),
      Status: row.status || "-",
      Keterangan: row.keterangan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi Guru");

    const periode =
      modeFilter === "harian" ? tanggal : `${tanggalMulai}_sd_${tanggalAkhir}`;

    XLSX.writeFile(workbook, `rekap-absensi-guru-${periode}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {previewImg && (
        <ImagePreviewModal
          src={previewImg}
          fileName="Foto Absensi Guru"
          onClose={() => setPreviewImg(null)}
        />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">REKAP ABSENSI GURU</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Kepala sekolah dapat melihat rekap absensi guru per hari atau
          berdasarkan range waktu.
        </p>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            {
              label: "Total",
              value: stats.total,
              className: "bg-white border text-gray-800",
            },
            {
              label: "Hadir",
              value: stats.hadir,
              className: "bg-green-50 border border-green-200 text-green-700",
            },
            {
              label: "Terlambat",
              value: stats.terlambat,
              className:
                "bg-yellow-50 border border-yellow-200 text-yellow-700",
            },
            {
              label: "Izin",
              value: stats.izin,
              className: "bg-blue-50 border border-blue-200 text-blue-700",
            },
            {
              label: "Sakit",
              value: stats.sakit,
              className:
                "bg-orange-50 border border-orange-200 text-orange-700",
            },
            {
              label: "Alpa",
              value: stats.alpa,
              className: "bg-red-50 border border-red-200 text-red-700",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl p-3 text-center ${item.className}`}
            >
              <p className="text-xs font-semibold opacity-70 mb-1">
                {item.label}
              </p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Mode Filter
              </label>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="harian">Per Hari</option>
                <option value="range">Range Tanggal</option>
              </select>
            </div>

            {modeFilter === "harian" ? (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Semua</option>
                <option value="hadir">Hadir</option>
                <option value="terlambat">Terlambat</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpa">Alpa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Cari Nama Guru
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari guru..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                {loading ? "..." : "Refresh"}
              </button>

              <button
                onClick={exportExcel}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Data Kehadiran Guru</h2>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">No</th>
                    <th className="px-5 py-3 text-left">Foto</th>
                    <th className="px-5 py-3 text-left">Nama Guru</th>
                    <th className="px-5 py-3 text-left">Tanggal</th>
                    <th className="px-5 py-3 text-left">Jam Masuk</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Keterangan</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-gray-400"
                      >
                        <p className="text-3xl mb-2">📋</p>
                        <p>Belum ada data absensi</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row, index) => (
                      <tr
                        key={row.id_absensiGuru || row.id || index}
                        className="hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-3 text-gray-400">{index + 1}</td>

                        <td className="px-5 py-3">
                          {row.foto ? (
                            <img
                              src={row.foto}
                              alt="Foto Absensi"
                              onClick={() => setPreviewImg(row.foto)}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                              📷
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3 font-semibold text-gray-800">
                          {row.namaGuru || row.nama_guru || "-"}
                        </td>

                        <td className="px-5 py-3 text-gray-500">
                          {formatDate(row.tanggal)}
                        </td>

                        <td className="px-5 py-3 text-gray-500">
                          {formatTime(row.jamMasuk || row.jam_masuk)} WIB
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              STATUS_COLOR[row.status] ||
                              "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {row.status || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                          {row.keterangan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
