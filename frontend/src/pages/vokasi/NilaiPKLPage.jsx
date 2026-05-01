import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { vocationalApi } from "../../api/vocationalApi";

const DEFAULT_BOBOT = {
  praktik: 50,
  sikap: 30,
  laporan: 20,
};

const getPredikat = (nilai) => {
  const n = Number(nilai || 0);

  if (n >= 90) return "Sangat Baik";
  if (n >= 80) return "Baik";
  if (n >= 70) return "Cukup";
  return "Perlu Bimbingan";
};

const getColor = (nilai) => {
  const n = Number(nilai || 0);

  if (n >= 90) return "text-green-600";
  if (n >= 80) return "text-blue-600";
  if (n >= 70) return "text-yellow-600";
  return "text-red-500";
};

const getBadgeColor = (nilai) => {
  const n = Number(nilai || 0);

  if (n >= 90) return "bg-green-100 text-green-700";
  if (n >= 80) return "bg-blue-100 text-blue-700";
  if (n >= 70) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

export default function NilaiPKLPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");

  const [siswaList, setSiswaList] = useState([]);
  const [nilaiMap, setNilaiMap] = useState({});

  const [bobot, setBobot] = useState(DEFAULT_BOBOT);

  const [loadingKelas, setLoadingKelas] = useState(false);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedKelasObj = kelasList.find(
    (item) => String(item.id) === String(selectedKelas),
  );

  const totalBobot = useMemo(() => {
    return (
      Number(bobot.praktik || 0) +
      Number(bobot.sikap || 0) +
      Number(bobot.laporan || 0)
    );
  }, [bobot]);

  const hitungNilaiAkhir = (row) => {
    const praktik = Number(row?.nilai_praktik || 0);
    const sikap = Number(row?.nilai_sikap || 0);
    const laporan = Number(row?.nilai_laporan || 0);

    const total =
      praktik * (Number(bobot.praktik || 0) / 100) +
      sikap * (Number(bobot.sikap || 0) / 100) +
      laporan * (Number(bobot.laporan || 0) / 100);

    return Number(total.toFixed(2));
  };

  const summary = useMemo(() => {
    const data = {
      totalSiswa: siswaList.length,
      sudahLengkap: 0,
      belumLengkap: 0,
      rataRata: 0,
    };

    let totalNilai = 0;

    siswaList.forEach((siswa) => {
      const row = nilaiMap[siswa.id];

      const lengkap =
        row?.nilai_praktik !== "" &&
        row?.nilai_praktik !== undefined &&
        row?.nilai_sikap !== "" &&
        row?.nilai_sikap !== undefined &&
        row?.nilai_laporan !== "" &&
        row?.nilai_laporan !== undefined;

      if (lengkap) {
        data.sudahLengkap += 1;
        totalNilai += hitungNilaiAkhir(row);
      } else {
        data.belumLengkap += 1;
      }
    });

    data.rataRata =
      data.sudahLengkap > 0
        ? Number((totalNilai / data.sudahLengkap).toFixed(2))
        : 0;

    return data;
  }, [siswaList, nilaiMap, bobot]);

  const loadKelas = async () => {
    setLoadingKelas(true);

    try {
      const res = await vocationalApi.getKelasVokasi();
      setKelasList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
      toast.error("Gagal memuat daftar kelas");
    } finally {
      setLoadingKelas(false);
    }
  };

  const loadSiswaDanNilai = async (kelasId) => {
    if (!kelasId) {
      setSiswaList([]);
      setNilaiMap({});
      return;
    }

    setLoadingSiswa(true);

    try {
      const [siswaRes, nilaiRes] = await Promise.all([
        vocationalApi.getSiswaVokasi({ kelas_id: kelasId }),
        vocationalApi.getNilaiPKL({ kelas_id: kelasId }),
      ]);

      const siswa = Array.isArray(siswaRes.data?.data)
        ? siswaRes.data.data
        : [];

      const nilai = Array.isArray(nilaiRes.data?.data)
        ? nilaiRes.data.data
        : [];

      const nilaiBySiswa = {};
      nilai.forEach((item) => {
        nilaiBySiswa[String(item.siswa_id)] = item;
      });

      const nextNilaiMap = {};

      siswa.forEach((item) => {
        const existing = nilaiBySiswa[String(item.id)];

        nextNilaiMap[item.id] = {
          siswa_id: item.id,
          nama_siswa: item.nama_lengkap || item.nama_siswa || "-",
          nisn: item.nisn || "",
          nilai_praktik: existing?.nilai_praktik ?? "",
          nilai_sikap: existing?.nilai_sikap ?? "",
          nilai_laporan: existing?.nilai_laporan ?? "",
          catatan: existing?.catatan ?? "",
        };
      });

      setSiswaList(siswa);
      setNilaiMap(nextNilaiMap);
    } catch (err) {
      console.error("Gagal memuat siswa/nilai:", err);
      toast.error("Gagal memuat data siswa atau nilai PKL");
      setSiswaList([]);
      setNilaiMap({});
    } finally {
      setLoadingSiswa(false);
    }
  };

  useEffect(() => {
    loadKelas();
  }, []);

  useEffect(() => {
    loadSiswaDanNilai(selectedKelas);
  }, [selectedKelas]);

  const updateNilai = (siswaId, field, value) => {
    setNilaiMap((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value,
      },
    }));
  };

  const validateNilai = () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return false;
    }

    if (siswaList.length === 0) {
      toast.error("Tidak ada siswa di kelas ini");
      return false;
    }

    if (totalBobot !== 100) {
      toast.error("Total bobot harus 100%");
      return false;
    }

    for (const siswa of siswaList) {
      const row = nilaiMap[siswa.id];

      const praktik = row?.nilai_praktik;
      const sikap = row?.nilai_sikap;
      const laporan = row?.nilai_laporan;

      if (praktik === "" || sikap === "" || laporan === "") {
        toast.error(
          `Nilai ${row?.nama_siswa || siswa.nama_lengkap || "siswa"} belum lengkap`,
        );
        return false;
      }

      for (const value of [praktik, sikap, laporan]) {
        const n = Number(value);

        if (Number.isNaN(n) || n < 0 || n > 100) {
          toast.error("Semua nilai harus angka antara 0 sampai 100");
          return false;
        }
      }
    }

    return true;
  };

  const handleSimpan = async () => {
    if (!validateNilai()) return;

    const payload = {
      kelas_id: selectedKelas,
      bobot,
      data_nilai: siswaList.map((siswa) => {
        const row = nilaiMap[siswa.id];

        return {
          siswa_id: siswa.id,
          nama_siswa: row.nama_siswa,
          nisn: row.nisn,
          nilai_praktik: Number(row.nilai_praktik || 0),
          nilai_sikap: Number(row.nilai_sikap || 0),
          nilai_laporan: Number(row.nilai_laporan || 0),
          catatan: row.catatan || "",
        };
      }),
    };

    setSaving(true);

    try {
      await vocationalApi.saveNilaiPKLBulk(payload);
      toast.success("Nilai PKL berhasil disimpan");
      await loadSiswaDanNilai(selectedKelas);
    } catch (err) {
      console.error("Gagal menyimpan nilai PKL:", err);
      toast.error(err?.response?.data?.error || "Gagal menyimpan nilai PKL");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setBobot(DEFAULT_BOBOT);
    loadSiswaDanNilai(selectedKelas);
  };

  const handleExportExcel = () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    if (siswaList.length === 0) {
      toast.error("Tidak ada data siswa untuk diexport");
      return;
    }

    const rows = siswaList.map((siswa, index) => {
      const row = nilaiMap[siswa.id] || {};
      const nilaiAkhir = hitungNilaiAkhir(row);

      return {
        No: index + 1,
        "Nama Siswa":
          row.nama_siswa || siswa.nama_lengkap || siswa.nama_siswa || "-",
        NISN: row.nisn || siswa.nisn || "-",
        "Nilai Praktik": Number(row.nilai_praktik || 0),
        "Nilai Sikap": Number(row.nilai_sikap || 0),
        "Nilai Laporan": Number(row.nilai_laporan || 0),
        "Nilai Akhir": nilaiAkhir,
        Predikat: getPredikat(nilaiAkhir),
        Catatan: row.catatan || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet([]);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["Rekap Nilai PKL"],
        [`Kelas: ${selectedKelasObj?.nama_kelas || "-"}`],
        [
          `Bobot: Praktik ${bobot.praktik}% | Sikap ${bobot.sikap}% | Laporan ${bobot.laporan}%`,
        ],
        [`Total Siswa: ${summary.totalSiswa}`],
        [`Rata-rata Nilai Akhir: ${summary.rataRata}`],
        [],
      ],
      { origin: "A1" },
    );

    XLSX.utils.sheet_add_json(worksheet, rows, {
      origin: "A7",
      skipHeader: false,
    });

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai PKL");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const namaKelas = selectedKelasObj?.nama_kelas
      ? selectedKelasObj.nama_kelas.replace(/\s+/g, "-").toLowerCase()
      : "kelas";

    saveAs(file, `nilai-pkl-${namaKelas}-${Date.now()}.xlsx`);
    toast.success("Nilai PKL berhasil diexport ke Excel");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Input Nilai PKL</h1>
            <p className="text-sm text-gray-500">
              Input nilai praktik, sikap, dan laporan PKL berdasarkan kelas.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-5 max-w-7xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                disabled={loadingKelas}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {loadingKelas ? "Memuat kelas..." : "-- Pilih Kelas --"}
                </option>

                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Bobot Praktik
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={bobot.praktik}
                onChange={(e) =>
                  setBobot((prev) => ({ ...prev, praktik: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Bobot Sikap
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={bobot.sikap}
                onChange={(e) =>
                  setBobot((prev) => ({ ...prev, sikap: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Bobot Laporan
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={bobot.laporan}
                onChange={(e) =>
                  setBobot((prev) => ({ ...prev, laporan: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p
                className={`text-sm font-semibold ${
                  totalBobot === 100 ? "text-green-600" : "text-red-500"
                }`}
              >
                Total Bobot: {totalBobot}%
              </p>

              <span className="text-sm text-gray-500">
                Total Siswa:{" "}
                <span className="font-bold">{summary.totalSiswa}</span>
              </span>

              <span className="text-sm text-gray-500">
                Lengkap:{" "}
                <span className="font-bold text-green-600">
                  {summary.sudahLengkap}
                </span>
              </span>

              <span className="text-sm text-gray-500">
                Belum Lengkap:{" "}
                <span className="font-bold text-red-500">
                  {summary.belumLengkap}
                </span>
              </span>

              <span className="text-sm text-gray-500">
                Rata-rata:{" "}
                <span className="font-bold text-blue-600">
                  {summary.rataRata}
                </span>
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                type="button"
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold"
              >
                Reset
              </button>

              <button
                onClick={handleExportExcel}
                type="button"
                disabled={!selectedKelas || siswaList.length === 0}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold"
              >
                📥 Export Excel
              </button>
            </div>
          </div>
        </div>

        {selectedKelas && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">
                Daftar Siswa — {selectedKelasObj?.nama_kelas || "-"}
              </h2>
              <p className="text-xs text-gray-400">
                Isi nilai praktik, sikap, dan laporan untuk setiap siswa.
              </p>
            </div>

            {loadingSiswa ? (
              <div className="py-12 text-center text-gray-400">
                Memuat daftar siswa...
              </div>
            ) : siswaList.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                Tidak ada siswa di kelas ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-left">NISN</th>
                      <th className="px-5 py-3 text-center">Praktik</th>
                      <th className="px-5 py-3 text-center">Sikap</th>
                      <th className="px-5 py-3 text-center">Laporan</th>
                      <th className="px-5 py-3 text-center">Nilai Akhir</th>
                      <th className="px-5 py-3 text-center">Predikat</th>
                      <th className="px-5 py-3 text-left">Catatan</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {siswaList.map((siswa, index) => {
                      const row = nilaiMap[siswa.id] || {};
                      const akhir = hitungNilaiAkhir(row);

                      return (
                        <tr key={siswa.id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3 text-gray-500">
                            {index + 1}
                          </td>

                          <td className="px-5 py-3 font-semibold text-gray-800">
                            {row.nama_siswa ||
                              siswa.nama_lengkap ||
                              siswa.nama_siswa ||
                              "-"}
                          </td>

                          <td className="px-5 py-3 text-gray-500">
                            {row.nisn || siswa.nisn || "-"}
                          </td>

                          {[
                            "nilai_praktik",
                            "nilai_sikap",
                            "nilai_laporan",
                          ].map((field) => (
                            <td key={field} className="px-5 py-3">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={row[field] ?? ""}
                                onChange={(e) =>
                                  updateNilai(siswa.id, field, e.target.value)
                                }
                                className="w-24 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0-100"
                              />
                            </td>
                          ))}

                          <td className="px-5 py-3 text-center">
                            <span className={`font-bold ${getColor(akhir)}`}>
                              {akhir.toFixed(2)}
                            </span>
                          </td>

                          <td className="px-5 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeColor(
                                akhir,
                              )}`}
                            >
                              {getPredikat(akhir)}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            <input
                              type="text"
                              value={row.catatan || ""}
                              onChange={(e) =>
                                updateNilai(siswa.id, "catatan", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Opsional"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {siswaList.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSimpan}
                  disabled={saving}
                  className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow transition-all"
                >
                  {saving ? "Menyimpan..." : "💾 Simpan Nilai PKL"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
