import React, { useState, useEffect } from "react";
import { vocationalApi } from "../../api/vocationalApi";
import toast from "react-hot-toast";

const ProgressBar = ({ value }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-2 rounded-full ${value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-400" : "bg-red-400"}`}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-gray-600 w-8 text-right">
      {value}%
    </span>
  </div>
);

// ── Modal Tambah Monitoring ───────────────────────────────
const MonitoringModal = ({ isOpen, onClose, onSaved, pklData }) => {
  const [form, setForm] = useState({ catatan: "", progres_saat_kunjungan: 50 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.catatan) {
      toast.error("Catatan wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await vocationalApi.addMonitoring({ pkl_id: pklData.id, ...form });
      toast.success("Monitoring berhasil dicatat");
      setForm({ catatan: "", progres_saat_kunjungan: 50 });
      onSaved();
      onClose();
    } catch {
      toast.error("Gagal menyimpan monitoring");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Tambah Monitoring
            </h2>
            <p className="text-xs text-gray-500">
              {pklData?.nama_siswa} · {pklData?.nama_perusahaan}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
              <span>Progres Siswa Saat Ini</span>
              <span className="text-orange-600 font-bold">
                {form.progres_saat_kunjungan}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.progres_saat_kunjungan}
              onChange={(e) =>
                setForm({
                  ...form,
                  progres_saat_kunjungan: parseInt(e.target.value),
                })
              }
              className="w-full accent-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Catatan Kunjungan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Deskripsikan hasil kunjungan dan perkembangan siswa..."
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Monitoring"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Halaman Monitoring ────────────────────────────────────
const MonitoringPage = () => {
  const [pklList, setPklList] = useState([]);
  const [monitoringLog, setMonitoringLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPKL, setSelectedPKL] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pklRes, monRes] = await Promise.all([
        vocationalApi.getAllPKL(),
        vocationalApi.getAllMonitoring(),
      ]);
      setPklList(pklRes.data.data || []);
      setMonitoringLog(monRes.data.data || []);
    } catch {
      toast.error("Gagal memuat data monitoring");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPKL = (pkl) => {
    setSelectedPKL(pkl);
    setIsModalOpen(true);
  };

  // Group log by pkl_id untuk detail view
  const logByPKL = monitoringLog.reduce((acc, item) => {
    acc[item.pkl_id] = acc[item.pkl_id] || [];
    acc[item.pkl_id].push(item);
    return acc;
  }, {});

  const formatDate = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Monitoring PKL</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pantau progres dan rekam kunjungan siswa PKL
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daftar PKL untuk dimonitor */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Siswa PKL Aktif
            </h2>
            {pklList.filter((p) => p.status_approval === "disetujui").length ===
            0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 text-sm">
                Tidak ada PKL yang aktif/disetujui
              </div>
            ) : (
              pklList
                .filter((p) => p.status_approval === "disetujui")
                .map((pkl) => (
                  <div
                    key={pkl.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          {pkl.nama_siswa}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pkl.kelas} · {pkl.nama_perusahaan}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectPKL(pkl)}
                        className="text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        + Catat Kunjungan
                      </button>
                    </div>
                    <ProgressBar value={pkl.progres_terakhir || 0} />
                    {(logByPKL[pkl.id] || []).length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        {(logByPKL[pkl.id] || []).length}x kunjungan · Terakhir:{" "}
                        {formatDate(
                          (logByPKL[pkl.id] || [{}])[0].tanggal_kunjungan,
                        )}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>

          {/* Log monitoring terbaru */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Riwayat Kunjungan Terbaru
            </h2>
            {monitoringLog.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 text-sm">
                Belum ada riwayat monitoring
              </div>
            ) : (
              monitoringLog.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-orange-400"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        {log.nama_siswa || `PKL #${log.pkl_id}`}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {log.nama_perusahaan || ""} ·{" "}
                        {formatDate(log.tanggal_kunjungan)}
                      </p>
                      <p className="text-sm text-gray-700">{log.catatan}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <span
                        className={`text-lg font-black ${log.progres_saat_kunjungan >= 80 ? "text-emerald-600" : log.progres_saat_kunjungan >= 50 ? "text-amber-500" : "text-red-500"}`}
                      >
                        {log.progres_saat_kunjungan}%
                      </span>
                    </div>
                  </div>
                  {log.nama_petugas && (
                    <p className="text-xs text-gray-400 mt-2">
                      👤 {log.nama_petugas}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <MonitoringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPKL(null);
        }}
        onSaved={fetchData}
        pklData={selectedPKL}
      />
    </div>
  );
};

export default MonitoringPage;
