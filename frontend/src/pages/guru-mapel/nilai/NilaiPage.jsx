import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useGrades from "../../../hooks/userGrades";
import { academicApi } from "../../../api/academicApi";

const tahunAjarOptions = ["2023/2024", "2024/2025", "2025/2026"];

const initialFilters = {
  mapel: "",
  kelas: "",
  tahunAjar: "2023/2024",
  search: "",
};

const NilaiPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const {
    grades,
    loading,
    saving,
    error,
    loadGrades,
    updateGradeValue,
    saveAllGrades,
  } = useGrades();

  useEffect(() => {
<<<<<<< HEAD
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [mapelRes, kelasRes] = await Promise.all([
          academicApi.getAllMapel(),
          academicApi.getAllKelas(),
        ]);

        const mapels = mapelRes.data?.data || mapelRes.data || [];
        const kelas = kelasRes.data?.data || kelasRes.data || [];

        const mapelNames = mapels.map((m) => m.nama_mapel);
        const kelasNames = kelas.map((k) => k.nama_kelas);

        setMapelOptions(mapelNames);
        setKelasOptions(kelasNames);

        // Set initial filters to first options if available
        if (mapelNames.length > 0 && kelasNames.length > 0) {
          setFilters((prev) => ({
            ...prev,
            mapel: mapelNames[0],
            kelas: kelasNames[0],
          }));
        }
      } catch (err) {
        console.error("Failed to fetch options:", err);
        toast.error("Gagal memuat data filter");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

=======
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [mapelRes, kelasRes] = await Promise.all([
        academicApi.getAllMapel(),
        academicApi.getAllKelas(),
      ]);

      const mapels = mapelRes.data?.data || [];
      const kelases = kelasRes.data?.data || [];

      setMapelOptions(mapels.map((m) => m.nama_mapel || m.nama));
      setKelasOptions(kelases.map((k) => k.nama_kelas || k.nama));

      if (mapels.length > 0) {
        setFilters((prev) => ({
          ...prev,
          mapel: mapels[0].nama_mapel || mapels[0].nama,
        }));
      }
      if (kelases.length > 0) {
        setFilters((prev) => ({
          ...prev,
          kelas: kelases[0].nama_kelas || kelases[0].nama,
        }));
      }
    } catch (err) {
      console.error("Gagal mengambil options:", err);
      toast.error("Gagal memuat data mapel dan kelas");
    } finally {
      setLoadingOptions(false);
    }
  };

>>>>>>> 4230e45464797b1cb4e9ca82f6d34278f9aa9c1e
  useEffect(() => {
    if (!loadingOptions && filters.mapel && filters.kelas) {
      handleCari();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingOptions, filters.mapel, filters.kelas]);

  const handleCari = async () => {
    try {
      await loadGrades(filters);
    } catch (_) {}
  };

  const handleReset = async () => {
    const resetFilters = {
      mapel: mapelOptions[0] || "",
      kelas: kelasOptions[0] || "",
      tahunAjar: "2023/2024",
      search: "",
    };
    setFilters(resetFilters);

    try {
      await loadGrades(resetFilters);
    } catch (_) {}
  };

  const handleRefresh = async () => {
    setLoadingOptions(true);
    await fetchOptions();
  };

  const handleSave = async () => {
    try {
      const result = await saveAllGrades({
        mapel: filters.mapel,
        kelas: filters.kelas,
        tahunAjar: filters.tahunAjar,
      });

      toast.success(result?.message || "Semua nilai berhasil disimpan");
      await loadGrades(filters);
    } catch (_) {}
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 flex items-center justify-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-wide">
              INPUT & KELOLA NILAI
            </h1>
            <p className="text-slate-500 mt-3">
              Kelola nilai tugas, kuis, UTS, UAS, dan praktik siswa
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loadingOptions}
            className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors h-fit"
            title="Refresh data kelas dan mapel dari database"
          >
            {loadingOptions ? "MEMUAT..." : "🔄 REFRESH"}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MAPEL
              </label>
              <select
                value={filters.mapel}
<<<<<<< HEAD
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, mapel: e.target.value }))
                }
                disabled={loadingOptions}
                className="w-full h-11 border border-gray-300 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {loadingOptions ? (
                  <option>Loading...</option>
