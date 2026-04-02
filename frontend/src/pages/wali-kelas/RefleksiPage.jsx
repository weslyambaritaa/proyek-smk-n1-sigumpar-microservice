import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";

const REFLEKSI_TEMPLATE = [
  { id: "capaian", label: "Capaian Pembelajaran Minggu Ini", placeholder: "Apa yang berhasil dicapai siswa minggu ini?" },
  { id: "tantangan", label: "Tantangan yang Dihadapi", placeholder: "Apa kesulitan atau hambatan yang ditemui?" },
  { id: "rencana", label: "Rencana Tindak Lanjut", placeholder: "Apa langkah selanjutnya untuk meningkatkan pembelajaran?" },
];

export default function RefleksiPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [minggu, setMinggu] = useState(new Date().toISOString().slice(0,10));
  const [refleksi, setRefleksi] = useState({});
  const [saving, setSaving] = useState(false);
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => { academicApi.getAllKelas().then(r=>setKelasList(Array.isArray(r.data?.data)?r.data.data:[])).catch(()=>{}); }, []);

  const handleSimpan = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setSaving(true);
    try {
      const entry = { kelas_id: selectedKelas, tanggal: minggu, ...refleksi, id: Date.now() };
      setRiwayat(p=>[entry,...p]);
      setRefleksi({});
      toast.success("Refleksi berhasil disimpan!");
    } catch { toast.error("Gagal menyimpan refleksi"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">REFLEKSI</h1><p className="text-sm text-gray-500 mt-0.5">Catatan refleksi pembelajaran mingguan wali kelas</p></div>
      <div className="px-8 py-6 max-w-3xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label><select value={selectedKelas} onChange={e=>setSelectedKelas(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Pilih Kelas --</option>{kelasList.map(k=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal Minggu Ini</label><input type="date" value={minggu} onChange={e=>setMinggu(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          </div>
          {REFLEKSI_TEMPLATE.map(t=>(
            <div key={t.id}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t.label}</label>
              <textarea value={refleksi[t.id]||""} onChange={e=>setRefleksi(p=>({...p,[t.id]:e.target.value}))} placeholder={t.placeholder} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
            </div>
          ))}
          <div className="flex justify-end"><button onClick={handleSimpan} disabled={saving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all">{saving?"Menyimpan...":"Simpan Refleksi"}</button></div>
        </div>
        {riwayat.length>0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-700 mb-3">Riwayat Refleksi</h3>
            <div className="space-y-3">
              {riwayat.map(r=>(
                <div key={r.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Tanggal: {r.tanggal}</p>
                  {REFLEKSI_TEMPLATE.map(t=>r[t.id]&&<p key={t.id} className="text-sm text-gray-700 mb-1"><span className="font-semibold">{t.label}:</span> {r[t.id]}</p>)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}