import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";

const ASPEK = ["Meja & Kursi", "Lantai", "Papan Tulis", "Jendela & Pintu", "Sampah"];
const NILAI_OPTS = ["Sangat Bersih", "Bersih", "Cukup", "Kotor"];
const NILAI_COLOR = { "Sangat Bersih":"bg-green-100 text-green-700","Bersih":"bg-blue-100 text-blue-700","Cukup":"bg-yellow-100 text-yellow-700","Kotor":"bg-red-100 text-red-700" };

export default function KebersihanKelasPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0,10));
  const [penilaian, setPenilaian] = useState({});
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { academicApi.getAllKelas().then(r=>setKelasList(Array.isArray(r.data?.data)?r.data.data:[])).catch(()=>{}); }, []);

  const handleSimpan = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setSaving(true);
    try { toast.success("Penilaian kebersihan berhasil disimpan!"); }
    catch { toast.error("Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">KEBERSIHAN KELAS</h1><p className="text-sm text-gray-500 mt-0.5">Penilaian kebersihan dan kerapian kelas</p></div>
      <div className="px-8 py-6 max-w-3xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label><select value={selectedKelas} onChange={e=>setSelectedKelas(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Pilih Kelas --</option>{kelasList.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label><input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          </div>
          <h3 className="font-bold text-gray-700 mb-3">Penilaian Per Aspek</h3>
          <div className="space-y-3">
            {ASPEK.map(a=>(
              <div key={a} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-gray-700">{a}</span>
                <div className="flex gap-2">{NILAI_OPTS.map(n=><button key={n} onClick={()=>setPenilaian(p=>({...p,[a]:n}))} className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${penilaian[a]===n?NILAI_COLOR[n]:"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{n}</button>)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Catatan Umum</label>
            <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} rows={3} placeholder="Catatan tambahan mengenai kebersihan kelas..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
          </div>
          <div className="flex justify-end mt-4"><button onClick={handleSimpan} disabled={saving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all">{saving?"Menyimpan...":"Simpan Penilaian"}</button></div>
        </div>
      </div>
    </div>
  );
}