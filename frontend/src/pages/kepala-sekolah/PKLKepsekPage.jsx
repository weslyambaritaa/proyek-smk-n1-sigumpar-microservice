import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { academicApi } from "../../api/academicApi";
import { vocationalApi } from "../../api/vocationalApi";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  const base = axiosInstance.defaults.baseURL || "";
  return base ? `${base}${foto_url}` : foto_url;
}

function formatTanggal(tanggal) {
  if (!tanggal) return "—";
  try {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return tanggal; }
}

const calcAkhir = (r) =>
  (Number(r.nilai_praktik) * 0.4 + Number(r.nilai_sikap) * 0.3 + Number(r.nilai_laporan) * 0.3).toFixed(1);

export default function PKLKepsekPage() {
  const [kelasList,     setKelasList]     = useState([]);
  const [siswaList,     setSiswaList]     = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [lokasiData,    setLokasiData]    = useState([]);
  const [progresData,   setProgresData]   = useState([]);
  const [nilaiData,     setNilaiData]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [sudahCari,     setSudahCari]     = useState(false);
  const [previewSrc,    setPreviewSrc]    = useState(null);
  const [activeTab,     setActiveTab]     = useState("rekap");

  useEffect(() => {
    academicApi.getAllKelas()
      .then(r => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => toast.error("Gagal memuat daftar kelas"));
  }, []);

  useEffect(() => {
    if (!selectedKelas) { setSiswaList([]); return; }
    academicApi.getAllSiswa({ kelas_id: selectedKelas })
      .then(r => setSiswaList(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : [])))
      .catch(() => {});
  }, [selectedKelas]);

  const getNamaSiswa = (siswa_id, fallback) => {
    if (!siswa_id) return fallback || "—";
    const found = siswaList.find(s => String(s.id) === String(siswa_id));
    return found?.nama_lengkap || fallback || "—";
  };

  const handleCari = async () => {
    if (!selectedKelas) { toast.error("Pilih kelas terlebih dahulu"); return; }
    setLoading(true); setSudahCari(true);
    try {
      const [lokasiRes, progresRes, nilaiRes, siswaRes] = await Promise.all([
        vocationalApi.getAllLokasiPKL(),
        vocationalApi.getAllProgresPKL(),
        vocationalApi.getNilaiPKL({ kelas_id: selectedKelas }),
        academicApi.getAllSiswa({ kelas_id: selectedKelas }),
      ]);

      const allSiswa = Array.isArray(siswaRes.data?.data) ? siswaRes.data.data
        : (Array.isArray(siswaRes.data) ? siswaRes.data : []);
      setSiswaList(allSiswa);
      const siswaIds = new Set(allSiswa.map(s => String(s.id)));
      const siswaNames = new Set(allSiswa.map(s => s.nama_lengkap));

      const lokasi = (Array.isArray(lokasiRes.data?.data) ? lokasiRes.data.data : [])
        .filter(d =>
          (d.kelas_id && String(d.kelas_id) === String(selectedKelas)) ||
          siswaIds.has(String(d.siswa_id)) ||
          (d.nama_siswa && siswaNames.has(d.nama_siswa))
        );

      const lokasiSiswaIds = new Set(lokasi.map(d => String(d.siswa_id)));
      const progres = (Array.isArray(progresRes.data?.data) ? progresRes.data.data : [])
        .filter(p => siswaIds.has(String(p.siswa_id)) || lokasiSiswaIds.has(String(p.siswa_id)));

      const nilaiRaw = Array.isArray(nilaiRes.data?.data) ? nilaiRes.data.data : [];
      const nilai = allSiswa.map(s => {
        const existing = nilaiRaw.find(n => String(n.siswa_id) === String(s.id)) || {};
        return {
          siswa_id:      s.id,
          nama_lengkap:  s.nama_lengkap,
          nisn:          s.nisn,
          nilai_praktik: existing.nilai_praktik ?? null,
          nilai_sikap:   existing.nilai_sikap   ?? null,
          nilai_laporan: existing.nilai_laporan ?? null,
          sudah_diinput: !!existing.siswa_id,
        };
      });

      setLokasiData(lokasi);
      setProgresData(progres);
      setNilaiData(nilai);
    } catch (err) {
      toast.error("Gagal memuat data PKL");
    } finally { setLoading(false); }
  };

  const progresPerSiswa = progresData.reduce((acc, p) => {
    const key = String(p.siswa_id);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const namaKelas = kelasList.find(k => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  const stats = {
    totalSiswa:   siswaList.length,
    sudahLokasi:  lokasiData.length,
    sudahProgres: new Set(progresData.map(p => String(p.siswa_id))).size,
    sudahNilai:   nilaiData.filter(n => n.sudah_diinput).length,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {previewSrc && (
        <ImagePreviewModal src={previewSrc} fileName="Foto Lokasi PKL" onClose={() => setPreviewSrc(null)} />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">MONITORING PKL</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Terintegrasi dengan data Tata Usaha (siswa & kelas) dan laporan Vokasi
        </p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas
              </label>
              <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
            </div>
            <button onClick={handleCari} disabled={loading || !selectedKelas}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors">
              {loading ? "Memuat..." : "🔍 Tampilkan Data"}
            </button>
          </div>
        </div>

        {sudahCari && !loading && (
          <>
            {/* Statistik */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Siswa",        val: stats.totalSiswa,   cls: "bg-white border border-gray-200",             icon: "👥" },
                { label: "Input Lokasi PKL",   val: stats.sudahLokasi,  cls: "bg-blue-50 border border-blue-200 text-blue-700",     icon: "🏭" },
                { label: "Buat Laporan",       val: stats.sudahProgres, cls: "bg-green-50 border border-green-200 text-green-700",  icon: "📋" },
                { label: "Sudah Dinilai",      val: stats.sudahNilai,   cls: "bg-purple-50 border border-purple-200 text-purple-700", icon: "📊" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-4 text-center shadow-sm ${s.cls}`}>
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold">{s.val}</p>
                  <p className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 -mt-2">
              Kelas: <span className="font-semibold text-gray-600">{namaKelas}</span>
              {" · "}Sumber data: Tata Usaha & Vokasi
            </p>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "rekap",   label: "📈 Rekap Siswa",     count: siswaList.length },
                { key: "lokasi",  label: "🏭 Lokasi PKL",      count: lokasiData.length },
                { key: "progres", label: "📋 Laporan Progres",  count: progresData.length },
                { key: "nilai",   label: "📊 Nilai PKL",        count: nilaiData.filter(n => n.sudah_diinput).length },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                    activeTab === t.key ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? "bg-blue-500" : "bg-gray-100 text-gray-500"}`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab: Rekap Siswa */}
            {activeTab === "rekap" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Rekap Status PKL — {namaKelas}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Semua siswa dari Tata Usaha beserta status kelengkapan PKL</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Nama Siswa</th>
                        <th className="px-4 py-3 text-left">NISN</th>
                        <th className="px-4 py-3 text-center">Lokasi PKL</th>
                        <th className="px-4 py-3 text-center">Laporan Progres</th>
                        <th className="px-4 py-3 text-center">Nilai PKL</th>
                        <th className="px-4 py-3 text-center">Status Lengkap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {siswaList.map((s, i) => {
                        const hasLokasi  = lokasiData.some(d => String(d.siswa_id) === String(s.id) || d.nama_siswa === s.nama_lengkap);
                        const jumlahProgres = progresPerSiswa[String(s.id)] || 0;
                        const nilaiSiswa = nilaiData.find(n => String(n.siswa_id) === String(s.id));
                        const hasNilai   = nilaiSiswa?.sudah_diinput;
                        const isLengkap  = hasLokasi && jumlahProgres > 0 && hasNilai;
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{s.nama_lengkap}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{s.nisn || "—"}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hasLokasi ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {hasLokasi ? "✓ Sudah" : "✗ Belum"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {jumlahProgres > 0
                                ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ {jumlahProgres} Minggu</span>
                                : <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">✗ Belum</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-center">
                              {hasNilai
                                ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ {calcAkhir(nilaiSiswa)}</span>
                                : <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">✗ Belum</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isLengkap ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                                {isLengkap ? "✓ Lengkap" : "Belum Lengkap"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Lokasi PKL */}
            {activeTab === "lokasi" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Lokasi PKL — {namaKelas}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Diinput oleh siswa melalui role Vokasi</p>
                </div>
                {lokasiData.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">🏭</p>
                    <p>Belum ada siswa yang menginput lokasi PKL</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">No</th>
                          <th className="px-4 py-3 text-left">Foto</th>
                          <th className="px-4 py-3 text-left">Nama Siswa</th>
                          <th className="px-4 py-3 text-left">Perusahaan</th>
                          <th className="px-4 py-3 text-left">Posisi</th>
                          <th className="px-4 py-3 text-left">Pembimbing</th>
                          <th className="px-4 py-3 text-center">Laporan</th>
                          <th className="px-4 py-3 text-left">Tgl Mulai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {lokasiData.map((d, i) => (
                          <tr key={d.id || i} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3">
                              {d.foto_url ? (
                                <img src={getFullFotoUrl(d.foto_url)} alt="Foto"
                                  onClick={() => setPreviewSrc(getFullFotoUrl(d.foto_url))}
                                  className="w-12 h-12 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-all"
                                  onError={e => { e.currentTarget.style.display = "none"; }} />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">📷</div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{getNamaSiswa(d.siswa_id, d.nama_siswa)}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{d.nama_perusahaan || "—"}</td>
                            <td className="px-4 py-3">
                              {d.posisi
                                ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{d.posisi}</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">{d.pembimbing_industri || "—"}</td>
                            <td className="px-4 py-3 text-center">
                              {progresPerSiswa[String(d.siswa_id)] > 0
                                ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">{progresPerSiswa[String(d.siswa_id)]} Minggu</span>
                                : <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">Belum</span>}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">{formatTanggal(d.tanggal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Laporan Progres */}
            {activeTab === "progres" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Laporan Progres PKL — {namaKelas}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Diinput oleh siswa melalui role Vokasi</p>
                </div>
                {progresData.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">📋</p>
                    <p>Belum ada laporan progres dari kelas ini</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">No</th>
                          <th className="px-4 py-3 text-left">Nama Siswa</th>
                          <th className="px-4 py-3 text-center">Minggu Ke</th>
                          <th className="px-4 py-3 text-left">Deskripsi Kegiatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {progresData.map((p, i) => (
                          <tr key={p.id || i} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{getNamaSiswa(p.siswa_id, p.nama_siswa)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-xs">Minggu {p.minggu_ke}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{p.deskripsi || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Nilai PKL */}
            {activeTab === "nilai" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Nilai PKL — {namaKelas}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Diinput oleh guru melalui role Vokasi · Bobot: Praktik 40% · Sikap 30% · Laporan 30%</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Nama Siswa</th>
                        <th className="px-4 py-3 text-left">NISN</th>
                        <th className="px-4 py-3 text-center">Praktik</th>
                        <th className="px-4 py-3 text-center">Sikap</th>
                        <th className="px-4 py-3 text-center">Laporan</th>
                        <th className="px-4 py-3 text-center">Nilai Akhir</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {nilaiData.map((n, i) => {
                        const akhir = n.sudah_diinput ? calcAkhir(n) : null;
                        return (
                          <tr key={n.siswa_id} className={`hover:bg-gray-50/70 ${!n.sudah_diinput ? "opacity-50" : ""}`}>
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{n.nama_lengkap}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{n.nisn || "—"}</td>
                            <td className="px-4 py-3 text-center font-medium">{n.nilai_praktik ?? "—"}</td>
                            <td className="px-4 py-3 text-center font-medium">{n.nilai_sikap ?? "—"}</td>
                            <td className="px-4 py-3 text-center font-medium">{n.nilai_laporan ?? "—"}</td>
                            <td className="px-4 py-3 text-center">
                              {akhir
                                ? <span className={`font-bold text-base ${Number(akhir) >= 75 ? "text-blue-600" : "text-red-500"}`}>{akhir}</span>
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                !n.sudah_diinput ? "bg-gray-100 text-gray-500"
                                  : Number(akhir) >= 75 ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {!n.sudah_diinput ? "Belum Dinilai" : Number(akhir) >= 75 ? "Tuntas" : "Belum Tuntas"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {!sudahCari && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-16 text-center text-gray-400">
            <p className="text-4xl mb-2">🏭</p>
            <p className="font-medium text-gray-600">Pilih Kelas dan klik Tampilkan Data</p>
            <p className="text-sm mt-1">Data terintegrasi dari <strong>Tata Usaha</strong> (siswa & kelas), <strong>Vokasi Siswa</strong> (lokasi & progres), dan <strong>Guru Vokasi</strong> (nilai PKL)</p>
          </div>
        )}
      </div>
    </div>
  );
}