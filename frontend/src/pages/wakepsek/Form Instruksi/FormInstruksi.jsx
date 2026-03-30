import { useState, useEffect } from "react";
import { learningApi } from "../../../api/learningApi";
import toast from "react-hot-toast";

export default function FormInstruksi() {
  const [form, setForm] = useState({
    id_perangkatPembelajaran: "",
    komentarSilabus: "",
    komentarRPP: "",
    komentarModulAjar: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoadingRiwayat(true);
      const res = await learningApi.getAllReviewWakasek();
      setRiwayat(res.data.data || []);
    } catch {
      // abaikan jika gagal
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_perangkatPembelajaran.trim()) {
      toast.error("ID Perangkat Pembelajaran wajib diisi");
      return;
    }

    const adaKomentar =
      form.komentarSilabus.trim() ||
      form.komentarRPP.trim() ||
      form.komentarModulAjar.trim();

    if (!adaKomentar) {
      toast.error("Isi minimal satu komentar (Silabus, RPP, atau Modul Ajar)");
      return;
    }

    try {
      setSubmitting(true);
      await learningApi.createReviewWakasek({
        id_perangkatPembelajaran: form.id_perangkatPembelajaran.trim(),
        komentarSilabus: form.komentarSilabus.trim() || null,
        komentarRPP: form.komentarRPP.trim() || null,
        komentarModulAjar: form.komentarModulAjar.trim() || null,
      });
      toast.success("Review/instruksi berhasil dikirim!");
      setForm({
        id_perangkatPembelajaran: "",
        komentarSilabus: "",
        komentarRPP: "",
        komentarModulAjar: "",
      });
      fetchRiwayat();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengirim review";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Sistem Pengecekan Perangkat Pembelajaran
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form Komentar/Instruksi ── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Form Review / Instruksi Perangkat
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Berikan komentar atau instruksi untuk perangkat pembelajaran guru.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID Perangkat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Perangkat Pembelajaran{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan ID perangkat pembelajaran (UUID)"
                value={form.id_perangkatPembelajaran}
                onChange={(e) =>
                  handleChange("id_perangkatPembelajaran", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                Dapatkan ID dari halaman Detail Pembelajaran guru
              </p>
            </div>

            {/* Komentar Silabus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Komentar Silabus
              </label>
              <textarea
                placeholder="Tulis komentar untuk Silabus di sini..."
                value={form.komentarSilabus}
                onChange={(e) => handleChange("komentarSilabus", e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            {/* Komentar RPP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Komentar RPP
              </label>
              <textarea
                placeholder="Tulis komentar untuk RPP di sini..."
                value={form.komentarRPP}
                onChange={(e) => handleChange("komentarRPP", e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            {/* Komentar Modul Ajar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Komentar Modul Ajar
              </label>
              <textarea
                placeholder="Tulis komentar untuk Modul Ajar di sini..."
                value={form.komentarModulAjar}
                onChange={(e) =>
                  handleChange("komentarModulAjar", e.target.value)
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {submitting ? "Mengirim..." : "Kirim Review / Instruksi"}
            </button>
          </form>
        </div>

        {/* ── Riwayat Review ── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Riwayat Review
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Review yang sudah dikirim sebelumnya.
          </p>

          {loadingRiwayat ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Memuat riwayat...
            </div>
          ) : riwayat.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Belum ada riwayat review
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {riwayat.map((r) => (
                <div
                  key={r.id_reviewPerangkatPembelajaranWakasek}
                  className="border border-gray-200 rounded-lg p-4 text-sm"
                >
                  {/* Mapel & kelas */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {r.namaMapel || "—"}{" "}
                      {r.kelas ? (
                        <span className="text-xs text-gray-500 font-normal">
                          ({r.kelas})
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-gray-400">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>

                  {/* Komentar per bagian */}
                  {r.komentarSilabus && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        Silabus:{" "}
                      </span>
                      <span className="text-gray-700">{r.komentarSilabus}</span>
                    </div>
                  )}
                  {r.komentarRPP && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        RPP:{" "}
                      </span>
                      <span className="text-gray-700">{r.komentarRPP}</span>
                    </div>
                  )}
                  {r.komentarModulAjar && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        Modul Ajar:{" "}
                      </span>
                      <span className="text-gray-700">{r.komentarModulAjar}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}