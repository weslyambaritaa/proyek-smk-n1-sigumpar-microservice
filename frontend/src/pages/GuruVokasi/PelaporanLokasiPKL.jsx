import AppLayout from "@/Layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { getAllPKL, createMonitoring, getAllMonitoring } from "@/lib/api";

export default function PelaporanLokasiPKL() {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [submissions, setSubmissions] = useState([]); // daftar pkl untuk dropdown
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    submission_id: "",
    catatan_monitoring: "",
    progres_siswa: "",
    tanggal_kunjungan: new Date().toISOString().split("T")[0],
    dokumen: null,
  });

  // ── Fetch data awal ───────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pklRes, monRes] = await Promise.all([
          getAllPKL(),
          getAllMonitoring(),
        ]);
        setSubmissions(pklRes.data || []);
        setHistory(monRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "dokumen") {
      setFormData((prev) => ({ ...prev, dokumen: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("submission_id", formData.submission_id);
      fd.append("catatan_monitoring", formData.catatan_monitoring);
      fd.append("progres_siswa", formData.progres_siswa);
      fd.append("tanggal_kunjungan", formData.tanggal_kunjungan);
      if (formData.dokumen) fd.append("dokumen", formData.dokumen);

      const res = await createMonitoring(fd);
      if (res.success) {
        // Refresh history
        const monRes = await getAllMonitoring();
        setHistory(monRes.data || []);
        setFormData({
          submission_id: "",
          catatan_monitoring: "",
          progres_siswa: "",
          tanggal_kunjungan: new Date().toISOString().split("T")[0],
          dokumen: null,
        });
        alert("Laporan monitoring berhasil disimpan!");
      }
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const currentItems = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <AppLayout title="Pelaporan Lokasi PKL">
      <Head title="Pelaporan Lokasi PKL" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-20">
        {/* Header */}
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
            Sistem Monitoring PKL
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mt-1">
            PELAPORAN DETAIL PENEMPATAN PKL
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-1">
            Guru Vokasi: {user?.name}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-bold">
            ⚠ {error}
          </div>
        )}

        {/* ── Form Input Monitoring ────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Catat Monitoring & Kunjungan Lapangan
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Pilih Siswa (dari submission yang ada) */}
            <div className="lg:col-span-2 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Pilih Siswa PKL
              </label>
              <select
                name="submission_id"
                value={formData.submission_id}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Siswa...</option>
                {submissions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_lengkap} — {s.nama_perusahaan}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Tanggal Kunjungan
              </label>
              <input
                type="date"
                name="tanggal_kunjungan"
                value={formData.tanggal_kunjungan}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Foto / Dokumen
              </label>
              <input
                type="file"
                name="dokumen"
                onChange={handleChange}
                accept="image/*,.pdf"
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-2 text-[10px] font-bold text-slate-400 file:bg-blue-50 file:border-0 file:rounded-full file:px-3 file:text-blue-600 file:font-black"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Catatan Monitoring
              </label>
              <textarea
                name="catatan_monitoring"
                rows="3"
                placeholder="Observasi selama kunjungan lapangan..."
                value={formData.catatan_monitoring}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Progres Siswa
              </label>
              <textarea
                name="progres_siswa"
                rows="3"
                placeholder="Perkembangan siswa selama PKL..."
                value={formData.progres_siswa}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-10 rounded-2xl shadow-lg uppercase text-xs tracking-widest disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan Laporan Monitoring"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Tabel Riwayat ──────────────────────────────── */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
              Riwayat Monitoring & Kunjungan
            </h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
              {history.length} laporan
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-16 text-center text-slate-400 font-bold text-sm">
                Memuat data...
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-blue-50/50">
                  <tr>
                    {[
                      "No",
                      "Siswa & Lokasi",
                      "Catatan Monitoring",
                      "Progres Siswa",
                      "Tanggal",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-slate-400 font-bold text-sm"
                      >
                        Belum ada laporan monitoring.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-6 py-6 text-center text-sm font-bold text-blue-200">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-6 min-w-[160px]">
                          <p className="font-black text-slate-800 uppercase text-xs">
                            {item.nama_lengkap}
                          </p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">
                            {item.nama_perusahaan}
                          </p>
                        </td>
                        <td className="px-6 py-6 max-w-xs">
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {item.catatan_monitoring}
                          </p>
                        </td>
                        <td className="px-6 py-6 max-w-xs">
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {item.progres_siswa}
                          </p>
                        </td>
                        <td className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                          {item.tanggal_kunjungan}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="p-8 bg-slate-50 border-t border-blue-50 flex items-center justify-between">
            <div className="flex gap-2">
              {["Sebelumnya", "Selanjutnya"].map((label, i) => {
                const isDisabled =
                  i === 0
                    ? currentPage === 1
                    : currentPage === totalPages || totalPages === 0;
                return (
                  <button
                    key={label}
                    onClick={() =>
                      setCurrentPage((p) =>
                        i === 0
                          ? Math.max(p - 1, 1)
                          : Math.min(p + 1, totalPages),
                      )
                    }
                    disabled={isDisabled}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isDisabled
                        ? "bg-gray-100 text-gray-300"
                        : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Hal {currentPage} dari {totalPages || 1}
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
