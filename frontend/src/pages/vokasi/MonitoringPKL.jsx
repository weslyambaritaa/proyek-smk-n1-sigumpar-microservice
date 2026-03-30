import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { vocationalApi } from "../../api/vocationalApi";

const MonitoringPKL = ({ pklId, studentName }) => {
  const [progres, setProgres] = useState(0);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vocationalApi.submitMonitoring({
        pkl_id: pklId,
        catatan_kunjungan: catatan,
        progres_persen: progres,
      });
      alert("Data monitoring dan progres berhasil diperbarui.");
      setCatatan("");
    } catch (error) {
      alert("Gagal mengirim data monitoring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border-t-4 border-orange-500">
      <h2 className="text-xl font-bold mb-1 text-gray-800">
        Monitoring Kunjungan
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Memantau kegiatan: {studentName}
      </p>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700">
            <span>Capaian Progres Siswa</span>
            <span className="text-orange-600 font-bold">{progres}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            value={progres}
            onChange={(e) => setProgres(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasil Monitoring Lapangan:
          </label>
          <textarea
            className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="Deskripsikan perkembangan siswa di lokasi..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Mengirim..." : "Simpan Monitoring & Progres"}
        </Button>
      </form>
    </div>
  );
};

export default MonitoringPKL;
