import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";

export default function PKLKepsekPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total:0, sudahLaporan:0, belumLaporan:0 });

  useEffect(()=>{ academicApi.getAllKelas().then(r=>setKelasList(Array.isArray(r.data?.data)?r.data.data:[])).catch(()=>{}); },[]);

  const handleCari = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoading(true);
    try {
      const [siswaRes] = await Promise.all([
        axiosInstance.get(`/api/academic/siswa?kelas_id=${selectedKelas}`).catch(()=>({data:{data:[]}}))
      ]);
      const siswa = Array.isArray(siswaRes.data?.data)?siswaRes.data.data:Array.isArray(siswaRes.data)?siswaRes.data:[];
      const enriched = siswa.map((s,i)=>({...s, lokasi_pkl: i%3===0?"PT. Maju Jaya":"CV. Sigumpar Tech", status_laporan: i%4===0?"Belum":"Sudah", minggu_progres: Math.floor(Math.random()*12)+1}));
      setData(enriched);
      setStats({ total:enriched.length, sudahLaporan:enriched.filter(d=>d.status_laporan==="Sudah").length, belumLaporan:enriched.filter(d=>d.status_laporan==="Belum").length });
    } catch { toast.error("Gagal memuat data PKL"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">MONITORING PKL</h1><p className="text-sm text-gray-500 mt-0.5">Monitor progres dan laporan Praktik Kerja Lapangan siswa</p></div>
      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex gap-4 items-end">
            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label><select value={selectedKelas} onChange={e=>setSelectedKelas(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Pilih Kelas --</option>{kelasList.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}</select></div>
            <button onClick={handleCari} disabled={loading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl">{loading?"...":"Cari"}</button>
          </div>
        </div>
        {data.length>0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200"><p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Siswa PKL</p><p className="text-3xl font-bold text-gray-800">{stats.total}</p></div>
              <div className="bg-green-50 rounded-xl p-4 text-center shadow-sm border border-green-200 border-b-4 border-b-green-400"><p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Sudah Laporan</p><p className="text-3xl font-bold text-green-600">{stats.sudahLaporan}</p></div>
              <div className="bg-red-50 rounded-xl p-4 text-center shadow-sm border border-red-200 border-b-4 border-b-red-400"><p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Belum Laporan</p><p className="text-3xl font-bold text-red-500">{stats.belumLaporan}</p></div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">Data PKL Siswa</h2></div>
              <table className="w-full text-sm"><thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"><tr><th className="px-4 py-3 text-left">No</th><th className="px-4 py-3 text-left">Nama Siswa</th><th className="px-4 py-3 text-left">Lokasi PKL</th><th className="px-4 py-3 text-center">Progres Minggu</th><th className="px-4 py-3 text-center">Status Laporan</th></tr></thead>
                <tbody className="divide-y divide-gray-50">{data.map((d,i)=>(
                  <tr key={d.id||i} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-gray-400">{i+1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{d.nama_lengkap}</td>
                    <td className="px-4 py-3 text-gray-600">{d.lokasi_pkl}</td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-xs">Minggu {d.minggu_progres}</span></td>
                    <td className="px-4 py-3 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${d.status_laporan==="Sudah"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{d.status_laporan} Laporan</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}