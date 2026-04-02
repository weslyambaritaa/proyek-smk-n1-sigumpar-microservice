import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";

export default function LaporanKegiatanPage() {
  const [laporan, setLaporan] = useState([]);
  const [form, setForm] = useState({ judul:"", deskripsi:"", tanggal:new Date().toISOString().slice(0,10) });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!form.judul) { toast.error("Judul laporan wajib diisi"); return; }
    setSaving(true);
    try {
      let fileUrl = null;
      if (file) {
        const fd = new FormData(); fd.append("file_laporan", file);
        const res = await vocationalApi.uploadFileLaporan(fd);
        fileUrl = res.data?.file_url;
      }
      setLaporan(p=>[{ id:Date.now(), ...form, file_url: fileUrl, file_nama: file?.name },...p]);
      setForm({ judul:"", deskripsi:"", tanggal:new Date().toISOString().slice(0,10) });
      setFile(null);
      if (fileRef.current) fileRef.current.value="";
      toast.success("Laporan berhasil disimpan!");
    } catch { toast.error("Gagal menyimpan laporan"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">LAPORAN KEGIATAN</h1><p className="text-sm text-gray-500 mt-0.5">Upload dan kelola laporan kegiatan pramuka</p></div>
      <div className="px-8 py-6 max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-700 mb-4">Input Laporan Baru</h2>
          <form onSubmit={handleSimpan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Judul Laporan</label><input type="text" value={form.judul} onChange={e=>setForm(p=>({...p,judul:e.target.value}))} required placeholder="Judul laporan kegiatan..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label><input type="date" value={form.tanggal} onChange={e=>setForm(p=>({...p,tanggal:e.target.value}))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deskripsi Kegiatan</label><textarea value={form.deskripsi} onChange={e=>setForm(p=>({...p,deskripsi:e.target.value}))} rows={3} placeholder="Deskripsi singkat kegiatan..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Upload File Laporan (opsional)</label><input type="file" ref={fileRef} accept=".pdf,.docx,.doc" onChange={e=>setFile(e.target.files[0]||null)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"/></div>
            <div className="flex justify-end"><button type="submit" disabled={saving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all">{saving?"Menyimpan...":"Simpan Laporan"}</button></div>
          </form>
        </div>
        {laporan.length>0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">Riwayat Laporan</h2></div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"><tr><th className="px-5 py-3 text-left">Judul</th><th className="px-5 py-3 text-left">Tanggal</th><th className="px-5 py-3 text-left">Deskripsi</th><th className="px-5 py-3 text-center">File</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {laporan.map(l=>(
                  <tr key={l.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 font-semibold text-gray-800">{l.judul}</td>
                    <td className="px-5 py-3 text-gray-500">{l.tanggal}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{l.deskripsi}</td>
                    <td className="px-5 py-3 text-center">{l.file_nama?<span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{l.file_nama}</span>:<span className="text-xs text-gray-400">-</span>}</td>
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