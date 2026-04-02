import { useState } from "react";
import toast from "react-hot-toast";

const JENIS_KEGIATAN = ["Latihan Rutin", "Perkemahan", "Lomba", "Bakti Sosial", "Pelantikan", "Lainnya"];

export default function SilabusKegiatanPage() {
  const [kegiatan, setKegiatan] = useState([
    { id:1, nama:"Latihan Baris-Berbaris", jenis:"Latihan Rutin", tanggal:"2025-01-06", deskripsi:"Latihan PBB mingguan", status:"Selesai" },
    { id:2, nama:"Perkemahan Sabtu-Minggu", jenis:"Perkemahan", tanggal:"2025-02-15", deskripsi:"Kemah 2 hari di bukit sigumpar", status:"Direncanakan" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama:"", jenis:"Latihan Rutin", tanggal:"", deskripsi:"" });

  const handleTambah = () => {
    if (!form.nama||!form.tanggal) { toast.error("Nama dan tanggal wajib diisi"); return; }
    setKegiatan(p=>[...p,{...form, id:Date.now(), status:"Direncanakan"}]);
    setForm({nama:"",jenis:"Latihan Rutin",tanggal:"",deskripsi:""});
    setShowForm(false);
    toast.success("Kegiatan berhasil ditambahkan!");
  };

  const STATUS_COLOR = { "Selesai":"bg-green-100 text-green-700","Direncanakan":"bg-blue-100 text-blue-700","Berjalan":"bg-yellow-100 text-yellow-700" };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">SILABUS & KEGIATAN</h1><p className="text-sm text-gray-500 mt-0.5">Kelola program dan kegiatan pramuka</p></div>
      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h2 className="font-bold text-gray-700">Tambah Kegiatan Baru</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nama Kegiatan</label><input type="text" value={form.nama} onChange={e=>setForm(p=>({...p,nama:e.target.value}))} placeholder="Nama kegiatan..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Jenis</label><select value={form.jenis} onChange={e=>setForm(p=>({...p,jenis:e.target.value}))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">{JENIS_KEGIATAN.map(j=><option key={j}>{j}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label><input type="date" value={form.tanggal} onChange={e=>setForm(p=>({...p,tanggal:e.target.value}))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deskripsi</label><input type="text" value={form.deskripsi} onChange={e=>setForm(p=>({...p,deskripsi:e.target.value}))} placeholder="Deskripsi singkat..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
            </div>
            <div className="flex justify-end gap-2"><button onClick={()=>setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Batal</button><button onClick={handleTambah} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm">Simpan</button></div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Daftar Kegiatan Pramuka</h2>
            <button onClick={()=>setShowForm(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm">+ Tambah Kegiatan</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"><tr><th className="px-5 py-3 text-left">Nama Kegiatan</th><th className="px-5 py-3 text-left">Jenis</th><th className="px-5 py-3 text-left">Tanggal</th><th className="px-5 py-3 text-left">Deskripsi</th><th className="px-5 py-3 text-center">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {kegiatan.map(k=>(
                <tr key={k.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3 font-semibold text-gray-800">{k.nama}</td>
                  <td className="px-5 py-3 text-gray-600">{k.jenis}</td>
                  <td className="px-5 py-3 text-gray-500">{k.tanggal}</td>
                  <td className="px-5 py-3 text-gray-500">{k.deskripsi}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[k.status]||"bg-gray-100 text-gray-600"}`}>{k.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}