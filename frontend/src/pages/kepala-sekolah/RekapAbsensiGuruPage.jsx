import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getAbsensiGuru } from "../../api/learningApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const STATUS_COLOR = {
  hadir: "bg-green-500 text-white",
  terlambat: "bg-yellow-400 text-white",
  izin: "bg-blue-500 text-white",
  sakit: "bg-orange-400 text-white",
  alpa: "bg-red-500 text-white",
};

export default function RekapAbsensiGuruPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");

  // ✅ FIX: Tambah state untuk ImagePreviewModal foto (sama seperti AbsensiGuruPage)
  const [previewImg, setPreviewImg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAbsensiGuru(tanggal ? { tanggal } : {});
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data absensi guru");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tanggal]);

  const filtered = useMemo(
    () =>
      search
        ? rows.filter((r) =>
            r.namaGuru?.toLowerCase().includes(search.toLowerCase())
          )
        : rows,
    [rows, search]
  );

  const stats = useMemo(
    () =>
      rows.reduce(
        (a, r) => {
          a.total++;
          a[r.status] = (a[r.status] || 0) + 1;
          return a;
        },
        { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 }
      ),
    [rows]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ FIX: ImagePreviewModal untuk foto absensi guru */}
      {previewImg && (
        <ImagePreviewModal
          src={previewImg}
          fileName="Foto Absensi Guru"
          onClose={() => setPreviewImg(null)}
        />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">REKAP ABSENSI GURU</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor kehadiran seluruh guru</p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Statistik */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { l: "Total", v: stats.total, c: "text-gray-800", cls: "bg-white border" },
            { l: "Hadir", v: stats.hadir, c: "text-green-700", cls: "bg-green-50 border border-green-200" },
            { l: "Terlambat", v: stats.terlambat, c: "text-yellow-700", cls: "bg-yellow-50 border border-yellow-200" },
            { l: "Izin", v: stats.izin, c: "text-blue-700", cls: "bg-blue-50 border border-blue-200" },
            { l: "Sakit", v: stats.sakit, c: "text-orange-700", cls: "bg-orange-50 border border-orange-200" },
            { l: "Alpa", v: stats.alpa, c: "text-red-700", cls: "bg-red-50 border border-red-200" },
          ].map(({ l, v, c, cls }) => (
            <div key={l} className={`rounded-xl p-3 text-center ${cls}`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{l}</p>
              <p className={`text-2xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Data Kehadiran Guru</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama guru..."
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
              />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={loadData}
                disabled={loading}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                {loading ? "..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* ✅ FIX: Tambah kolom "Foto" di header tabel */}
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
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <p className="text-3xl mb-2">📋</p>
                        <p>Belum ada data absensi</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr key={r.id_absensiGuru || i} className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>

                        {/* ✅ FIX: Kolom foto dengan thumbnail klik-untuk-preview */}
                        <td className="px-5 py-3">
                          {r.foto ? (
                            <img
                              src={r.foto}
                              alt="Foto Absensi"
                              onClick={() => setPreviewImg(r.foto)}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                              title="Klik untuk lihat foto"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentNode.innerHTML =
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

                        <td className="px-5 py-3 font-semibold text-gray-800">
                          {r.namaGuru}
                        </td>
                        <td className="px-5 py-3 text-gray-500">{r.tanggal}</td>
                        <td className="px-5 py-3 text-gray-500">
                          {r.jamMasuk
                            ? new Date(r.jamMasuk).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) + " WIB"
                            : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              STATUS_COLOR[r.status] || "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                          {r.keterangan || "—"}
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