import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import { academicApi } from "../../api/academicApi";

const calcAkhir = (r) => (
  (Number(r.nilai_praktik) * 0.4 + Number(r.nilai_sikap) * 0.3 + Number(r.nilai_laporan) * 0.3)
).toFixed(1);

export default function NilaiPKLPage() {
  const [kelasList,    setKelasList]    = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [sudahCari,     setSudahCari]     = useState(false);

  useEffect(() => {
    academicApi.getAllKelas()
      .then((r) => setKelasList(Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) return toast.error("Pilih kelas terlebih dahulu");
    setLoading(true);
    setSudahCari(true);
    try {
      const res = await academicApi.getAllSiswa();
      const allSiswa = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      // Filter siswa in selected class
      const siswaKelas = allSiswa.filter((s) => String(s.kelas_id) === String(selectedKelas));

      // Fetch existing nilai PKL
      const nilaiRes = await vocationalApi.getNilaiPKL({ kelas_id: selectedKelas });
      const nilaiData = nilaiRes.data?.data || [];

      setRows(siswaKelas.map((s) => {
        const existing = nilaiData.find((n) => String(n.siswa_id) === String(s.id)) || {};
        return {
          siswa_id:       s.id,
          nama_lengkap:   s.nama_lengkap,
          nisn:           s.nisn,
          nilai_praktik:  existing.nilai_praktik ?? 0,
          nilai_sikap:    existing.nilai_sikap   ?? 0,
          nilai_laporan:  existing.nilai_laporan ?? 0,
        };
      }));
    } catch { toast.error("Gagal memuat data siswa"); }
    finally { setLoading(false); }
  };

  const handleChange = (idx, field, val) => {
    const v = Math.min(100, Math.max(0, Number(val) || 0));
    setRows((p) => p.map((r, i) => i === idx ? { ...r, [field]: v } : r));
  };

  const handleSimpan = async () => {
    setSaving(true);
    try {
      await vocationalApi.saveNilaiPKLBulk({
        kelas_id: selectedKelas,
        nilai: rows.map((r) => ({
          siswa_id:      r.siswa_id,
          nilai_praktik: Number(r.nilai_praktik) || 0,
          nilai_sikap:   Number(r.nilai_sikap)   || 0,
          nilai_laporan: Number(r.nilai_laporan) || 0,
        })),
      });
      toast.success("Nilai PKL berhasil disimpan!");
    } catch { toast.error("Gagal menyimpan nilai PKL"); }
    finally { setSaving(false); }
  };

  const namaKelas = kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">INPUT NILAI PKL</h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola nilai Praktik Kerja Lapangan siswa vokasi
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Bobot: Praktik 40% · Sikap 30% · Laporan 30%
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Kelas <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => { setSelectedKelas(e.target.value); setSudahCari(false); setRows([]); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCari} disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm disabled:opacity-60 transition-colors">
              {loading ? "Memuat..." : "CARI"}
            </button>
            <button
              onClick={() => { setSelectedKelas(""); setRows([]); setSudahCari(false); }}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-50">
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {sudahCari && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800">
                  Daftar Nilai PKL
                  {namaKelas && <span className="font-normal text-gray-500"> — {namaKelas}</span>}
                </h2>
                {rows.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{rows.length} siswa</p>
                )}
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                Bobot: 40% · 30% · 30%
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-400">
                <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p>Memuat data...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <div className="text-5xl mb-3">📋</div>
                <p className="font-medium">Tidak ada siswa di kelas ini</p>
                <p className="text-sm mt-1">Pastikan kelas sudah memiliki data siswa.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left w-10">No</th>
                      <th className="px-4 py-3 text-left">Nama Siswa</th>
                      <th className="px-4 py-3 text-left">NISN</th>
                      <th className="px-4 py-3 text-center w-28">Nilai Praktik<br/><span className="font-normal normal-case text-gray-400">(40%)</span></th>
                      <th className="px-4 py-3 text-center w-28">Nilai Sikap<br/><span className="font-normal normal-case text-gray-400">(30%)</span></th>
                      <th className="px-4 py-3 text-center w-28">Nilai Laporan<br/><span className="font-normal normal-case text-gray-400">(30%)</span></th>
                      <th className="px-4 py-3 text-center w-28">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((r, i) => {
                      const akhir = calcAkhir(r);
                      return (
                        <tr key={r.siswa_id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">{r.nama_lengkap}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{r.nisn}</td>
                          {["nilai_praktik", "nilai_sikap", "nilai_laporan"].map((field) => (
                            <td key={field} className="px-4 py-3 text-center">
                              <input
                                type="number" min={0} max={100}
                                value={r[field]}
                                onChange={(e) => handleChange(i, field, e.target.value)}
                                className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold text-lg ${
                              Number(akhir) >= 75 ? "text-blue-600" :
                              Number(akhir) >= 60 ? "text-yellow-600" : "text-red-500"
                            }`}>
                              {akhir}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {rows.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleSimpan}
                disabled={saving}
                className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 disabled:opacity-60 transition-all active:scale-95">
                {saving ? "MENYIMPAN..." : "SIMPAN SEMUA NILAI PKL"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
