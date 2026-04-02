import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";
import keycloak from "../../keycloak";

const STATUS_OPTS = ["hadir", "sakit", "izin", "alpa", "terlambat"];
const STATUS_COLOR = { hadir:"bg-green-500 text-white", sakit:"bg-blue-500 text-white", izin:"bg-yellow-400 text-white", alpa:"bg-red-500 text-white", terlambat:"bg-orange-400 text-white" };

export default function PresensiKelasPage() {
  const guruId = keycloak.tokenParsed?.sub;
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0,10));
  const [siswaList, setSiswaList] = useState([]);
  const [absensi, setAbsensi] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

  useEffect(() => {
    academicApi.getAllKelas().then((res) => {
      const all = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setKelasList(all);
    }).catch(() => toast.error("Gagal memuat data kelas"));
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoading(true); setSudahCari(true);
    try {
      const [siswaRes, absRes] = await Promise.all([
        axiosInstance.get(`/api/academic/classes/${selectedKelas}/students`).catch(() => ({ data: [] })),
        axiosInstance.get(`/api/academic/absensi-siswa?kelas_id=${selectedKelas}&tanggal=${tanggal}`).catch(() => ({ data: { data: [] } }))
      ]);
      const siswa = Array.isArray(siswaRes.data) ? siswaRes.data : [];
      setSiswaList(siswa);
      const map = {};
      (Array.isArray(absRes.data?.data) ? absRes.data.data : []).forEach((a) => { map[a.siswa_id] = { status: a.status, keterangan: a.keterangan||"" }; });
      setAbsensi(map);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  };

  const setStatus = (id, status) => setAbsensi((p) => ({ ...p, [id]: { ...p[id], status, keterangan: p[id]?.keterangan||"" } }));
  const setKet = (id, keterangan) => setAbsensi((p) => ({ ...p, [id]: { ...p[id], keterangan } }));
  const tandaiSemua = (s) => { const m={}; siswaList.forEach((st) => { m[st.id_siswa??st.id]={status:s,keterangan:""}; }); setAbsensi(m); };
  const stats = useMemo(() => { const s={hadir:0,sakit:0,izin:0,alpa:0,terlambat:0}; Object.values(absensi).forEach((v)=>{ if(v?.status) s[v.status]=(s[v.status]||0)+1; }); return s; }, [absensi]);

  const handleSimpan = async () => {
    if (!selectedKelas||!tanggal) return;
    setSaving(true);
    try {
      for (const st of siswaList) {
        const id = st.id_siswa??st.id;
        const a = absensi[id]||{ status:"hadir", keterangan:"" };
        await axiosInstance.post("/api/academic/absensi-siswa", { siswa_id:id, tanggal, status:a.status||"hadir", keterangan:a.keterangan||null }).catch(()=>{});
      }
      toast.success("Presensi berhasil disimpan!");
    } catch { toast.error("Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const namaKelas = kelasList.find((k) => String(k.id)===String(selectedKelas))?.nama_kelas||"";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5"><h1 className="text-2xl font-bold text-gray-800">PRESENSI KELAS</h1><p className="text-sm text-gray-500 mt-0.5">Input kehadiran siswa untuk kelas Anda</p></div>
      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label><select value={selectedKelas} onChange={(e)=>setSelectedKelas(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Pilih Kelas --</option>{kelasList.map((k)=><option key={k.id} value={k.id}>{k.nama_kelas}</option>)}</select></div>
            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label><input type="date" value={tanggal} onChange={(e)=>setTanggal(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <button onClick={handleCari} disabled={loading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95">{loading?"...":"Cari"}</button>
          </div>
        </div>
        {sudahCari && siswaList.length>0 && (
          <div className="grid grid-cols-5 gap-3">
            {[{l:"Hadir",v:stats.hadir,c:"text-green-600",b:"border-green-400"},{l:"Sakit",v:stats.sakit,c:"text-blue-600",b:"border-blue-400"},{l:"Izin",v:stats.izin,c:"text-yellow-500",b:"border-yellow-400"},{l:"Alpa",v:stats.alpa,c:"text-red-500",b:"border-red-400"},{l:"Terlambat",v:stats.terlambat,c:"text-orange-500",b:"border-orange-400"}].map(({l,v,c,b})=>(
              <div key={l} className={`bg-white rounded-xl p-4 text-center shadow-sm border-b-4 ${b}`}><p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-3xl font-bold ${c}`}>{v}</p></div>
            ))}
          </div>
        )}
        {sudahCari && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Daftar Siswa{namaKelas&&<span className="text-gray-400 font-normal"> — {namaKelas}</span>}</h2>
              <div className="flex gap-1.5">{STATUS_OPTS.map((s)=><button key={s} onClick={()=>tandaiSemua(s)} className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${STATUS_COLOR[s]}`}>Semua {s}</button>)}</div>
            </div>
            {loading ? <div className="py-16 text-center text-gray-400"><div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"/><p>Memuat...</p></div>
            : siswaList.length===0 ? <div className="py-16 text-center text-gray-400"><p className="text-4xl mb-2">👥</p><p>Tidak ada siswa</p></div>
            : <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"><tr><th className="px-5 py-3 text-left w-10">No</th><th className="px-5 py-3 text-left">Nama Siswa</th><th className="px-5 py-3 text-left">NIS</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Keterangan</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {siswaList.map((st,i)=>{ const id=st.id_siswa??st.id; const curr=absensi[id]||{}; return (
                    <tr key={id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{i+1}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{st.namasiswa||st.nama_lengkap}</td>
                      <td className="px-5 py-3 text-gray-500">{st.nis||st.nisn}</td>
                      <td className="px-5 py-3">{curr.status?<span onClick={()=>{ const idx=STATUS_OPTS.indexOf(curr.status); setStatus(id,STATUS_OPTS[(idx+1)%STATUS_OPTS.length]); }} className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase cursor-pointer ${STATUS_COLOR[curr.status]}`}>{curr.status}</span>:<div className="flex flex-wrap gap-1">{STATUS_OPTS.map((s)=><button key={s} onClick={()=>setStatus(id,s)} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">{s}</button>)}</div>}</td>
                      <td className="px-5 py-3"><input type="text" value={curr.keterangan||""} onChange={(e)=>setKet(id,e.target.value)} placeholder="Catatan..." className="border border-gray-200 rounded-lg px-3 py-1 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-300"/></td>
                    </tr>
                  );})}
                </tbody>
              </table>
            }
            {!loading && siswaList.length>0 && <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50"><button onClick={handleSimpan} disabled={saving} className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95">{saving?"Menyimpan...":"Simpan Presensi"}</button></div>}
          </div>
        )}
      </div>
    </div>
  );
}
