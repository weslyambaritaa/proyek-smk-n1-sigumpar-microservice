import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";
import axiosInstance from "../../api/axiosInstance";

export default function RekapKehadiranPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    academicApi
      .getAllKelas()
      .then((r) =>
        setKelasList(
          Array.isArray(r.data?.data)
            ? r.data.data
            : Array.isArray(r.data)
              ? r.data
              : [],
        ),
      )
      .catch(() => {});
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    setLoading(true);
    try {
      const res = await studentApi.getRekapKehadiran({
        kelas_id: selectedKelas,
      });
      const raw = Array.isArray(res.data?.data) ? res.data.data : [];
      const filtered = bulan
        ? raw.filter((a) => a.tanggal?.startsWith(bulan))
        : raw;
      // Group by siswa
      const map = {};
      filtered.forEach((a) => {
        if (!map[a.siswa_id])
          map[a.siswa_id] = {
            nama: a.nama_lengkap,
            nisn: a.nisn,
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpa: 0,
            terlambat: 0,
          };
        if (map[a.siswa_id][a.status] !== undefined)
          map[a.siswa_id][a.status]++;
      });
      setData(Object.values(map));
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">REKAP KEHADIRAN</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Rekap kehadiran siswa per bulan
        </p>
      </div>
      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Bulan
              </label>
              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCari}
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl"
            >
              {loading ? "..." : "Cari"}
            </button>
          </div>
        </div>
        {data.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Rekap Kehadiran Siswa</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Nama Siswa</th>
                  <th className="px-4 py-3 text-center">Hadir</th>
                  <th className="px-4 py-3 text-center">Sakit</th>
                  <th className="px-4 py-3 text-center">Izin</th>
                  <th className="px-4 py-3 text-center">Alpa</th>
                  <th className="px-4 py-3 text-center">Terlambat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {d.nama}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-bold text-xs">
                        {d.hadir}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-xs">
                        {d.sakit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold text-xs">
                        {d.izin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold text-xs">
                        {d.alpa}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-bold text-xs">
                        {d.terlambat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
