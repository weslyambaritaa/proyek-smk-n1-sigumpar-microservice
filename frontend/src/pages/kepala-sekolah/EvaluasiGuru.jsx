// src/pages/kepala-sekolah/EvaluasiGuru.jsx
import React, { useState } from "react";
import { useEvaluasiGuru } from "../../hooks/useEvaluasiGuru";
import Swal from "sweetalert2";

const EvaluasiGuru = () => {
  const { data, loading, periode, setPeriode, saveEvaluasi, reload } =
    useEvaluasiGuru();
  const [nilaiInput, setNilaiInput] = useState({});

  const handleNilaiChange = (guruId, value) => {
    setNilaiInput((prev) => ({ ...prev, [guruId]: value }));
  };

  const handleSubmit = async (guruId, namaGuru) => {
    const nilai = parseFloat(nilaiInput[guruId]);
    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
      Swal.fire("Invalid", "Nilai harus antara 0 - 100", "error");
      return;
    }
    const { value: komentar } = await Swal.fire({
      title: `Komentar untuk ${namaGuru}`,
      input: "textarea",
      inputPlaceholder: "Tulis komentar (opsional)",
      showCancelButton: true,
      confirmButtonText: "Simpan",
    });
    await saveEvaluasi(guruId, nilai, komentar || "");
    setNilaiInput((prev) => ({ ...prev, [guruId]: "" }));
  };

  const periodeOptions = [
    "2024/2025 Ganjil",
    "2024/2025 Genap",
    "2025/2026 Ganjil",
    "2025/2026 Genap",
    "2026/2027 Ganjil",
    "2026/2027 Genap",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Evaluasi Kinerja Guru</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Periode Penilaian
          </label>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {periodeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={reload}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-center py-10">Memuat data...</div>}

      {!loading && data.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          Tidak ada data guru
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nama Guru</th>
                <th className="px-4 py-2 text-left">NIP</th>
                <th className="px-4 py-2 text-left">Mata Pelajaran</th>
                <th className="px-4 py-2 text-center">Nilai Sebelumnya</th>
                <th className="px-4 py-2 text-center">Nilai Baru (0-100)</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((guru) => (
                <tr key={guru.id_guru} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{guru.nama}</td>
                  <td className="px-4 py-2">{guru.nip || "-"}</td>
                  <td className="px-4 py-2">{guru.mapel_diampu || "-"}</td>
                  <td className="px-4 py-2 text-center">
                    {guru.evaluasi
                      ? `${guru.evaluasi.nilai_numerik} (${guru.evaluasi.nilai_huruf})`
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={nilaiInput[guru.id_guru] || ""}
                      onChange={(e) =>
                        handleNilaiChange(guru.id_guru, e.target.value)
                      }
                      className="w-24 px-2 py-1 border rounded-lg text-center"
                      placeholder="0-100"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleSubmit(guru.id_guru, guru.nama)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Simpan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EvaluasiGuru;
