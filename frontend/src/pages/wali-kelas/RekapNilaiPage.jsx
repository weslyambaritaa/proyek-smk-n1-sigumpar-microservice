import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";

export default function RekapNilaiPage() {
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [tahun, setTahun] = useState("2024/2025");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const TAHUN_OPTS = ["2023/2024","2024/2025","2025/2026"];

  useEffect(() => {
    Promise.all([academicApi.getAllKelas(), academicApi.getAllMapel()])
      .then(([kr, mr]) => {
        setKelasList(Array.isArray(kr.data?.data)?kr.data.data:Array.isArray(kr.data)?kr.data:[]);
        setMapelList(Array.isArray(mr.data?.data)?mr.data.data:Array.isArray(mr.data)?mr.data:[]);
      }).catch(()=>{});
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoading(true);
    try {
      const res = await academicApi.getSiswaByKelas({ kelas_id: selectedKelas, mapel_id: selectedMapel||undefined, tahun_ajar: tahun });
      setData(Array.isArray(res.data?.data)?res.data.data:[]);
    } catch { toast.error("Gagal memuat data nilai"); }
    finally { setLoading(false); }
  };

  const gradeColor = (v) => Number(v)>=75?"text-blue-600":Number(v)>=60?"text-yellow-600":"text-red-500";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">REKAP NILAI</h1><p className="text-sm text-gray-500 mt-0.5">Lihat rekap nilai siswa berdasarkan kelas dan mata pelajaran</p></div>
      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label><select value={selectedKelas} onChange={e=>setSelectedKelas(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Pilih Kelas --</option>{kelasList.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mata Pelajaran</label><select value={selectedMapel} onChange={e=>setSelectedMapel(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Semua Mapel</option>{mapelList.map(m=><option key={m.id} value={m.id}>{m.nama_mapel}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tahun Ajar</label><select value={tahun} onChange={e=>setTahun(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">{TAHUN_OPTS.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <button onClick={handleCari} disabled={loading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl">{loading?"...":"Cari"}</button>
          </div>
        </div>
        {data.length>0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">Rekap Nilai Siswa</h2></div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr><th className="px-4 py-3 text-left">No</th><th className="px-4 py-3 text-left">Nama Siswa</th><th className="px-4 py-3 text-center">Tugas</th><th className="px-4 py-3 text-center">Kuis</th><th className="px-4 py-3 text-center">UTS</th><th className="px-4 py-3 text-center">UAS</th><th className="px-4 py-3 text-center">Praktik</th><th className="px-4 py-3 text-center">Nilai Akhir</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((d,i)=>(
                  <tr key={i} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-gray-400">{i+1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{d.nama_lengkap}</td>
                    {["nilai_tugas","nilai_kuis","nilai_uts","nilai_uas","nilai_praktik"].map(f=><td key={f} className="px-4 py-3 text-center text-gray-600">{d[f]||0}</td>)}
                    <td className="px-4 py-3 text-center"><span className={`font-bold text-base ${gradeColor(d.nilai_akhir)}`}>{d.nilai_akhir||0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}