import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { learningApi } from "../../api/learningApi";
import axiosInstance from "../../api/axiosInstance";

const JENIS_COLOR = { RPP:"bg-blue-100 text-blue-700", Silabus:"bg-green-100 text-green-700", Modul:"bg-purple-100 text-purple-700", Prota:"bg-yellow-100 text-yellow-700", Promes:"bg-orange-100 text-orange-700", Lainnya:"bg-gray-100 text-gray-600" };

export default function PemeriksaanPerangkatPage() {
  const [dokumen, setDokumen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMapel, setFilterMapel] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [mapelList, setMapelList] = useState([]);

  useEffect(()=>{
    setLoading(true);
    Promise.all([
      learningApi.getAllPerangkat().catch(()=>({data:{data:[]}})),
      axiosInstance.get("/api/academic/mapel").catch(()=>({data:{data:[]}}))
    ]).then(([dr, mr])=>{
      setDokumen(Array.isArray(dr.data?.data)?dr.data.data:[]);
      setMapelList(Array.isArray(mr.data?.data)?mr.data.data:Array.isArray(mr.data)?mr.data:[]);
    }).catch(()=>toast.error("Gagal memuat data"))
    .finally(()=>setLoading(false));
  },[]);

  const filtered = dokumen.filter(d=>
    (!filterJenis||d.jenis_dokumen===filterJenis)&&
    (!filterMapel||d.nama_dokumen?.toLowerCase().includes(filterMapel.toLowerCase()))
  );

  // Group by guru
  const byGuru = filtered.reduce((acc,d)=>{ const k=d.guru_id||"Tidak Diketahui"; if(!acc[k]) acc[k]={guru:d.guru_id,items:[]}; acc[k].items.push(d); return acc; },{});
  const jenisList = [...new Set(dokumen.map(d=>d.jenis_dokumen))];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5 text-center"><h1 className="text-2xl font-bold text-gray-800">PEMERIKSAAN PERANGKAT AJAR</h1><span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">SEMESTER GANJIL 2024/2025</span></div>
      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Jenis Dokumen</label><select value={filterJenis} onChange={e=>setFilterJenis(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Semua Jenis</option>{jenisList.map(j=><option key={j}>{j}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nama Dokumen</label><input type="text" value={filterMapel} onChange={e=>setFilterMapel(e.target.value)} placeholder="Cari nama dokumen..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
            <button onClick={()=>{setFilterJenis("");setFilterMapel("");}} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-semibold flex items-center gap-1">🔄 Reset Filter</button>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">Daftar Dokumen Perangkat Ajar</h2><span className="text-xs text-gray-400">* Klik informasi Mapel/Guru untuk melihat detail</span></div>
          {loading?<div className="py-16 text-center text-gray-400"><div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"/><p>Memuat data...</p></div>
          :filtered.length===0?<div className="py-16 text-center text-gray-400"><p className="text-4xl mb-2">📁</p><p>Belum ada dokumen perangkat ajar</p></div>
          :<table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"><tr><th className="px-5 py-3 text-left">No</th><th className="px-5 py-3 text-left">Nama Dokumen / Guru</th><th className="px-5 py-3 text-center">Jenis</th><th className="px-5 py-3 text-left">Tanggal Upload</th><th className="px-5 py-3 text-center">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d,i)=>(
                <tr key={d.id||i} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3 text-gray-400">{i+1}</td>
                  <td className="px-5 py-3"><p className="font-semibold text-gray-800">{d.nama_dokumen}</p><p className="text-xs text-blue-600">{d.guru_id||"Guru"}</p></td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${JENIS_COLOR[d.jenis_dokumen]||JENIS_COLOR["Lainnya"]}`}>{d.jenis_dokumen}</span></td>
                  <td className="px-5 py-3 text-gray-500">{d.tanggal_upload}</td>
                  <td className="px-5 py-3 text-center"><span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Lengkap</span></td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
      </div>
    </div>
  );
}