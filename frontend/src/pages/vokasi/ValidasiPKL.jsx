import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { vocationalApi } from "../../api/vocationalApi";

const ValidasiPKL = ({ submissionId, studentName, companyName, onRefresh }) => {
  const [isLayak, setIsLayak] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await vocationalApi.approvePKL({
        pkl_id: submissionId,
        status_kelayakan: isLayak ? "layak" : "tidak_layak",
        catatan: catatan,
      });
      alert("Status kelayakan dan persetujuan berhasil disimpan.");
      if (onRefresh) onRefresh();
    } catch (error) {
      alert("Gagal memproses validasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Validasi Tempat PKL
      </h2>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Siswa:{" "}
          <span className="font-semibold text-gray-900">{studentName}</span>
        </p>
        <p className="text-sm text-gray-600">
          Perusahaan:{" "}
          <span className="font-semibold text-gray-900">{companyName}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kelayakan Tempat:
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIsLayak(true)}
              className={`px-4 py-2 rounded-lg border ${isLayak ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-50"}`}
            >
              Layak (Setujui)
            </button>
            <button
              onClick={() => setIsLayak(false)}
              className={`px-4 py-2 rounded-lg border ${!isLayak ? "bg-red-100 border-red-500 text-red-700" : "bg-gray-50"}`}
            >
              Tidak Layak (Tolak)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catatan Guru:
          </label>
          <textarea
            className="w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500"
            placeholder="Berikan alasan kelayakan atau ketidaklayakan..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Memproses..." : "Simpan Keputusan"}
        </Button>
      </div>
    </div>
  );
};

export default ValidasiPKL;
