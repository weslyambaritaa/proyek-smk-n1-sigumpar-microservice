import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { learningApi } from "../../api/learningApi";

const KRITERIA = [
  { id: "perencanaan", label: "Perencanaan Pembelajaran", bobot: 20 },
  { id: "pelaksanaan", label: "Pelaksanaan Pembelajaran", bobot: 30 },
  { id: "penilaian", label: "Penilaian Hasil Belajar", bobot: 20 },
  { id: "pengembangan", label: "Pengembangan Profesional", bobot: 15 },
  { id: "disiplin", label: "Kedisiplinan", bobot: 15 },
];

export default function EvaluasiKinerjaPage() {
  const [guruList, setGuruList] = useState([]);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [nilai, setNilai] = useState({});
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingGuru, setLoadingGuru] = useState(false);
  const [loadingHasil, setLoadingHasil] = useState(false);
  const [hasil, setHasil] = useState([]);

  const hitungTotal = () =>
    KRITERIA.reduce(
      (total, kriteria) =>
        total + ((Number(nilai[kriteria.id]) || 0) * kriteria.bobot) / 100,
      0,
    ).toFixed(1);

  const getPredikat = (value) => {
    const v = Number(value);
    if (v >= 90) return "Sangat Baik";
    if (v >= 75) return "Baik";
    if (v >= 60) return "Cukup";
    return "Perlu Peningkatan";
  };

  const getColor = (value) => {
    const v = Number(value);
    if (v >= 90) return "text-green-600";
    if (v >= 75) return "text-blue-600";
    if (v >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  const getBadgeColor = (value) => {
    const v = Number(value);
    if (v >= 90) return "bg-green-100 text-green-700";
    if (v >= 75) return "bg-blue-100 text-blue-700";
    if (v >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const loadGuruMapel = async () => {
    setLoadingGuru(true);
    try {
      const res = await learningApi.getGuruMapelForEvaluasi();
      setGuruList(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil guru-mapel:", err);
      toast.error("Gagal mengambil data guru-mapel");
    } finally {
      setLoadingGuru(false);
    }
  };

  const loadHasilEvaluasi = async () => {
    setLoadingHasil(true);
    try {
      const res = await learningApi.getEvaluasiGuru();
      setHasil(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil hasil evaluasi:", err);
      toast.error("Gagal mengambil hasil evaluasi");
    } finally {
      setLoadingHasil(false);
    }
  };

  useEffect(() => {
    loadGuruMapel();
    loadHasilEvaluasi();
  }, []);

  const validateNilai = () => {
    for (const kriteria of KRITERIA) {
      const value = Number(nilai[kriteria.id] || 0);
      if (value < 0 || value > 100) {
        toast.error(`Nilai ${kriteria.label} harus antara 0 sampai 100`);
        return false;
      }
    }

    return true;
  };

  const handleSimpan = async () => {
    if (!selectedGuru) {
      toast.error("Pilih guru terlebih dahulu");
      return;
    }

    if (!validateNilai()) return;

    setSaving(true);

    try {
      const total = hitungTotal();

      await learningApi.createEvaluasiGuru({
        guru_id: selectedGuru.id,
        nama_guru: selectedGuru.nama,
        mapel: selectedGuru.mapel || selectedGuru.mata_pelajaran || "-",
        semester: "Genap",
        penilaian: nilai,
        skor: Number(total),
        predikat: getPredikat(total),
        catatan,
      });

      toast.success("Evaluasi kinerja berhasil disimpan");

      setNilai({});
      setCatatan("");
      setSelectedGuru(null);

      await loadHasilEvaluasi();
    } catch (err) {
      console.error("Gagal menyimpan evaluasi:", err);
      toast.error(
        err.response?.data?.message || "Gagal menyimpan evaluasi kinerja",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">
          EVALUASI KINERJA GURU
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Lakukan penilaian kinerja guru-mapel berdasarkan kriteria yang telah
          ditetapkan
        </p>
      </div>

      <div className="px-8 py-6 max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Pilih Guru Mapel
            </label>

            <select
              value={selectedGuru?.id || ""}
              onChange={(e) => {
                const guru = guruList.find(
                  (item) => String(item.id) === e.target.value,
                );
                setSelectedGuru(guru || null);
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingGuru}
            >
              <option value="">
                {loadingGuru ? "Memuat guru-mapel..." : "-- Pilih Guru --"}
              </option>

              {guruList.map((guru) => (
                <option key={guru.id} value={guru.id}>
                  {guru.nama || guru.nama_lengkap || guru.username}
                  {guru.mapel || guru.mata_pelajaran
                    ? ` — ${guru.mapel || guru.mata_pelajaran}`
                    : ""}
                  {guru.email ? ` — ${guru.email}` : ""}
                </option>
              ))}
            </select>

            {!loadingGuru && guruList.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Belum ada user dengan role guru-mapel yang ditemukan.
              </p>
            )}
          </div>

          {selectedGuru && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-gray-800">
                  {selectedGuru.nama ||
                    selectedGuru.nama_lengkap ||
                    selectedGuru.username}
                </p>
                <p className="text-xs text-gray-500">
                  Mapel:{" "}
                  {selectedGuru.mapel || selectedGuru.mata_pelajaran || "-"}
                </p>
                {selectedGuru.email && (
                  <p className="text-xs text-gray-500">
                    Email: {selectedGuru.email}
                  </p>
                )}
              </div>

              <h3 className="font-bold text-gray-700">Penilaian Kriteria</h3>

              <div className="space-y-3">
                {KRITERIA.map((kriteria) => (
                  <div
                    key={kriteria.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {kriteria.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        Bobot: {kriteria.bobot}%
                      </p>
                    </div>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={nilai[kriteria.id] || ""}
                      onChange={(e) =>
                        setNilai((prev) => ({
                          ...prev,
                          [kriteria.id]: e.target.value,
                        }))
                      }
                      placeholder="0-100"
                      className="w-24 text-center border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-bold text-gray-700">Nilai Akhir</span>
                <span
                  className={`text-2xl font-bold ${getColor(hitungTotal())}`}
                >
                  {hitungTotal()}{" "}
                  <span className="text-sm font-semibold">
                    ({getPredikat(hitungTotal())})
                  </span>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Catatan / Rekomendasi
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Catatan evaluasi dan rekomendasi pengembangan..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSimpan}
                  disabled={saving}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm"
                >
                  {saving ? "Menyimpan..." : "Simpan Evaluasi"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Hasil Evaluasi</h2>
          </div>

          {loadingHasil ? (
            <div className="p-6 text-sm text-gray-500">
              Memuat hasil evaluasi...
            </div>
          ) : hasil.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              Belum ada data evaluasi kinerja guru.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Guru</th>
                  <th className="px-5 py-3 text-left">Mapel</th>
                  <th className="px-5 py-3 text-center">Nilai</th>
                  <th className="px-5 py-3 text-center">Predikat</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {hasil.map((item) => {
                  const skor = item.skor ?? item.total ?? 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3 font-semibold text-gray-800">
                        {item.nama_guru || item.nama || "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {item.mapel || "-"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`font-bold text-lg ${getColor(skor)}`}>
                          {Number(skor).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeColor(
                            skor,
                          )}`}
                        >
                          {item.predikat || getPredikat(skor)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
