import { useState, useEffect } from "react";
import { academicApi } from "../../api/academicApi";

export default function KurikulumPage() {
  const [kelas, setKelas] = useState([]);
  const [mapel, setMapel] = useState([]);
  const [jadwal, setJadwal] = useState([]);

  useEffect(() => {
    Promise.all([
      academicApi.getAllKelas(),
      academicApi.getAllMapel(),
      academicApi.getAllJadwal(),
    ]).then(([kr, mr, jr]) => {
      setKelas(Array.isArray(kr.data) ? kr.data : (kr.data?.data || []));
      setMapel(Array.isArray(mr.data) ? mr.data : (mr.data?.data || []));
      setJadwal(Array.isArray(jr.data) ? jr.data : (jr.data?.data || []));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">KURIKULUM</h1>
        <p className="text-sm text-gray-500 mt-0.5">Rekap data kurikulum — kelas, mata pelajaran, dan jadwal mengajar</p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-6">
        {/* Statistik */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Kelas",         val: kelas.length,  icon: "🏫", cls: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Mata Pelajaran",       val: mapel.length,  icon: "📚", cls: "bg-green-50 border-green-200 text-green-700" },
            { label: "Jadwal Mengajar",      val: jadwal.length, icon: "📅", cls: "bg-purple-50 border-purple-200 text-purple-700" },
          ].map(({ label, val, icon, cls }) => (
            <div key={label} className={`rounded-2xl border p-6 text-center ${cls}`}>
              <div className="text-4xl mb-2">{icon}</div>
              <p className="text-3xl font-bold">{val}</p>
              <p className="text-sm font-semibold mt-1 opacity-80">{label}</p>
            </div>
          ))}
        </div>

        {/* Daftar Kelas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Daftar Kelas</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">No</th>
                <th className="px-5 py-3 text-left">Nama Kelas</th>
                <th className="px-5 py-3 text-left">Tingkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kelas.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Belum ada data kelas</td></tr>
              ) : kelas.map((k, i) => (
                <tr key={k.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{k.nama_kelas}</td>
                  <td className="px-5 py-3 text-gray-500">Kelas {k.tingkat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Daftar Mata Pelajaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Daftar Mata Pelajaran</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">No</th>
                <th className="px-5 py-3 text-left">Nama Mapel</th>
                <th className="px-5 py-3 text-left">Kelas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mapel.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Belum ada data mata pelajaran</td></tr>
              ) : mapel.map((m, i) => {
                const k = kelas.find(kl => kl.id === m.kelas_id);
                return (
                  <tr key={m.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{m.nama_mapel}</td>
                    <td className="px-5 py-3 text-gray-500">{k?.nama_kelas || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
