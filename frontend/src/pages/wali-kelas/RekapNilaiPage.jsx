import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";

const TAHUN_OPTS = ["2023/2024", "2024/2025", "2025/2026"];

export default function RekapNilaiPage() {
  const [kelasList,      setKelasList]      = useState([]);
  const [mapelList,      setMapelList]      = useState([]);
  const [selectedKelas,  setSelectedKelas]  = useState("");
  const [selectedMapel,  setSelectedMapel]  = useState("");
  const [tahun,          setTahun]          = useState("2024/2025");
  const [data,           setData]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [sudahCari,      setSudahCari]      = useState(false);
  const [mengkonfirmasi, setMengkonfirmasi] = useState(false);

  useEffect(() => {
    Promise.all([academicApi.getAllKelas(), academicApi.getAllMapel()])
      .then(([kr, mr]) => {
        setKelasList(Array.isArray(kr.data) ? kr.data : (kr.data?.data || []));
        setMapelList(Array.isArray(mr.data) ? mr.data : (mr.data?.data || []));
      }).catch(() => {});
  }, []);

  const mapelFiltered = mapelList.filter(
    (m) => !selectedKelas || String(m.kelas_id) === String(selectedKelas)
  );

  const handleCari = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoading(true); setSudahCari(true);
    try {
      const res = await academicApi.getRekapNilaiWali({
        kelas_id:  selectedKelas,
        mapel_id:  selectedMapel || undefined,
        tahun_ajar: tahun,
      });
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    try {
      await academicApi.exportNilaiExcel({
        kelas_id:  selectedKelas,
        mapel_id:  selectedMapel || undefined,
        tahun_ajar: tahun,
      });
      toast.success("File berhasil diunduh!");
    } catch {
      toast.error("Gagal mengunduh file. Silakan coba lagi.");
    }
  };

  const handleKonfirmasi = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    if (!window.confirm(
      "Konfirmasi rekap nilai ini ke Kepala Sekolah?\n\nSetelah dikonfirmasi, Kepala Sekolah dapat melihat nilai final siswa kelas ini."
    )) return;

    setMengkonfirmasi(true);
    try {
      await axiosInstance.post("/api/academic/kepsek/rekap-nilai-final/konfirmasi", {
        kelas_id:  selectedKelas,
        mapel_id:  selectedMapel || null,
        tahun_ajar: tahun,
      });
      toast.success("✅ Rekap nilai berhasil dikonfirmasi ke Kepala Sekolah!");
    } catch {
      toast.error("Gagal mengkonfirmasi rekap nilai. Silakan coba lagi.");
    } finally {
      setMengkonfirmasi(false);
    }
  };

  const gradeColor = (v) =>
    Number(v) >= 75 ? "text-green-600 font-bold" :
    Number(v) >= 60 ? "text-yellow-600 font-bold" : "text-red-500 font-bold";

  const gradeLabel = (v) =>
    Number(v) >= 75 ? "Tuntas" : Number(v) >= 60 ? "Cukup" : "Belum Tuntas";

  const namaKelas = kelasList.find(k => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">REKAP NILAI SISWA</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Data nilai siswa dari input guru mata pelajaran — terintegrasi langsung
        </p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kelas</label>
              <select value={selectedKelas}
                onChange={(e) => { setSelectedKelas(e.target.value); setSelectedMapel(""); setSudahCari(false); }}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mata Pelajaran</label>
              <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Mapel</option>
                {mapelFiltered.map((m) => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tahun Ajar</label>
              <select value={tahun} onChange={(e) => setTahun(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TAHUN_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCari} disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
                {loading ? "..." : "🔍 Cari"}
              </button>
              {sudahCari && data.length > 0 && (
                <>
                  <button onClick={handleExport}
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all"
                    title="Export ke Excel">
                    📊
                  </button>
                  <button
                    onClick={handleKonfirmasi}
                    disabled={mengkonfirmasi}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all whitespace-nowrap"
                    title="Konfirmasi rekap nilai ke Kepala Sekolah"
                  >
                    {mengkonfirmasi ? "..." : "✅ Konfirmasi"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ringkasan */}
        {sudahCari && data.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Siswa",  val: new Set(data.map(d => d.siswa_id)).size,                                        cls: "bg-white border text-gray-800" },
              { label: "Tuntas (≥75)", val: data.filter(d => Number(d.nilai_akhir) >= 75).length,                           cls: "bg-green-50 border border-green-200 text-green-700" },
              { label: "Belum Tuntas", val: data.filter(d => Number(d.nilai_akhir) < 75 && d.nilai_akhir !== null).length,  cls: "bg-red-50 border border-red-200 text-red-700" },
            ].map(({ label, val, cls }) => (
              <div key={label} className={`rounded-2xl p-4 text-center ${cls}`}>
                <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
                <p className="text-3xl font-bold">{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabel */}
        {sudahCari && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800">Rekap Nilai Siswa</h2>
                {namaKelas && <p className="text-xs text-gray-400">{namaKelas} • {tahun}</p>}
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{data.length} data</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p>Memuat data nilai...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">📊</p>
                <p className="font-medium">Belum ada data nilai</p>
                <p className="text-xs mt-2 text-gray-400">
                  Pastikan guru mata pelajaran sudah menginput nilai untuk kelas ini
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">No</th>
                      <th className="px-4 py-3 text-left">Nama Siswa</th>
                      <th className="px-4 py-3 text-left">Mapel</th>
                      <th className="px-4 py-3 text-center">Tugas</th>
                      <th className="px-4 py-3 text-center">Kuis</th>
                      <th className="px-4 py-3 text-center">UTS</th>
                      <th className="px-4 py-3 text-center">UAS</th>
                      <th className="px-4 py-3 text-center">Praktik</th>
                      <th className="px-4 py-3 text-center">Nilai Akhir</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{d.nama_lengkap}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{d.nama_mapel || "—"}</td>
                        {["nilai_tugas","nilai_kuis","nilai_uts","nilai_uas","nilai_praktik"].map((f) => (
                          <td key={f} className="px-4 py-3 text-center text-gray-600">{d[f] ?? 0}</td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span className={`text-base ${gradeColor(d.nilai_akhir)}`}>{d.nilai_akhir ?? 0}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            Number(d.nilai_akhir) >= 75 ? "bg-green-100 text-green-700" :
                            Number(d.nilai_akhir) >= 60 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>{gradeLabel(d.nilai_akhir)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}