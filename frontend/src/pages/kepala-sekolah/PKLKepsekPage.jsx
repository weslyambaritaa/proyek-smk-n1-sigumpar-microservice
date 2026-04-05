import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

// ✅ Helper resolve URL foto (konsisten dengan LokasiPKLPage)
function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  const base = axiosInstance.defaults.baseURL || "";
  return base ? `${base}${foto_url}` : foto_url;
}

function formatTanggal(tanggal) {
  if (!tanggal) return "—";
  try {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return tanggal;
  }
}

export default function PKLKepsekPage() {
  // ✅ FIX: Gunakan data real dari API, bukan dummy/hardcoded
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [lokasiData, setLokasiData] = useState([]);
  const [progresData, setProgresData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [activeTab, setActiveTab] = useState("lokasi"); // "lokasi" | "progres"

  // ✅ FIX: Ambil kelas via vocational proxy (/api/vocational/kelas)
  // yang sudah tersedia untuk semua role terautentikasi.
  // Alternatif: /api/academic/kelas (sama-sama bisa diakses)
  useEffect(() => {
    setLoadingKelas(true);
    axiosInstance
      .get("/api/vocational/kelas")
      .then((r) => {
        const list = Array.isArray(r.data?.data)
          ? r.data.data
          : Array.isArray(r.data)
          ? r.data
          : [];
        setKelasList(list);
      })
      .catch(() => {
        // Fallback: coba endpoint academic langsung
        axiosInstance
          .get("/api/academic/kelas")
          .then((r) => {
            const list = Array.isArray(r.data)
              ? r.data
              : Array.isArray(r.data?.data)
              ? r.data.data
              : [];
            setKelasList(list);
          })
          .catch(() => toast.error("Gagal memuat daftar kelas"));
      })
      .finally(() => setLoadingKelas(false));
  }, []);

  const handleCari = async () => {
    setLoading(true);
    try {
      // Ambil semua data lokasi PKL & progres PKL secara paralel
      const [lokasiRes, progresRes] = await Promise.all([
        axiosInstance.get("/api/vocational/pkl/lokasi"),
        axiosInstance.get("/api/vocational/pkl/progres"),
      ]);

      let lokasi = Array.isArray(lokasiRes.data?.data)
        ? lokasiRes.data.data
        : [];
      let progres = Array.isArray(progresRes.data?.data)
        ? progresRes.data.data
        : [];

      // Filter berdasarkan kelas yang dipilih (jika ada)
      if (selectedKelas) {
        lokasi = lokasi.filter(
          (d) => String(d.kelas_id) === String(selectedKelas)
        );
        // progres tidak punya kelas_id langsung, filter via siswa_id yang cocok
        const siswaIds = new Set(lokasi.map((d) => String(d.siswa_id)));
        progres = progres.filter((p) => siswaIds.has(String(p.siswa_id)));
      }

      setLokasiData(lokasi);
      setProgresData(progres);
    } catch {
      toast.error("Gagal memuat data PKL");
      setLokasiData([]);
      setProgresData([]);
    } finally {
      setLoading(false);
    }
  };

  // Hitung progres per siswa (jumlah minggu laporan)
  const progresPerSiswa = progresData.reduce((acc, p) => {
    const key = String(p.siswa_id);
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {});

  // Gabungkan data lokasi dengan info progres
  const enrichedData = lokasiData.map((d) => ({
    ...d,
    minggu_progres: progresPerSiswa[String(d.siswa_id)] || 0,
  }));

  const stats = {
    total: enrichedData.length,
    sudahLaporan: enrichedData.filter((d) => d.minggu_progres > 0).length,
    belumLaporan: enrichedData.filter((d) => d.minggu_progres === 0).length,
  };

  const namaKelasSelected = kelasList.find(
    (k) => String(k.id) === String(selectedKelas)
  )?.nama_kelas;

  return (
    <div className="min-h-screen bg-gray-100">
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName="Foto Lokasi PKL"
          onClose={() => setPreviewSrc(null)}
        />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">MONITORING PKL</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Monitor progres dan laporan Praktik Kerja Lapangan siswa
        </p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas (Opsional)
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                disabled={loadingKelas}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="">-- Semua Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCari}
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {loading ? "Memuat..." : "Cari"}
            </button>
          </div>
        </div>

        {/* Hasil */}
        {enrichedData.length > 0 && (
          <>
            {/* Statistik */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  Total Siswa PKL
                </p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                {namaKelasSelected && (
                  <p className="text-xs text-gray-400 mt-1">{namaKelasSelected}</p>
                )}
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center shadow-sm border border-green-200 border-b-4 border-b-green-400">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  Sudah Laporan
                </p>
                <p className="text-3xl font-bold text-green-600">{stats.sudahLaporan}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center shadow-sm border border-red-200 border-b-4 border-b-red-400">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  Belum Laporan
                </p>
                <p className="text-3xl font-bold text-red-500">{stats.belumLaporan}</p>
              </div>
            </div>

            {/* Tab navigasi */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("lokasi")}
                className={`px-5 py-2 text-sm font-bold rounded-xl transition-colors ${
                  activeTab === "lokasi"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                🏭 Lokasi PKL
              </button>
              <button
                onClick={() => setActiveTab("progres")}
                className={`px-5 py-2 text-sm font-bold rounded-xl transition-colors ${
                  activeTab === "progres"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                📋 Laporan Progres
              </button>
            </div>

            {/* Tab: Lokasi PKL */}
            {activeTab === "lokasi" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">
                    Data Lokasi PKL Siswa
                    <span className="text-gray-400 font-normal text-sm ml-2">
                      ({enrichedData.length} data)
                    </span>
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Foto</th>
                        <th className="px-4 py-3 text-left">Nama Siswa</th>
                        <th className="px-4 py-3 text-left">Perusahaan / Instansi</th>
                        <th className="px-4 py-3 text-left">Posisi</th>
                        <th className="px-4 py-3 text-left">Alamat</th>
                        <th className="px-4 py-3 text-center">Progres Minggu</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-left">Tgl Mulai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {enrichedData.map((d, i) => (
                        <tr key={d.id || i} className="hover:bg-gray-50/70">
                          <td className="px-4 py-3 text-gray-400">{i + 1}</td>

                          {/* Foto */}
                          <td className="px-4 py-3">
                            {d.foto_url ? (
                              <img
                                src={getFullFotoUrl(d.foto_url)}
                                alt="Foto PKL"
                                onClick={() =>
                                  setPreviewSrc(getFullFotoUrl(d.foto_url))
                                }
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                                title="Klik untuk lihat foto"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.parentNode.innerHTML =
                                    '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg">📷</div>';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg">
                                📷
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {d.nama_siswa || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium">
                            {d.nama_perusahaan || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {d.posisi ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                {d.posisi}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">
                            {d.alamat || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {d.minggu_progres > 0 ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-xs">
                                Minggu {d.minggu_progres}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                d.minggu_progres > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {d.minggu_progres > 0 ? "Sudah" : "Belum"} Laporan
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatTanggal(d.tanggal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Progres PKL */}
            {activeTab === "progres" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">
                    Laporan Progres PKL
                    <span className="text-gray-400 font-normal text-sm ml-2">
                      ({progresData.length} laporan)
                    </span>
                  </h2>
                </div>
                {progresData.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">📋</p>
                    <p>Belum ada laporan progres</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">No</th>
                          <th className="px-4 py-3 text-center">Minggu Ke</th>
                          <th className="px-4 py-3 text-left">Siswa ID</th>
                          <th className="px-4 py-3 text-left">Deskripsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {progresData.map((p, i) => (
                          <tr key={p.id || i} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-xs">
                                Minggu {p.minggu_ke}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-[120px]">
                              {p.siswa_id}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs max-w-[300px]">
                              {p.deskripsi || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && enrichedData.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-16 text-center text-gray-400">
            <p className="text-4xl mb-2">🏭</p>
            <p className="font-medium">Klik "Cari" untuk menampilkan data PKL</p>
            <p className="text-xs mt-1">Pilih kelas atau biarkan kosong untuk semua kelas</p>
          </div>
        )}
      </div>
    </div>
  );
}