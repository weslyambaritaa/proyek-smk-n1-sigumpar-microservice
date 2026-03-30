import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { learningApi } from "../../../api/learningApi";
import toast from "react-hot-toast";

export default function DashboardWakasek() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_guru: 0,
    unggahan_lengkap: 0,
    unggahan_belum_lengkap: 0,
    unggahan_terbaru: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await learningApi.getDashboardWakasek();
      setStats(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (namaMapel, uploadSilabus, uploadRPP, modulAjar) => {
    const lengkap = uploadSilabus && uploadRPP && modulAjar;
    return lengkap ? "text-green-600 font-semibold" : "text-red-500 font-semibold";
  };

  const statusLabel = (uploadSilabus, uploadRPP, modulAjar) =>
    uploadSilabus && uploadRPP && modulAjar ? "Lengkap" : "Belum Lengkap";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Sistem Pengecekan Perangkat Pembelajaran
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">
          Dashboard Wakil Kepala Sekolah
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Dashboard menampilkan ringkasan status unggahan perangkat pembelajaran
          guru dan opsi untuk melihat detail
        </p>

        {/* Kartu Statistik */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">Memuat data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Guru */}
            <div className="border border-gray-200 rounded-lg p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Guru</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.total_guru}
              </p>
              <p className="text-xs text-gray-400 mt-1">Jumlah Guru Terdaftar</p>
            </div>

            {/* Unggahan Lengkap */}
            <div className="border border-gray-200 rounded-lg p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Unggahan Lengkap</p>
              <p className="text-3xl font-bold text-green-500">
                {stats.unggahan_lengkap}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Guru dengan unggahan lengkap
              </p>
            </div>

            {/* Belum Lengkap */}
            <div className="border border-gray-200 rounded-lg p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Unggahan Belum Lengkap</p>
              <p className="text-3xl font-bold text-red-500">
                {stats.unggahan_belum_lengkap}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Guru dengan unggahan belum lengkap
              </p>
            </div>
          </div>
        )}

        {/* Tabel Status Unggahan Terbaru */}
        <h3 className="text-base font-bold text-gray-800 mb-3">
          Status Unggahan Terbaru
        </h3>

        {loading ? null : (
          <>
            {/* Header tabel */}
            <div className="grid grid-cols-4 bg-blue-50 rounded px-4 py-2.5 text-sm font-semibold text-gray-700 mb-1">
              <span>Nama Mapel</span>
              <span>Kelas</span>
              <span>Status Unggahan</span>
              <span className="text-right">Aksi</span>
            </div>

            {stats.unggahan_terbaru.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Belum ada data unggahan
              </div>
            ) : (
              stats.unggahan_terbaru.map((item) => {
                const lengkap =
                  item.uploadSilabus && item.uploadRPP && item.modulAjar;
                return (
                  <div
                    key={item.id_perangkatPembelajaran}
                    className="grid grid-cols-4 px-4 py-3 border-b border-gray-100 text-sm items-center"
                  >
                    <span className="text-gray-700">{item.namaMapel}</span>
                    <span className="text-gray-700">{item.kelas}</span>
                    <span
                      className={
                        lengkap
                          ? "text-green-600 font-semibold"
                          : "text-red-500 font-semibold"
                      }
                    >
                      {lengkap ? "Lengkap" : "Belum Lengkap"}
                    </span>
                    <div className="text-right">
                      <button
                        onClick={() =>
                          navigate(`/wakepsek/detail-pembelajaran/${item.user_id}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        Lihat detail
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Tombol ke Daftar Guru */}
            <div className="mt-5">
              <button
                onClick={() => navigate("/wakepsek/daftar-guru")}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-5 py-2 rounded transition-colors"
              >
                Melihat daftar guru
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}