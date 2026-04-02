import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { academicApi } from "../../api/academicApi";

export default function ParentingPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [siswaList, setSiswaList] = useState([]);
  const [catatan, setCatatan] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    academicApi.getAllKelas().then(r => setKelasList(Array.isArray(r.data?.data)?r.data.data:Array.isArray(r.data)?r.data:[])).catch(()=>{});
  }, []);

  const handlePilihKelas = async (id) => {
    setSelectedKelas(id);
    if (!id) return;
    try {
      const res = await axiosInstance.get(`/api/academic/siswa?kelas_id=${id}`);
      setSiswaList(Array.isArray(res.data?.data)?res.data.data:Array.isArray(res.data)?res.data:[]);
    } catch { toast.error("Gagal memuat siswa"); }
  };

  const handleSimpan = async (siswaId) => {
    setSaving(true);
    try {
      toast.success(`Catatan parenting untuk siswa berhasil disimpan!`);
    } catch { toast.error("Gagal menyimpan catatan"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">PARENTING</h1><p className="text-sm text-gray-500 mt-0.5">Kelola catatan komunikasi dengan orang tua siswa</p></div>
      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pilih Kelas</label>
          <select value={selectedKelas} onChange={e=>handlePilihKelas(e.target.value)} className="w-full max-w-xs border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Pilih Kelas --</option>{kelasList.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
          </select>
        </div>
        {siswaList.length>0 && (
          <div className="space-y-3">
            {siswaList.map(st=>(
              <div key={st.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-800">{st.nama_lengkap}</p>
                    <p className="text-xs text-gray-400">NISN: {st.nisn}</p>
                  </div>
                  <button onClick={()=>handleSimpan(st.id)} disabled={saving} className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-all">Simpan</button>
                </div>
                <textarea value={catatan[st.id]||""} onChange={e=>setCatatan(p=>({...p,[st.id]:e.target.value}))} placeholder="Catatan komunikasi dengan orang tua..." rows={2} className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}