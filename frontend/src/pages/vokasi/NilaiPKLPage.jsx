import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import { academicApi } from "../../api/academicApi";

const calcAkhir = (r) =>
  (Number(r.nilai_praktik) * 0.4 + Number(r.nilai_sikap) * 0.3 + Number(r.nilai_laporan) * 0.3).toFixed(1);

const gradeLabel = (v) =>
  Number(v) >= 75 ? { label: "Tuntas", cls: "bg-green-100 text-green-700" } :
  Number(v) >= 60 ? { label: "Cukup",  cls: "bg-yellow-100 text-yellow-700" } :
                    { label: "Belum Tuntas", cls: "bg-red-100 text-red-700" };

export default function NilaiPKLPage() {
  const [kelasList,     setKelasList]     = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [sudahCari,     setSudahCari]     = useState(false);

  const namaKelas = kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  // Ambil kelas dari academic service
  useEffect(() => {
    academicApi.getAllKelas()
      .then((r) => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) return toast.error("Pilih kelas terlebih dahulu");
    setLoading(true); setSudahCari(true);
    try {
      // Ambil siswa dari tata usaha (academic service) dan nilai PKL dari vocational
      const [siswaRes, nilaiRes] = await Promise.all([
        academicApi.getAllSiswa({ kelas_id: selectedKelas }),
        vocationalApi.getNilaiPKL({ kelas_id: selectedKelas }),
      ]);

      const allSiswa = Array.isArray(siswaRes.data?.data)
        ? siswaRes.data.data
        : (Array.isArray(siswaRes.data) ? siswaRes.data : []);
      const nilaiData = nilaiRes.data?.data || [];

      // Merge: siswa dari tata usaha + nilai PKL yang sudah ada
      const safeList = Array.isArray(allSiswa) ? allSiswa : [];
      setRows(safeList.map((s) => {
        const existing = nilaiData.find((n) => String(n.siswa_id) === String(s.id)) || {};
        return {
          siswa_id:      s.id,
          nama_lengkap:  s.nama_lengkap,
          nisn:          s.nisn,
          nilai_praktik: existing.nilai_praktik ?? 0,
          nilai_sikap:   existing.nilai_sikap   ?? 0,
          nilai_laporan: existing.nilai_laporan ?? 0,
        };
      }));
    } catch (err) {
      toast.error("Gagal memuat data siswa: " + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (idx, field, val) => {
    const num = Math.min(100, Math.max(0, Number(val)));
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: num } : r));
  };

  const handleSimpan = async () => {
    if (!selectedKelas) return;
    setSaving(true);
    try {
      await vocationalApi.saveNilaiPKLBulk({
        kelas_id: selectedKelas,
        nilai: rows.map(r => ({
          siswa_id:      r.siswa_id,
          nama_siswa:    r.nama_lengkap,
          nilai_praktik: Number(r.nilai_praktik),
          nilai_sikap:   Number(r.nilai_sikap),
          nilai_laporan: Number(r.nilai_laporan),
        })),
      });
      toast.success("Nilai PKL berhasil disimpan!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (rows.length === 0) return;
    const header = ["No","NISN","Nama Siswa","Praktik","Sikap","Laporan","Nilai Akhir","Status"];
    const csvRows = [header.join(",")];
    rows.forEach((r, i) => {
      const na = calcAkhir(r);
      csvRows.push([i+1, r.nisn, r.nama_lengkap, r.nilai_praktik, r.nilai_sikap, r.nilai_laporan, na, gradeLabel(na).label].map(v => `"${v}"`).join(","));
    });
    const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `nilai-pkl-${namaKelas}-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("File Excel berhasil diunduh");
  };

  const rata2 = rows.length > 0
    ? (rows.reduce((s, r) => s + Number(calcAkhir(r)), 0) / rows.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">INPUT NILAI PKL</h1>
        <p className="text-sm text-gray-500 mt-0.5">Data siswa dari Tata Usaha — nilai disimpan di database</p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pilih Kelas</label>
              <select value={selectedKelas} onChange={(e) => { setSelectedKelas(e.target.value); setSudahCari(false); }}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
            </div>
            <button onClick={handleCari} disabled={loading || !selectedKelas}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all">
              {loading ? "Memuat..." : "🔍 Tampilkan Siswa"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3 bg-blue-50 rounded-lg px-3 py-2">
            💡 Daftar siswa diambil dari data Tata Usaha. Nilai PKL yang sudah diinput sebelumnya akan tampil otomatis.
          </p>
        </div>

        {/* Ringkasan */}
        {sudahCari && rows.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Siswa", val: rows.length, cls: "bg-white border text-gray-800" },
              { label: "Tuntas (≥75)", val: rows.filter(r => Number(calcAkhir(r)) >= 75).length, cls: "bg-green-50 border border-green-200 text-green-700" },
              { label: "Belum Tuntas", val: rows.filter(r => Number(calcAkhir(r)) < 75).length, cls: "bg-red-50 border border-red-200 text-red-700" },
              { label: "Rata-rata", val: rata2, cls: "bg-blue-50 border border-blue-200 text-blue-700" },
            ].map(({ label, val, cls }) => (
              <div key={label} className={`rounded-2xl p-4 text-center ${cls}`}>
                <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
                <p className="text-2xl font-bold">{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabel Input Nilai */}
        {sudahCari && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-800">Input Nilai PKL — {namaKelas}</h2>
                <p className="text-xs text-gray-400">Nilai praktik (40%) + sikap (30%) + laporan (30%)</p>
              </div>
              <div className="flex gap-2">
                {rows.length > 0 && (
                  <button onClick={handleExport}
                    className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-sm font-semibold transition-colors">
                    📊 Export Excel
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p>Memuat data dari Tata Usaha...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p>Tidak ada siswa di kelas ini</p>
                <p className="text-xs mt-2">Pastikan Tata Usaha sudah menginput data siswa</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Nama Siswa</th>
                        <th className="px-4 py-3 text-left">NISN</th>
                        <th className="px-4 py-3 text-center">Praktik (40%)</th>
                        <th className="px-4 py-3 text-center">Sikap (30%)</th>
                        <th className="px-4 py-3 text-center">Laporan (30%)</th>
                        <th className="px-4 py-3 text-center">Nilai Akhir</th>
                        <th className="px-4 py-3 text-center">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {rows.map((r, i) => {
                        const na = calcAkhir(r);
                        const { label, cls } = gradeLabel(na);
                        return (
                          <tr key={r.siswa_id} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{r.nama_lengkap}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{r.nisn}</td>
                            {["nilai_praktik","nilai_sikap","nilai_laporan"].map((f) => (
                              <td key={f} className="px-4 py-2 text-center">
                                <input type="number" min="0" max="100"
                                  value={r[f]}
                                  onChange={(e) => handleChange(i, f, e.target.value)}
                                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center font-bold text-base text-gray-800">{na}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button onClick={handleSimpan} disabled={saving}
                    className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow transition-all">
                    {saving ? "Menyimpan..." : "💾 Simpan Semua Nilai"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
