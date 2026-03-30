import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { learningApi } from "../../../api/learningApi";
import toast from "react-hot-toast";

export default function DaftarGuruPage() {
  const navigate = useNavigate();
  const [daftarGuru, setDaftarGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDaftarGuru();
  }, []);

  const fetchDaftarGuru = async () => {
    try {
      setLoading(true);
      const res = await learningApi.getDaftarGuru();
      setDaftarGuru(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat daftar guru");
    } finally {
      setLoading(false);
    }
  };

  const filtered = daftarGuru.filter((g) =>
    g.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Sistem Pengecekan Perangkat Pembelajaran
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Daftar Guru</h2>
        <p className="text-sm text-gray-500 mb-5">
          Daftar semua guru dengan status unggahan perangkat pembelajaran
          masing-masing.
        </p>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari berdasarkan ID guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Header tabel */}
        <div className="grid grid-cols-3 bg-blue-50 rounded px-4 py-2.5 text-sm font-semibold text-gray-700 mb-1">
          <span>User ID Guru</span>
          <span>Status Unggahan</span>
          <span className="text-right">Aksi</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Tidak ada data guru
          </div>
        ) : (
          filtered.map((guru) => (
            <div
              key={guru.user_id}
              className="grid grid-cols-3 px-4 py-3 border-b border-gray-100 text-sm items-center"
            >
              <span className="text-gray-700 font-mono text-xs truncate pr-2">
                {guru.user_id}
              </span>
              <span
                className={
                  guru.status_unggahan === "Lengkap"
                    ? "font-semibold text-gray-700"
                    : "font-semibold text-gray-700"
                }
              >
                {guru.status_unggahan === "Lengkap" ? (
                  <span className="text-green-600">Lengkap</span>
                ) : (
                  <span className="text-red-500">Belum Lengkap</span>
                )}
              </span>
              <div className="text-right">
                <button
                  onClick={() =>
                    navigate(
                      `/wakepsek/detail-pembelajaran/${guru.user_id}`
                    )
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  Lihat detail
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}