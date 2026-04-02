import { useState, useEffect, useMemo } from "react";
import { vocationalApi } from "../../../api/vocationalApi";
import toast from "react-hot-toast";

const STATUS_OPTS = ["Hadir", "Izin", "Sakit", "Alpa"];
const STATUS_COLOR = {
  Hadir: "bg-green-500 text-white", Izin: "bg-yellow-400 text-white",
  Sakit: "bg-blue-500 text-white",  Alpa: "bg-red-500 text-white",
};

export default function AbsensiPramukaPage() {
  const [reguList,      setReguList]      = useState([]);
  const [selectedRegu,  setSelectedRegu]  = useState("");
  const [siswaAbsensi,  setSiswaAbsensi]  = useState([]);
  const [tanggal,       setTanggal]       = useState(new Date().toISOString().slice(0, 10));
  const [deskripsi,     setDeskripsi]     = useState("");
  const [fileLaporan,   setFileLaporan]   = useState(null);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [riwayat,       setRiwayat]       = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [showRiwayat,   setShowRiwayat]   = useState(false);

  useEffect(() => {
    vocationalApi.getAllRegu()
      .then((res) => setReguList(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Gagal memuat daftar regu"));
  }, []);

  useEffect(() => {
    if (!selectedRegu) { setSiswaAbsensi([]); return; }
    vocationalApi.getSiswaByRegu(selectedRegu)
      .then((res) => {
        const siswa = Array.isArray(res.data) ? res.data : [];
        setSiswaAbsensi(siswa.map((s) => ({ ...s, status_kehadiran: "Hadir" })));
      })
      .catch(() => toast.error("Gagal mengambil data siswa dari regu"));
  }, [selectedRegu]);

  const loadRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const params = {};
      if (selectedRegu) params.regu_id = selectedRegu;
      const res = await vocationalApi.getAbsensiPramuka(params);
      setRiwayat(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setRiwayat([]); }
    finally { setLoadingRiwayat(false); }
  };

  const stats = useMemo(() => {
    const s = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 };
    siswaAbsensi.forEach((x) => { if (x.status_kehadiran) s[x.status_kehadiran] = (s[x.status_kehadiran] || 0) + 1; });
    return s;
  }, [siswaAbsensi]);

  const setStatusSiswa = (id, status) =>
    setSiswaAbsensi((prev) => prev.map((s) => s.id === id ? { ...s, status_kehadiran: status } : s));

  const tandaiSemua = (status) =>
    setSiswaAbsensi((prev) => prev.map((s) => ({ ...s, status_kehadiran: status })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRegu) { toast.error("Pilih regu terlebih dahulu!"); return; }
    if (!deskripsi.trim()) { toast.error("Deskripsi laporan wajib diisi!"); return; }
    setIsSubmitting(true);
    let uploadedFileUrl = "";
    try {
      if (fileLaporan) {
        const fd = new FormData();
        fd.append("file_laporan", fileLaporan);
        const up = await vocationalApi.uploadFileLaporan(fd);
        uploadedFileUrl = up.data.file_url || "";
      }
      await vocationalApi.submitAbsensiPramuka({
        regu_id: selectedRegu, tanggal, deskripsi,
        file_url: uploadedFileUrl,
        data_absensi: siswaAbsensi.map((s) => ({ siswa_id: s.id, status: s.status_kehadiran })),
      });
      toast.success("Absensi & Laporan berhasil disimpan!");
      setDeskripsi("");
      setFileLaporan(null);
      document.getElementById("fileUploadInput") && (document.getElementById("fileUploadInput").value = "");
      if (showRiwayat) loadRiwayat();
    } catch { toast.error("Gagal menyimpan data absensi dan laporan"); }
    finally { setIsSubmitting(false); }
  };

  const namaRegu = reguList.find((r) => String(r.id) === String(selectedRegu))?.nama_regu || "";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ABSENSI PRAMUKA</h1>
        <p className="text-sm text-gray-500 mt-0.5">Laporan kehadiran anggota pramuka</p>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pilih Regu</label>
              <div className="relative">
                <select value={selectedRegu} onChange={(e) => setSelectedRegu(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Regu Pramuka --</option>
                  {reguList.map((r) => <option key={r.id} value={r.id}>{r.nama_regu}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="button"
              onClick={() => { setShowRiwayat(!showRiwayat); if (!showRiwayat) loadRiwayat(); }}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              {showRiwayat ? "Tutup Riwayat" : "Lihat Riwayat"}
            </button>
          </div>
        </div>

        {/* Statistik */}
        {selectedRegu && siswaAbsensi.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[{ l: "Hadir", c: "text-green-600", b: "border-green-400" },
              { l: "Izin",  c: "text-yellow-500", b: "border-yellow-400" },
              { l: "Sakit", c: "text-blue-600",   b: "border-blue-400" },
              { l: "Alpa",  c: "text-red-500",    b: "border-red-400" },
            ].map(({ l, c, b }) => (
              <div key={l} className={`bg-white rounded-xl p-4 text-center shadow-sm border-b-4 ${b}`}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{l}</p>
                <p className={`text-3xl font-bold ${c}`}>{stats[l] || 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Form Absensi */}
        {selectedRegu && siswaAbsensi.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header tabel */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">
                Daftar Kehadiran — <span className="text-blue-600">{namaRegu}</span>
              </h2>
              <div className="flex gap-1.5">
                {STATUS_OPTS.map((s) => (
                  <button key={s} type="button" onClick={() => tandaiSemua(s)}
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${STATUS_COLOR[s]}`}>
                    Semua {s}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left w-10">No</th>
                  <th className="px-5 py-3 text-left">Nama Anggota</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {siswaAbsensi.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{s.nama_lengkap || "Anggota"}</td>
                    <td className="px-5 py-3">
                      {s.status_kehadiran ? (
                        <span onClick={() => {
                          const idx = STATUS_OPTS.indexOf(s.status_kehadiran);
                          setStatusSiswa(s.id, STATUS_OPTS[(idx + 1) % STATUS_OPTS.length]);
                        }} className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase cursor-pointer ${STATUS_COLOR[s.status_kehadiran]}`}>
                          {s.status_kehadiran}
                        </span>
                      ) : (
                        <div className="flex gap-1.5">
                          {STATUS_OPTS.map((st) => (
                            <button key={st} type="button" onClick={() => setStatusSiswa(s.id, st)}
                              className="text-xs font-bold uppercase px-2 py-0.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Laporan Kegiatan */}
            <div className="bg-gray-50 p-5 border-t border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Laporan Kegiatan</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Deskripsi Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Misal: Latihan PBB, Pionering, dan Semaphore regu hari ini..."
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Upload Bukti Foto Kegiatan <span className="text-gray-400 font-normal normal-case">(opsional)</span>
                </label>
                <input id="fileUploadInput" type="file" accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFileLaporan(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-white">
              <button type="submit" disabled={isSubmitting}
                className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95">
                {isSubmitting ? "Menyimpan..." : "Simpan Absensi & Laporan"}
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {selectedRegu && siswaAbsensi.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold">Belum Ada Anggota</p>
            <p className="text-sm mt-1">Belum ada anggota yang di-plotting ke regu ini.</p>
          </div>
        )}

        {/* Riwayat */}
        {showRiwayat && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Riwayat Absensi Pramuka</h2>
              <button onClick={loadRiwayat} className="text-xs text-blue-600 hover:underline">Refresh</button>
            </div>
            {loadingRiwayat ? (
              <div className="py-10 text-center text-gray-400">Memuat...</div>
            ) : riwayat.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">Belum ada riwayat absensi</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Tanggal</th>
                    <th className="px-5 py-3 text-left">Regu</th>
                    <th className="px-5 py-3 text-left">Nama Anggota</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {riwayat.slice(0, 50).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3 text-gray-600">{r.tanggal}</td>
                      <td className="px-5 py-3 text-gray-500">{r.nama_regu || "-"}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{r.nama_lengkap || `Siswa #${r.siswa_id}`}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[r.status] || "bg-gray-100 text-gray-500"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
