import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import { academicApi } from "../../api/academicApi";

const calcAkhir = (r) =>
  (Number(r.nilai_praktik) * 0.4 + Number(r.nilai_sikap) * 0.3 + Number(r.nilai_laporan) * 0.3).toFixed(1);

export default function NilaiPKLPage() {
  const [kelasList,     setKelasList]     = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [sudahCari,     setSudahCari]     = useState(false);
  const [riwayat,       setRiwayat]       = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [showRiwayat,   setShowRiwayat]   = useState(false);

  const namaKelas = kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  useEffect(() => {
    academicApi.getAllKelas()
      .then((r) => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
  }, []);

  const handleCari = async () => {
    if (!selectedKelas) return toast.error("Pilih kelas terlebih dahulu");
    setLoading(true); setSudahCari(true);
    try {
      const [siswaRes, nilaiRes] = await Promise.all([
        academicApi.getAllSiswa({ kelas_id: selectedKelas }),
        vocationalApi.getNilaiPKL({ kelas_id: selectedKelas }),
      ]);
      const allSiswa = Array.isArray(siswaRes.data?.data) ? siswaRes.data.data : (Array.isArray(siswaRes.data) ? siswaRes.data : []);
      const nilaiData = nilaiRes.data?.data || [];

      setRows(allSiswa.map((s) => {
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
    } catch { toast.error("Gagal memuat data siswa"); }
    finally { setLoading(false); }
  };

  const handleChange = (idx, field, val) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };

  const handleSimpan = async () => {
    if (!selectedKelas) return;
    setSaving(true);
    try {
      await vocationalApi.saveNilaiPKLBulk({
        kelas_id: selectedKelas,
        nilai: rows.map((r) => ({
          siswa_id:      r.siswa_id,
          nilai_praktik: Number(r.nilai_praktik),
          nilai_sikap:   Number(r.nilai_sikap),
          nilai_laporan: Number(r.nilai_laporan),
        })),
      });
      toast.success("Nilai PKL berhasil disimpan!");
      if (showRiwayat) loadRiwayat();
    } catch { toast.error("Gagal menyimpan nilai PKL"); }
    finally { setSaving(false); }
  };

  const loadRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const params = {};
      if (selectedKelas) params.kelas_id = selectedKelas;
      const res = await vocationalApi.getNilaiPKL(params);
      setRiwayat(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setRiwayat([]); }
    finally { setLoadingRiwayat(false); }
  };

  const gradeColor = (v) =>
    Number(v) >= 75 ? "text-green-600" : Number(v) >= 60 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">INPUT NILAI PKL</h1>
        <p className="text-sm text-gray-500 mt-0.5">Input dan kelola nilai Praktik Kerja Lapangan siswa vokasi</p>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pilih Kelas</label>
              <div className="relative">
                <select value={selectedKelas} onChange={(e) => { setSelectedKelas(e.target.value); setSudahCari(false); }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
            </div>
            <button onClick={handleCari} disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95">
              {loading ? "..." : "Tampilkan"}
            </button>
            <button onClick={() => { setShowRiwayat(!showRiwayat); if (!showRiwayat) loadRiwayat(); }}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              {showRiwayat ? "Tutup Riwayat" : "Lihat Riwayat Nilai"}
            </button>
          </div>
        </div>

        {/* Input Nilai */}
        {sudahCari && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-800">
                    Daftar Nilai PKL{namaKelas && <span className="font-normal text-gray-500"> — {namaKelas}</span>}
                  </h2>
                  {rows.length > 0 && <p className="text-xs text-gray-400 mt-0.5">{rows.length} siswa</p>}
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                  Bobot: Praktik 40% · Sikap 30% · Laporan 30%
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
                  <p className="text-sm mt-1">Pastikan kelas sudah memiliki data siswa dari Tata Usaha.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                          <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{r.nama_lengkap}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{r.nisn || "—"}</td>
                          {["nilai_praktik", "nilai_sikap", "nilai_laporan"].map((field) => (
                            <td key={field} className="px-4 py-3 text-center">
                              <input type="number" min={0} max={100} value={r[field]}
                                onChange={(e) => handleChange(i, field, e.target.value)}
                                className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold text-lg ${gradeColor(akhir)}`}>{akhir}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {rows.length > 0 && (
              <div className="flex justify-end">
                <button onClick={handleSimpan} disabled={saving}
                  className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 disabled:opacity-60 transition-all active:scale-95">
                  {saving ? "MENYIMPAN..." : "SIMPAN SEMUA NILAI PKL"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Riwayat Nilai */}
        {showRiwayat && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Riwayat Nilai PKL Tersimpan</h2>
              <button onClick={loadRiwayat} className="text-xs text-blue-600 hover:underline">Refresh</button>
            </div>
            {loadingRiwayat ? (
              <div className="py-12 text-center text-gray-400">Memuat...</div>
            ) : riwayat.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📊</p>
                <p>Belum ada nilai PKL yang tersimpan</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">No</th>
                    <th className="px-4 py-3 text-left">Nama Siswa</th>
                    <th className="px-4 py-3 text-center">Praktik</th>
                    <th className="px-4 py-3 text-center">Sikap</th>
                    <th className="px-4 py-3 text-center">Laporan</th>
                    <th className="px-4 py-3 text-center">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {riwayat.map((r, i) => {
                    const akhir = calcAkhir(r);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{r.nama_siswa || `Siswa #${r.siswa_id}`}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{r.nilai_praktik}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{r.nilai_sikap}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{r.nilai_laporan}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-base ${gradeColor(akhir)}`}>{akhir}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
