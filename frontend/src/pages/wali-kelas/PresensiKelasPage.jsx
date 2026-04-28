import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";

const STATUS_OPTS = ["hadir", "izin", "sakit", "alpa", "terlambat"];

const STATUS_COLOR = {
  hadir: "bg-green-500 text-white",
  izin: "bg-yellow-400 text-white",
  sakit: "bg-blue-500 text-white",
  alpa: "bg-red-500 text-white",
  terlambat: "bg-orange-400 text-white",
};

const STATUS_BADGE = {
  hadir: "bg-green-100 text-green-700",
  izin: "bg-yellow-100 text-yellow-700",
  sakit: "bg-blue-100 text-blue-700",
  alpa: "bg-red-100 text-red-700",
  terlambat: "bg-orange-100 text-orange-700",
};

const TABS = [
  { key: "input", label: "Presensi", icon: "✏️" },
  { key: "riwayat", label: "Riwayat", icon: "📋" },
  { key: "rekap", label: "Rekap", icon: "📊" },
];

const getRows = (res) => {
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

export default function PresensiKelasPage() {
  const [tab, setTab] = useState("input");

  const [kelasList, setKelasList] = useState([]);
  const [kelasId, setKelasId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

  const [siswaList, setSiswaList] = useState([]);
  const [absensi, setAbsensi] = useState({});
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [saving, setSaving] = useState(false);

  const [riwayatKelasId, setRiwayatKelasId] = useState("");
  const [riwayatTanggal, setRiwayatTanggal] = useState("");
  const [riwayatData, setRiwayatData] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  const [rekapKelasId, setRekapKelasId] = useState("");
  const [rekapMulai, setRekapMulai] = useState("");
  const [rekapAkhir, setRekapAkhir] = useState("");
  const [rekapData, setRekapData] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const selectedKelas = useMemo(
    () => kelasList.find((k) => String(k.id) === String(kelasId)),
    [kelasList, kelasId],
  );

  const stats = useMemo(() => {
    const result = { hadir: 0, izin: 0, sakit: 0, alpa: 0, terlambat: 0 };

    Object.values(absensi).forEach((item) => {
      if (item?.status && result[item.status] !== undefined) {
        result[item.status] += 1;
      }
    });

    return result;
  }, [absensi]);

  useEffect(() => {
    const loadKelas = async () => {
      try {
        const res = await academicApi.getKelas();
        const rows = getRows(res);

        setKelasList(rows);

        if (rows.length === 1) {
          setKelasId(rows[0].id);
          setRiwayatKelasId(rows[0].id);
          setRekapKelasId(rows[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat kelas:", err);
        toast.error(err?.response?.data?.message || "Gagal memuat kelas");
      }
    };

    loadKelas();
  }, []);

  useEffect(() => {
    const loadSiswaAndExistingAbsensi = async () => {
      if (!kelasId || !tanggal) {
        setSiswaList([]);
        setAbsensi({});
        return;
      }

      setLoadingSiswa(true);

      try {
        const [siswaRes, absensiRes] = await Promise.all([
          academicApi.getSiswa({ kelas_id: kelasId }),
          studentApi.getRekapKehadiran({
            kelas_id: kelasId,
            tanggal,
          }),
        ]);

        const siswaRows = getRows(siswaRes);
        const existingRows = getRows(absensiRes);

        const map = {};

        siswaRows.forEach((siswa) => {
          map[siswa.id] = {
            status: "",
            keterangan: "",
          };
        });

        existingRows.forEach((item) => {
          map[item.siswa_id] = {
            status: item.status || "",
            keterangan: item.keterangan || "",
          };
        });

        setSiswaList(siswaRows);
        setAbsensi(map);
      } catch (err) {
        console.error("Gagal memuat siswa/presensi:", err);
        toast.error(
          err?.response?.data?.message || "Gagal memuat data presensi",
        );
        setSiswaList([]);
        setAbsensi({});
      } finally {
        setLoadingSiswa(false);
      }
    };

    loadSiswaAndExistingAbsensi();
  }, [kelasId, tanggal]);

  const setStatus = (siswaId, status) => {
    setAbsensi((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        status,
      },
    }));
  };

  const setKeterangan = (siswaId, keterangan) => {
    setAbsensi((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan,
      },
    }));
  };

  const tandaiSemua = (status) => {
    const next = {};

    siswaList.forEach((siswa) => {
      next[siswa.id] = {
        status,
        keterangan: absensi[siswa.id]?.keterangan || "",
      };
    });

    setAbsensi(next);
  };

  const handleSimpan = async () => {
    if (!kelasId) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    if (!tanggal) {
      toast.error("Pilih tanggal terlebih dahulu");
      return;
    }

    if (siswaList.length === 0) {
      toast.error("Tidak ada siswa yang bisa dipresensi");
      return;
    }

    const belumDiisi = siswaList.filter((siswa) => !absensi[siswa.id]?.status);

    if (belumDiisi.length > 0) {
      toast.error(
        `Masih ada ${belumDiisi.length} siswa yang belum diisi status presensinya`,
      );
      return;
    }

    const payload = {
      kelas_id: kelasId,
      tanggal,
      data_absensi: siswaList.map((siswa) => ({
        siswa_id: siswa.id,
        status: absensi[siswa.id]?.status,
        keterangan: absensi[siswa.id]?.keterangan || "",
      })),
    };

    setSaving(true);

    try {
      await studentApi.createRekapKehadiran(payload);
      toast.success("Presensi kelas berhasil disimpan");
    } catch (err) {
      console.error("Gagal menyimpan presensi:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Gagal menyimpan presensi",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLoadRiwayat = async () => {
    if (!riwayatKelasId) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    setLoadingRiwayat(true);

    try {
      const res = await studentApi.getRekapKehadiran({
        kelas_id: riwayatKelasId,
        tanggal: riwayatTanggal || undefined,
      });

      setRiwayatData(getRows(res));
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
      toast.error(err?.response?.data?.message || "Gagal memuat riwayat");
      setRiwayatData([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const handleLoadRekap = async () => {
    if (!rekapKelasId) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    setLoadingRekap(true);

    try {
      const res = await studentApi.getRekapKehadiran({
        kelas_id: rekapKelasId,
        tanggal_mulai: rekapMulai || undefined,
        tanggal_akhir: rekapAkhir || undefined,
      });

      setRekapData(getRows(res));
    } catch (err) {
      console.error("Gagal memuat rekap:", err);
      toast.error(err?.response?.data?.message || "Gagal memuat rekap");
      setRekapData([]);
    } finally {
      setLoadingRekap(false);
    }
  };

  const namaKelas = (kelas) =>
    kelas?.nama_kelas || kelas?.nama || `Kelas ${kelas?.id || "-"}`;

  const handleExportRekapExcel = () => {
    if (rekapData.length === 0) {
      toast.error("Tidak ada data rekap untuk diexport");
      return;
    }

    const selectedKelasRekap = kelasList.find(
      (item) => String(item.id) === String(rekapKelasId),
    );

    const rows = rekapData.map((item, index) => {
      const hadir = Number(item.hadir || 0);
      const izin = Number(item.izin || 0);
      const sakit = Number(item.sakit || 0);
      const alpa = Number(item.alpa || 0);
      const terlambat = Number(item.terlambat || 0);
      const total = Number(
        item.total || hadir + izin + sakit + alpa + terlambat,
      );
      const persentaseHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        No: index + 1,
        "Nama Siswa": item.nama_lengkap || item.nama_siswa || "-",
        Hadir: hadir,
        Izin: izin,
        Sakit: sakit,
        Alpa: alpa,
        Terlambat: terlambat,
        Total: total,
        "Persentase Hadir": `${persentaseHadir}%`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet([]);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["Rekap Presensi Kelas"],
        [`Kelas: ${selectedKelasRekap ? namaKelas(selectedKelasRekap) : "-"}`],
        [`Periode: ${rekapMulai || "-"} s/d ${rekapAkhir || "-"}`],
        [],
      ],
      { origin: "A1" },
    );

    XLSX.utils.sheet_add_json(worksheet, rows, {
      origin: "A5",
      skipHeader: false,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `rekap-presensi-kelas-${Date.now()}.xlsx`);
    toast.success("Rekap berhasil diexport ke Excel");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Presensi Kelas</h1>
            <p className="text-sm text-gray-500">
              Presensi harian siswa oleh wali-kelas.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === item.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {tab === "input" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {namaKelas(kelas)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  Status awal dikosongkan. Wali-kelas wajib memilih status tiap
                  siswa sebelum menyimpan.
                </div>
              </div>
            </div>

            {selectedKelas && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                <b>Kelas dipilih:</b> {namaKelas(selectedKelas)} • {tanggal}
              </div>
            )}

            {loadingSiswa ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                Memuat siswa...
              </div>
            ) : kelasId && siswaList.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="rounded-xl p-3 text-center bg-white border border-gray-200 text-gray-800">
                    <p className="text-xs font-semibold opacity-70 mb-1">
                      Total
                    </p>
                    <p className="text-2xl font-bold">{siswaList.length}</p>
                  </div>

                  {STATUS_OPTS.map((status) => (
                    <div
                      key={status}
                      className="rounded-xl p-3 text-center bg-white border border-gray-200 text-gray-800"
                    >
                      <p className="text-xs font-semibold opacity-70 mb-1 capitalize">
                        {status}
                      </p>
                      <p className="text-2xl font-bold">{stats[status]}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 border-b border-gray-100">
                    <div>
                      <h2 className="font-bold text-gray-800">Daftar Siswa</h2>
                      <p className="text-xs text-gray-400">
                        {namaKelas(selectedKelas)} • {tanggal}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTS.map((status) => (
                        <button
                          key={status}
                          onClick={() => tandaiSemua(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${STATUS_COLOR[status]} opacity-80 hover:opacity-100 transition-opacity`}
                        >
                          Semua {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 text-left">No</th>
                          <th className="px-5 py-3 text-left">Nama Siswa</th>
                          <th className="px-5 py-3 text-left">NISN</th>
                          <th className="px-5 py-3 text-center">Status</th>
                          <th className="px-5 py-3 text-left">Keterangan</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-50">
                        {siswaList.map((siswa, index) => (
                          <tr key={siswa.id} className="hover:bg-gray-50/70">
                            <td className="px-5 py-3 text-gray-400">
                              {index + 1}
                            </td>
                            <td className="px-5 py-3 font-semibold text-gray-800">
                              {siswa.nama_lengkap ||
                                siswa.nama_siswa ||
                                siswa.namasiswa ||
                                "-"}
                            </td>
                            <td className="px-5 py-3 text-gray-500 text-xs">
                              {siswa.nisn || "-"}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {STATUS_OPTS.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => setStatus(siswa.id, status)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                      absensi[siswa.id]?.status === status
                                        ? `${STATUS_COLOR[status]} ring-2 ring-offset-1 ring-current shadow`
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <input
                                type="text"
                                value={absensi[siswa.id]?.keterangan || ""}
                                onChange={(e) =>
                                  setKeterangan(siswa.id, e.target.value)
                                }
                                placeholder="Opsional"
                                className="w-full min-w-[180px] border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={handleSimpan}
                      disabled={saving}
                      className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow transition-all"
                    >
                      {saving ? "Menyimpan..." : "💾 Simpan Presensi"}
                    </button>
                  </div>
                </div>
              </>
            ) : kelasId ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">👤</p>
                <p>Tidak ada siswa pada kelas ini.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">🏫</p>
                <p>Pilih kelas terlebih dahulu.</p>
              </div>
            )}
          </>
        )}

        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">Riwayat Presensi</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={riwayatKelasId}
                    onChange={(e) => setRiwayatKelasId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {namaKelas(kelas)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={riwayatTanggal}
                    onChange={(e) => setRiwayatTanggal(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleLoadRiwayat}
                  disabled={loadingRiwayat}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {loadingRiwayat ? "Memuat..." : "🔍 Tampilkan"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingRiwayat ? (
                <div className="py-12 text-center text-gray-400">
                  Memuat data...
                </div>
              ) : riwayatData.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Pilih kelas dan klik Tampilkan.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Tanggal</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-left">Keterangan</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {riwayatData.map((item, index) => (
                      <tr
                        key={`${item.siswa_id}-${item.tanggal}-${index}`}
                        className="hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-3 text-gray-400">{index + 1}</td>
                        <td className="px-5 py-3 text-gray-600">
                          {item.tanggal}
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-800">
                          {item.nama_lengkap || item.nama_siswa || "-"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              STATUS_BADGE[item.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {item.keterangan || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "rekap" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">
                Rekap Kehadiran Siswa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={rekapKelasId}
                    onChange={(e) => setRekapKelasId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {namaKelas(kelas)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={rekapMulai}
                    onChange={(e) => setRekapMulai(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={rekapAkhir}
                    onChange={(e) => setRekapAkhir(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleLoadRekap}
                    disabled={loadingRekap}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
                  >
                    {loadingRekap ? "Memuat..." : "📊 Tampilkan"}
                  </button>

                  <button
                    onClick={handleExportRekapExcel}
                    disabled={rekapData.length === 0}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
                  >
                    📥 Export Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingRekap ? (
                <div className="py-12 text-center text-gray-400">
                  Memuat data...
                </div>
              ) : rekapData.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-2">📊</p>
                  <p>Pilih kelas dan klik Tampilkan.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-center">Hadir</th>
                      <th className="px-5 py-3 text-center">Izin</th>
                      <th className="px-5 py-3 text-center">Sakit</th>
                      <th className="px-5 py-3 text-center">Alpa</th>
                      <th className="px-5 py-3 text-center">Terlambat</th>
                      <th className="px-5 py-3 text-center">Total</th>
                      <th className="px-5 py-3 text-center">% Hadir</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {rekapData.map((item, index) => {
                      const hadir = Number(item.hadir || 0);
                      const izin = Number(item.izin || 0);
                      const sakit = Number(item.sakit || 0);
                      const alpa = Number(item.alpa || 0);
                      const terlambat = Number(item.terlambat || 0);
                      const total = Number(
                        item.total || hadir + izin + sakit + alpa + terlambat,
                      );
                      const pct =
                        total > 0 ? Math.round((hadir / total) * 100) : 0;

                      return (
                        <tr key={index} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3 text-gray-400">
                            {index + 1}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-800">
                            {item.nama_lengkap || item.nama_siswa || "-"}
                          </td>
                          <td className="px-5 py-3 text-center text-green-600 font-bold">
                            {hadir}
                          </td>
                          <td className="px-5 py-3 text-center text-yellow-600 font-bold">
                            {izin}
                          </td>
                          <td className="px-5 py-3 text-center text-blue-600 font-bold">
                            {sakit}
                          </td>
                          <td className="px-5 py-3 text-center text-red-600 font-bold">
                            {alpa}
                          </td>
                          <td className="px-5 py-3 text-center text-orange-500 font-bold">
                            {terlambat}
                          </td>
                          <td className="px-5 py-3 text-center text-gray-600 font-bold">
                            {total}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                pct >= 75
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