=======
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, mapel: e.target.value }));
                  loadGrades({ ...filters, mapel: e.target.value });
                }}
                className="w-full h-11 border border-gray-300 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mapelOptions.length === 0 ? (
                  <option>Memuat mapel...</option>
>>>>>>> 4230e45464797b1cb4e9ca82f6d34278f9aa9c1e
                ) : (
                  mapelOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                KELAS
              </label>
              <select
                value={filters.kelas}
<<<<<<< HEAD
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, kelas: e.target.value }))
                }
                disabled={loadingOptions}
                className="w-full h-11 border border-gray-300 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {loadingOptions ? (
                  <option>Loading...</option>
=======
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, kelas: e.target.value }));
                  loadGrades({ ...filters, kelas: e.target.value });
                }}
                className="w-full h-11 border border-gray-300 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {kelasOptions.length === 0 ? (
                  <option>Memuat kelas...</option>
>>>>>>> 4230e45464797b1cb4e9ca82f6d34278f9aa9c1e
                ) : (
                  kelasOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))
                )}
<<<<<<< HEAD
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                TAHUN AJAR
              </label>
              <select
                value={filters.tahunAjar}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, tahunAjar: e.target.value }))
                }
                className="w-full h-11 border border-gray-300 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tahunAjarOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
=======
>>>>>>> 4230e45464797b1cb4e9ca82f6d34278f9aa9c1e
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CARI NAMA
              </label>
              <input
                type="text"
                placeholder="Ketik nama..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full h-11 border border-gray-300 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCari}
                className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                CARI
              </button>
              <button
                onClick={handleReset}
                className="h-11 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-colors"
              >
                RESET
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-2xl font-semibold text-slate-800">
              Daftar Nilai - {filters.kelas}
            </h2>
            <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold tracking-wider">
              {filters.mapel.toUpperCase()}
            </span>
          </div>

          {error && (
            <div className="px-6 pb-4 text-sm text-red-600">{error}</div>
          )}

          {loading ? (
            <div className="px-6 pb-6 text-gray-500">Memuat data nilai...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-center border-b">
                      NO
                    </th>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-left border-b">
                      NAMA SISWA
                    </th>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-center border-b">
                      TUGAS
                    </th>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-center border-b">
                      KUIS
                    </th>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-center border-b">
                      UTS
                    </th>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-center border-b">
                      UAS
                    </th>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-center border-b">
                      PRAKTIK
                    </th>
                    <th className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-4 text-center border-b">
                      NILAI AKHIR
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length > 0 ? (
                    grades.map((item, index) => (
                      <tr key={item.id || item.student_id || index}>
                        <td className="px-4 py-4 text-center border-b text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 border-b">
                          <div className="font-bold text-slate-800">
                            {item.student_name}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            NIS: {item.nis}
                          </div>
                        </td>

                        {["tugas", "kuis", "uts", "uas", "praktik"].map(
                          (field) => (
                            <td
                              key={field}
                              className="px-4 py-4 text-center border-b"
                            >
                              <input
                                type="number"
                                value={item[field]}
                                onChange={(e) =>
                                  updateGradeValue(index, field, e.target.value)
                                }
                                className="w-16 h-9 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          ),
                        )}

                        <td className="px-4 py-4 text-center border-b font-bold text-blue-600">
                          {Number(item.nilai_akhir || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada data nilai
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-6">
            <span className="text-xs font-bold tracking-wider text-gray-400">
              HALAMAN 1 DARI 1
            </span>

            <button
              onClick={handleSave}
              disabled={saving || grades.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl px-8 py-4 font-bold transition-colors min-w-[220px]"
            >
              {saving ? "MENYIMPAN..." : "SIMPAN SEMUA NILAI"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NilaiPage;
