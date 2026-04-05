import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

const STATUS_COLOR = {
  hadir: "bg-green-100 text-green-700",
  sakit: "bg-blue-100 text-blue-700",
  izin: "bg-yellow-100 text-yellow-700",
  alpa: "bg-red-100 text-red-700",
  terlambat: "bg-orange-100 text-orange-700",
};

export default function RekapAbsensiSiswaPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(true);

  // ✅ FIX: Backend getAllKelas mengembalikan array langsung (result.rows),
  // bukan { data: [...] }. Handle kedua kemungkinan agar robust.
  useEffect(() => {
    setLoadingKelas(true);
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
      .catch(() => toast.error("Gagal memuat daftar kelas"))
      .finally(() => setLoadingKelas(false));
  }, []);

  // ✅ FIX: Gunakan endpoint kepsek yang sudah ada di backend
  // (/api/academic/kepsek/rekap-absensi-siswa) yang mengembalikan
  // rekap per-siswa lengkap dengan nama_kelas, total hadir/sakit/izin/alpa/terlambat.
  // Endpoint lama (/api/academic/absensi-siswa) adalah untuk guru mapel bukan kepsek.
  const handleCari = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedKelas) params.append("kelas_id", selectedKelas);
      if (tanggal) params.append("tanggal", tanggal);

      const res = await axiosInstance.get(
        `/api/academic/kepsek/rekap-absensi-siswa?${params}`
      );
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data absensi siswa");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Hitung total statistik dari data rekap
  const stats = data.reduce(
    (a, r) => {
      a.total++;
      a.hadir += Number(r.hadir) || 0;
      a.sakit += Number(r.sakit) || 0;
      a.izin += Number(r.izin) || 0;
      a.alpa += Number(r.alpa) || 0;
      a.terlambat += Number(r.terlambat) || 0;
      return a;
    },
    { total: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0, terlambat: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">REKAP ABSENSI SISWA</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor kehadiran seluruh siswa</p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
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
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleCari}
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
          </div>
        </div>

        {/* Hasil */}
        {data.length > 0 && (
          <>
            {/* Kartu statistik */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { l: "Hadir", v: stats.hadir, c: "text-green-600", b: "border-green-400" },
                { l: "Sakit", v: stats.sakit, c: "text-blue-600", b: "border-blue-400" },
                { l: "Izin", v: stats.izin, c: "text-yellow-500", b: "border-yellow-400" },
                { l: "Alpa", v: stats.alpa, c: "text-red-500", b: "border-red-400" },
                { l: "Terlambat", v: stats.terlambat, c: "text-orange-500", b: "border-orange-400" },
              ].map(({ l, v, c, b }) => (
                <div
                  key={l}
                  className={`bg-white rounded-xl p-4 text-center shadow-sm border-b-4 ${b}`}
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    {l}
                  </p>
                  <p className={`text-3xl font-bold ${c}`}>{v}</p>
                </div>
              ))}
            </div>

            {/* Tabel rekap per siswa */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">
                  Rekap Absensi Siswa{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    ({data.length} siswa)
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tanggal: {tanggal || "Semua"}{" "}
                  {selectedKelas
                    ? `— Kelas: ${kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || selectedKelas}`
                    : "— Semua Kelas"}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">No</th>
                      <th className="px-4 py-3 text-left">Nama Siswa</th>
                      <th className="px-4 py-3 text-left">NISN</th>
                      <th className="px-4 py-3 text-left">Kelas</th>
                      <th className="px-4 py-3 text-center text-green-600">Hadir</th>
                      <th className="px-4 py-3 text-center text-blue-600">Sakit</th>
                      <th className="px-4 py-3 text-center text-yellow-500">Izin</th>
                      <th className="px-4 py-3 text-center text-red-500">Alpa</th>
                      <th className="px-4 py-3 text-center text-orange-500">Terlambat</th>
                      <th className="px-4 py-3 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map((d, i) => (
                      <tr key={d.siswa_id || i} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {d.nama_lengkap}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                          {d.nisn || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.nama_kelas}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR.hadir}`}>
                            {d.hadir || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR.sakit}`}>
                            {d.sakit || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR.izin}`}>
                            {d.izin || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR.alpa}`}>
                            {d.alpa || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR.terlambat}`}>
                            {d.terlambat || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                            {Number(d.total) || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty state setelah pencarian */}
        {!loading && data.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-16 text-center text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="font-medium">Klik "Cari" untuk menampilkan rekap absensi</p>
            <p className="text-xs mt-1">Pilih kelas dan tanggal, lalu klik Cari</p>
          </div>
        )}
      </div>
    </div>
  );
}