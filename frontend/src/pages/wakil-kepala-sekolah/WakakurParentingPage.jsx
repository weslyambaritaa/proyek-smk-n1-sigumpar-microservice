import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { academicApi } from "../../api/academicApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

// Helper: bangun URL lengkap untuk foto dari academic-service
// foto_url dari DB: "/api/academic/uploads/xxx.jpg"
// Di dev: Vite proxy /api → gateway, path relatif sudah cukup
// Di prod: gabungkan baseURL axiosInstance
function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  const base = axiosInstance.defaults.baseURL || "";
  return base ? `${base}${foto_url}` : foto_url;
}

export default function WakakurParentingPage() {
  const [kelasList, setKelasList] = useState([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewName, setPreviewName] = useState("");

  useEffect(() => {
    academicApi
      .getAllKelas()
      .then((r) =>
        setKelasList(Array.isArray(r.data) ? r.data : r.data?.data || []),
      )
      .catch(() => {});
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.get("/api/student/parenting", {
        params: filterKelas ? { kelas_id: filterKelas } : {},
      });

      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data parenting");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [filterKelas]);

  const filtered = useMemo(
    () =>
      search
        ? rows.filter(
            (r) =>
              (r.agenda || "").toLowerCase().includes(search.toLowerCase()) ||
              (r.ringkasan || "").toLowerCase().includes(search.toLowerCase()),
          )
        : rows,
    [rows, search],
  );

  const stats = useMemo(
    () => ({
      total: rows.length,
      denganFoto: rows.filter((r) => r.foto_url).length,
      totalOrtu: rows.reduce((a, r) => a + (Number(r.kehadiran_ortu) || 0), 0),
    }),
    [rows],
  );

  const namaKelas = (id) =>
    kelasList.find((k) => String(k.id) === String(id))?.nama_kelas ||
    `Kelas #${id}`;

  // getFullFotoUrl dipanggil agar URL selalu benar baik dev maupun prod
  const handlePreviewFoto = (foto_url, nama) => {
    const full = getFullFotoUrl(foto_url);
    if (!full) return;
    setPreviewSrc(full);
    setPreviewName(nama || "Dokumentasi Parenting");
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

      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">
          MONITORING PARENTING
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Lihat laporan kegiatan parenting per kelas{" "}
          <span className="italic">(read-only untuk Wakil Kepala Sekolah)</span>
        </p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Info Banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
          <span className="text-blue-400 text-xl mt-0.5">ℹ️</span>
          <p className="text-sm text-blue-700">
            Modul Parenting dikelola oleh Wali Kelas. Wakil Kepala Sekolah dapat
            memantau laporan dan dokumentasi foto seluruh kelas di sini.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              l: "Total Pertemuan",
              v: stats.total,
              c: "text-gray-800",
              cls: "bg-white border",
            },
            {
              l: "Ada Dokumentasi",
              v: stats.denganFoto,
              c: "text-blue-700",
              cls: "bg-blue-50 border border-blue-200",
            },
            {
              l: "Total Orang Tua",
              v: stats.totalOrtu,
              c: "text-green-700",
              cls: "bg-green-50 border border-green-200",
            },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{l}</p>
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Filter Kelas
              </label>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Cari Agenda / Ringkasan
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari agenda..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl"
            >
              {loading ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* Tabel Laporan Parenting */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Histori Parenting
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({filtered.length} laporan)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">👨‍👩‍👧</p>
              <p>Belum ada laporan parenting</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left w-8">No</th>
                  {/* Kolom Foto — thumbnail klik seperti AbsensiGuru */}
                  <th className="px-5 py-3 text-left w-20">Foto</th>
                  <th className="px-5 py-3 text-left">Kelas & Tanggal</th>
                  <th className="px-5 py-3 text-left">Agenda</th>
                  <th className="px-5 py-3 text-left">Kehadiran</th>
                  <th className="px-5 py-3 text-left">Ringkasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((row, i) => (
                  <tr
                    key={row.id || i}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                    </td>

                    {/* Foto thumbnail — gunakan getFullFotoUrl agar URL selalu benar */}
                    <td className="px-5 py-3">
                      {row.foto_url ? (
                        <img
                          src={getFullFotoUrl(row.foto_url)}
                          alt="Dokumentasi Parenting"
                          onClick={() =>
                            handlePreviewFoto(
                              row.foto_url,
                              `Parenting — ${namaKelas(row.kelas_id)} · ${row.tanggal}`,
                            )
                          }
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                          title="Klik untuk lihat foto"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML =
                              '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg" title="Foto tidak ditemukan">📷</div>';
                          }}
                        />
                      ) : (
                        <div
                          className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg"
                          title="Tidak ada foto"
                        >
                          📷
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded block w-fit mb-1">
                        {namaKelas(row.kelas_id)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {row.tanggal || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      {row.agenda && (
                        <p className="text-sm font-semibold text-gray-800">
                          📌 {row.agenda}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      {row.kehadiran_ortu > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                          👥 {row.kehadiran_ortu} orang tua
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                        {row.ringkasan || "—"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
