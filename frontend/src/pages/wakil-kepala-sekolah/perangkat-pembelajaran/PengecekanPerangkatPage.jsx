import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { academicApi } from "../../../api/academicApi";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  lengkap: "bg-green-100 text-green-700 border border-green-200",
  belum_lengkap: "bg-red-100 text-red-700 border border-red-200",
};

export default function PengecekanPerangkatPage() {
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await academicApi.getDaftarGuruPerangkat();
      setGuruList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data guru");
      setGuruList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = guruList.filter(g =>
    g.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
    g.nip?.includes(search) ||
    g.mata_pelajaran?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusLabel = (guru) => {
    const total = parseInt(guru.total_perangkat) || 0;
    const lengkap = parseInt(guru.perangkat_lengkap) || 0;
    if (total === 0) return { label: "Belum Ada Data", cls: "bg-gray-100 text-gray-500 border border-gray-200" };
    if (lengkap === total) return { label: "Lengkap", cls: STATUS_BADGE.lengkap };
    return { label: "Belum Lengkap", cls: STATUS_BADGE.belum_lengkap };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📋</span>
          <h1 className="text-2xl font-bold text-gray-800">Pengecekan Perangkat Pembelajaran</h1>
        </div>
        <p className="text-sm text-gray-500">
          Sistem Pengecekan Perangkat Pembelajaran — Daftar semua guru dengan status unggahan perangkat pembelajaran masing-masing.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Guru", value: guruList.length, color: "blue", icon: "👨‍🏫" },
          {
            label: "Sudah Lengkap",
            value: guruList.filter(g => parseInt(g.total_perangkat) > 0 && parseInt(g.perangkat_lengkap) === parseInt(g.total_perangkat)).length,
            color: "green", icon: "✅"
          },
          {
            label: "Belum Lengkap",
            value: guruList.filter(g => parseInt(g.total_perangkat) === 0 || parseInt(g.perangkat_belum_lengkap) > 0).length,
            color: "red", icon: "⏳"
          },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border border-${s.color}-100 p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className={`text-2xl font-bold text-${s.color}-600 mt-1`}>{s.value}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama guru, NIP, atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Daftar Guru</h2>
          <p className="text-xs text-gray-400 mt-0.5">Klik "Lihat Detail" untuk memeriksa perangkat tiap guru</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Memuat data guru...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-2">👨‍🏫</p>
            <p className="font-medium">{search ? "Tidak ada guru yang cocok" : "Belum ada data guru"}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Nama Guru</th>
                <th className="px-6 py-3 text-left">NIP</th>
                <th className="px-6 py-3 text-left">Mata Pelajaran</th>
                <th className="px-6 py-3 text-center">Total Perangkat</th>
                <th className="px-6 py-3 text-center">Status Unggahan</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((guru) => {
                const status = getStatusLabel(guru);
                return (
                  <tr key={guru.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-700 text-sm font-bold">{guru.nama_lengkap?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{guru.nama_lengkap}</p>
                          <p className="text-xs text-gray-400">{guru.jabatan || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{guru.nip || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{guru.mata_pelajaran || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-700 font-medium">
                        {guru.perangkat_lengkap || 0}/{guru.total_perangkat || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/wakil/perangkat/${guru.id}`)}
                        className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors shadow-sm"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {guruList.length} guru
          </div>
        )}
      </div>
    </div>
  );
}
