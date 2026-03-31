import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vocationalApi } from "../../api/vocationalApi";
import toast from "react-hot-toast";

// ── Badge Status ──────────────────────────────────────────
const StatusBadge = ({ value, type = "approval" }) => {
  const approvalMap = {
    disetujui: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100  text-amber-700  border-amber-200",
    ditolak: "bg-red-100    text-red-700    border-red-200",
  };
  const kelayakanMap = {
    layak: "bg-blue-100  text-blue-700  border-blue-200",
    tidak_layak: "bg-red-100   text-red-700   border-red-200",
    belum_dinilai: "bg-gray-100  text-gray-600  border-gray-200",
  };
  const map = type === "approval" ? approvalMap : kelayakanMap;
  const labelMap = {
    disetujui: "Disetujui",
    pending: "Pending",
    ditolak: "Ditolak",
    layak: "Layak",
    tidak_layak: "Tidak Layak",
    belum_dinilai: "Belum Dinilai",
    aktif: "Aktif",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };
  const cls = map[value] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {labelMap[value] || value}
    </span>
  );
};

// ── Kartu Statistik ───────────────────────────────────────
const StatCard = ({ label, value, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group`}
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}
      >
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </button>
);

// ── Progress Bar ─────────────────────────────────────────
const ProgressBar = ({ value }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all ${
          value >= 80
            ? "bg-emerald-500"
            : value >= 50
              ? "bg-amber-400"
              : "bg-red-400"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-gray-600 w-8 text-right">
      {value}%
    </span>
  </div>
);

// ── Komponen Utama ────────────────────────────────────────
const VokasiDashboard = () => {
  const navigate = useNavigate();
  const [statistik, setStatistik] = useState(null);
  const [pklList, setPklList] = useState([]);
  const [proyekList, setProyekList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statRes, pklRes, proyekRes] = await Promise.all([
          vocationalApi.getStatistik(),
          vocationalApi.getAllPKL(),
          vocationalApi.getAllProyek(),
        ]);
        setStatistik(statRes.data.data);
        setPklList((pklRes.data.data || []).slice(0, 5));
        setProyekList((proyekRes.data.data || []).slice(0, 3));
      } catch (err) {
        toast.error("Gagal memuat data dashboard vokasi");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat data vokasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Vokasi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manajemen PKL, Proyek & Nilai Kompetensi
          </p>
        </div>
        <button
          onClick={() => navigate("/vokasi/pkl/tambah")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <span className="text-base">＋</span> Tambah PKL
        </button>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pengajuan PKL"
          value={statistik?.total_pkl ?? 0}
          icon="📋"
          color="bg-blue-50"
          onClick={() => navigate("/vokasi/pkl")}
        />
        <StatCard
          label="PKL Disetujui"
          value={statistik?.pkl_disetujui ?? 0}
          icon="✅"
          color="bg-emerald-50"
          onClick={() => navigate("/vokasi/pkl")}
        />
        <StatCard
          label="Menunggu Validasi"
          value={statistik?.pkl_pending ?? 0}
          icon="⏳"
          color="bg-amber-50"
          onClick={() => navigate("/vokasi/pkl")}
        />
        <StatCard
          label="Total Proyek Aktif"
          value={statistik?.total_proyek ?? 0}
          icon="🛠️"
          color="bg-purple-50"
          onClick={() => navigate("/vokasi/proyek")}
        />
      </div>

      {/* Rata-rata Nilai Banner */}
      {statistik?.rata_rata_nilai > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">
              Rata-rata Nilai PKL
            </p>
            <p className="text-4xl font-bold mt-1">
              {statistik.rata_rata_nilai.toFixed(1)}
            </p>
          </div>
          <div className="text-5xl opacity-50">🎓</div>
        </div>
      )}

      {/* Tabel & Proyek berdampingan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel PKL Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">PKL Terbaru</h2>
            <button
              onClick={() => navigate("/vokasi/pkl")}
              className="text-blue-600 text-xs font-medium hover:underline"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Siswa</th>
                  <th className="px-6 py-3 text-left">Perusahaan</th>
                  <th className="px-6 py-3 text-left">Progres</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pklList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-400 text-sm"
                    >
                      Belum ada data PKL
                    </td>
                  </tr>
                ) : (
                  pklList.map((pkl) => (
                    <tr
                      key={pkl.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {pkl.nama_siswa}
                        </p>
                        <p className="text-xs text-gray-400">{pkl.kelas}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 truncate max-w-[140px]">
                          {pkl.nama_perusahaan}
                        </p>
                      </td>
                      <td className="px-6 py-4 w-32">
                        <ProgressBar value={pkl.progres_terakhir || 0} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          value={pkl.status_approval}
                          type="approval"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proyek Aktif */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Proyek Aktif</h2>
            <button
              onClick={() => navigate("/vokasi/proyek")}
              className="text-blue-600 text-xs font-medium hover:underline"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {proyekList.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">
                Belum ada proyek
              </p>
            ) : (
              proyekList.map((proyek) => (
                <div
                  key={proyek.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm leading-snug">
                        {proyek.judul_proyek}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {proyek.nama_program || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {proyek.jumlah_anggota} anggota · {proyek.tahun_ajaran}
                      </p>
                    </div>
                    <StatusBadge value={proyek.status} type="proyek" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Menu Aksi Cepat */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Data PKL",
            icon: "📋",
            path: "/vokasi/pkl",
            color: "border-blue-200 hover:bg-blue-50",
          },
          {
            label: "Monitoring",
            icon: "🔍",
            path: "/vokasi/monitoring",
            color: "border-amber-200 hover:bg-amber-50",
          },
          {
            label: "Proyek Vokasi",
            icon: "🛠️",
            path: "/vokasi/proyek",
            color: "border-purple-200 hover:bg-purple-50",
          },
          {
            label: "Nilai Kompetensi",
            icon: "📊",
            path: "/vokasi/nilai",
            color: "border-emerald-200 hover:bg-emerald-50",
          },
        ].map((menu) => (
          <button
            key={menu.path}
            onClick={() => navigate(menu.path)}
            className={`flex flex-col items-center justify-center gap-2 bg-white border rounded-2xl p-5 text-sm font-medium text-gray-700 transition-all hover:shadow-sm ${menu.color}`}
          >
            <span className="text-3xl">{menu.icon}</span>
            {menu.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VokasiDashboard;
