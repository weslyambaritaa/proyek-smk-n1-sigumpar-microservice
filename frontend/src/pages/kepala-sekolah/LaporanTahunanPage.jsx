import { useState, useEffect } from "react";
import axios from "axios";

const LaporanTahunanPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/learning/kepsek/laporan-tahunan");
        setData(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-6">No data available</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Laporan Tahunan {data.tahun_ajar}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Ringkasan</h2>
          <p>Total Guru: {data.ringkasan.total_guru}</p>
          <p>Total Siswa: {data.ringkasan.total_siswa}</p>
          <p>Total Kelas: {data.ringkasan.total_kelas}</p>
          <p>Total Mata Pelajaran: {data.ringkasan.total_mapel}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Prestasi</h2>
          <p><strong>Akademik:</strong> {data.prestasi.akademik}</p>
          <p><strong>Non-Akademik:</strong> {data.prestasi.non_akademik}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Kegiatan Utama</h2>
          <ul className="list-disc list-inside">
            {data.kegiatan.map((kegiatan, index) => (
              <li key={index}>{kegiatan}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Rekomendasi</h2>
          <p>{data.rekomendasi}</p>
        </div>
      </div>
    </div>
  );
};

export default LaporanTahunanPage;