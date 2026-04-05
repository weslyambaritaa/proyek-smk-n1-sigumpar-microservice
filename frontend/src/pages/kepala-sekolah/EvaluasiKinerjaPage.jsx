import { useState } from "react";
import toast from "react-hot-toast";

const KRITERIA = [
  { id:"perencanaan", label:"Perencanaan Pembelajaran", bobot:20 },
  { id:"pelaksanaan", label:"Pelaksanaan Pembelajaran", bobot:30 },
  { id:"penilaian", label:"Penilaian Hasil Belajar", bobot:20 },
  { id:"pengembangan", label:"Pengembangan Profesional", bobot:15 },
  { id:"disiplin", label:"Kedisiplinan", bobot:15 },
];

const GURU_CONTOH = [
  { id:1, nama:"Budi Santoso, S.Pd", mapel:"Matematika" },
  { id:2, nama:"Siti Aminah, M.Pd", mapel:"Bahasa Indonesia" },
  { id:3, nama:"Andi Wijaya, S.T", mapel:"Pemrograman Web" },
];

export default function EvaluasiKinerjaPage() {
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [nilai, setNilai] = useState({});
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasil, setHasil] = useState([]);

  const hitungTotal = () => KRITERIA.reduce((a,k)=>(a+(Number(nilai[k.id])||0)*k.bobot/100),0).toFixed(1);
  const getPredikat = (v) => Number(v)>=90?"Sangat Baik":Number(v)>=75?"Baik":Number(v)>=60?"Cukup":"Perlu Peningkatan";
  const getColor = (v) => Number(v)>=90?"text-green-600":Number(v)>=75?"text-blue-600":Number(v)>=60?"text-yellow-600":"text-red-500";

  const handleSimpan = async () => {
    if (!selectedGuru) { toast.error("Pilih guru terlebih dahulu"); return; }
    setSaving(true);
    try {
      const total = hitungTotal();
      setHasil(p=>[...p,{...selectedGuru, nilai: {...nilai}, total, predikat: getPredikat(total), catatan, id:Date.now()}]);
      setNilai({}); setCatatan(""); setSelectedGuru(null);
      toast.success("Evaluasi kinerja berhasil disimpan!");
    } catch { toast.error("Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">EVALUASI KINERJA GURU</h1><p className="text-sm text-gray-500 mt-0.5">Lakukan penilaian kinerja guru berdasarkan kriteria yang telah ditetapkan</p></div>
      <div className="px-8 py-6 max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pilih Guru</label>
            <select value={selectedGuru?.id||""} onChange={e=>{ const g=GURU_CONTOH.find(g=>String(g.id)===e.target.value); setSelectedGuru(g||null); }} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Pilih Guru --</option>{GURU_CONTOH.map(g=><option key={g.id} value={g.id}>{g.nama} — {g.mapel}</option>)}
            </select>
          </div>
          {selectedGuru && (
            <>
              <h3 className="font-bold text-gray-700">Penilaian Kriteria</h3>
              <div className="space-y-3">
                {KRITERIA.map(k=>(
                  <div key={k.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                    <div><p className="text-sm font-medium text-gray-700">{k.label}</p><p className="text-xs text-gray-400">Bobot: {k.bobot}%</p></div>
                    <input type="number" min="0" max="100" value={nilai[k.id]||""} onChange={e=>setNilai(p=>({...p,[k.id]:e.target.value}))} placeholder="0-100" className="w-24 text-center border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-bold text-gray-700">Nilai Akhir</span>
                <span className={`text-2xl font-bold ${getColor(hitungTotal())}`}>{hitungTotal()} <span className="text-sm font-semibold">({getPredikat(hitungTotal())})</span></span>
              </div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Catatan / Rekomendasi</label><textarea value={catatan} onChange={e=>setCatatan(e.target.value)} rows={3} placeholder="Catatan evaluasi dan rekomendasi pengembangan..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/></div>
              <div className="flex justify-end"><button onClick={handleSimpan} disabled={saving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm">{saving?"Menyimpan...":"Simpan Evaluasi"}</button></div>
            </>
          )}
        </div>
        {hasil.length>0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">Hasil Evaluasi</h2></div>
            <table className="w-full text-sm"><thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"><tr><th className="px-5 py-3 text-left">Guru</th><th className="px-5 py-3 text-left">Mapel</th><th className="px-5 py-3 text-center">Nilai</th><th className="px-5 py-3 text-center">Predikat</th></tr></thead>
              <tbody className="divide-y divide-gray-50">{hasil.map(h=>(
                <tr key={h.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3 font-semibold text-gray-800">{h.nama}</td><td className="px-5 py-3 text-gray-600">{h.mapel}</td>
                  <td className="px-5 py-3 text-center"><span className={`font-bold text-lg ${getColor(h.total)}`}>{h.total}</span></td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${Number(h.total)>=90?"bg-green-100 text-green-700":Number(h.total)>=75?"bg-blue-100 text-blue-700":Number(h.total)>=60?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{h.predikat}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}