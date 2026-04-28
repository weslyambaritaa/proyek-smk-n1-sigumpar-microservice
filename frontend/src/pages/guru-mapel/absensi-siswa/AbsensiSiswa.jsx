import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { studentApi } from "../../../api/studentApi";

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
  { key: "input", label: "Absensi", icon: "✏️" },
  { key: "riwayat", label: "Riwayat", icon: "📋" },
  { key: "rekap", label: "Rekap", icon: "📊" },
];

const makeAssignmentKey = (item) => `${item.kelas_id}|${item.mapel_id}`;

const parseAssignmentKey = (key) => {
  const [kelas_id, mapel_id] = String(key || "").split("|");
  return { kelas_id, mapel_id };
};

const formatTime = (value) => {
  if (!value) return "-";
  return String(value).slice(0, 5);
};

const formatJadwal = (item) => {
  const hari = item.hari || "-";
  const jam = `${formatTime(item.waktu_mulai)} - ${formatTime(
    item.waktu_berakhir,
  )}`;
  const kelas = item.nama_kelas || `Kelas ${item.kelas_id}`;
  const mapel =
    item.nama_mapel || item.mata_pelajaran || `Mapel ${item.mapel_id}`;

  return `${hari} • ${jam} • ${kelas} • ${mapel}`;
};

const formatAssignment = (item) => {
  const kelas = item.nama_kelas || `Kelas ${item.kelas_id}`;
  const mapel =
    item.nama_mapel || item.mata_pelajaran || `Mapel ${item.mapel_id}`;

  return `${kelas} • ${mapel}`;
};

export default function AbsensiSiswa() {
  const [tab, setTab] = useState("input");

  const [jadwalList, setJadwalList] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);

  const [jadwalId, setJadwalId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [siswaList, setSiswaList] = useState([]);
  const [absensi, setAbsensi] = useState({});
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [saving, setSaving] = useState(false);

  const [riwayatJadwalId, setRiwayatJadwalId] = useState("");
  const [riwayatTanggal, setRiwayatTanggal] = useState("");
  const [riwayatData, setRiwayatData] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  const [rekapAssignmentKey, setRekapAssignmentKey] = useState("");
  const [rekapMulai, setRekapMulai] = useState("");
  const [rekapAkhir, setRekapAkhir] = useState("");
  const [rekapSiswa, setRekapSiswa] = useState([]);
  const [rekapData, setRekapData] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const selectedJadwal = useMemo(
    () => jadwalList.find((j) => String(j.id) === String(jadwalId)),
    [jadwalList, jadwalId],
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
    const loadInitialData = async () => {
      try {
        const [jadwalRes, assignmentRes] = await Promise.all([
          studentApi.getAbsensiMapelJadwal(),
          studentApi.getAbsensiMapelAssignments(),
        ]);

        const jadwalRows = Array.isArray(jadwalRes.data?.data)
          ? jadwalRes.data.data
          : [];

        const assignmentRows = Array.isArray(assignmentRes.data?.data)
          ? assignmentRes.data.data
          : [];

        setJadwalList(jadwalRows);
        setAssignmentList(assignmentRows);

        if (jadwalRows.length === 1) {
          setJadwalId(jadwalRows[0].id);
          setRiwayatJadwalId(jadwalRows[0].id);
        }

        if (assignmentRows.length === 1) {
          setRekapAssignmentKey(makeAssignmentKey(assignmentRows[0]));
        }
      } catch (err) {
        console.error("Gagal memuat data guru-mapel:", err);
        toast.error(
          err?.response?.data?.message || "Gagal memuat data guru-mapel",
        );
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadSiswaAndExistingAbsensi = async () => {
      if (!jadwalId || !tanggal) {
        setSiswaList([]);
        setAbsensi({});
        return;
      }

      setLoadingSiswa(true);

      try {
        const siswaRes = await studentApi.getAbsensiMapelSiswa({
          jadwal_id: jadwalId,
        });

        const siswaRows = Array.isArray(siswaRes.data?.data)
          ? siswaRes.data.data
          : [];

        const defaultMap = {};
        siswaRows.forEach((siswa) => {
          defaultMap[siswa.id] = {
            status: "",
            keterangan: "",
          };
        });

        const absensiRes = await studentApi.getAbsensiMapel({
          jadwal_id: jadwalId,
          tanggal,
        });

        const existingRows = Array.isArray(absensiRes.data?.data)
          ? absensiRes.data.data
          : [];

        existingRows.forEach((item) => {
          defaultMap[item.siswa_id] = {
            status: item.status || "hadir",
            keterangan: item.keterangan || "",
          };
        });

        setSiswaList(siswaRows);
        setAbsensi(defaultMap);
      } catch (err) {
        console.error("Gagal memuat siswa/absensi:", err);
        toast.error(err?.response?.data?.message || "Gagal memuat data siswa");
        setSiswaList([]);
        setAbsensi({});
      } finally {
        setLoadingSiswa(false);
      }
    };

    loadSiswaAndExistingAbsensi();
  }, [jadwalId, tanggal]);

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
    if (!jadwalId) {
      toast.error("Pilih jadwal mapel terlebih dahulu");
      return;
    }

    if (!tanggal) {
      toast.error("Pilih tanggal terlebih dahulu");
      return;
    }

    if (siswaList.length === 0) {
      toast.error("Tidak ada siswa yang bisa diabsen");
      return;
    }

    const belumDiisi = siswaList.filter((siswa) => !absensi[siswa.id]?.status);

    if (belumDiisi.length > 0) {
      toast.error(
        `Masih ada ${belumDiisi.length} siswa yang belum diisi status absensinya`,
      );
      return;
    }

    const payload = {
      jadwal_id: jadwalId,
      tanggal,
      data_absensi: siswaList.map((siswa) => ({
        siswa_id: siswa.id,
        status: absensi[siswa.id]?.status,
        keterangan: absensi[siswa.id]?.keterangan || "",
      })),
    };

    console.log("PAYLOAD ABSENSI MAPEL:", payload);

    setSaving(true);

    try {
      await studentApi.createAbsensiMapel(payload);
      toast.success("Absensi berhasil disimpan");
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      toast.error(err?.response?.data?.message || "Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadRiwayat = async () => {
    if (!riwayatJadwalId) {
      toast.error("Pilih jadwal mapel terlebih dahulu");
      return;
    }
    setLoadingRiwayat(true);

    try {
      const res = await studentApi.getAbsensiMapel({
        jadwal_id: riwayatJadwalId || undefined,
        tanggal: riwayatTanggal || undefined,
      });

      setRiwayatData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
      toast.error(
        err?.response?.data?.message || "Gagal memuat riwayat absensi",
      );
      setRiwayatData([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const handleLoadRekap = async () => {
    if (!rekapAssignmentKey) {
      toast.error("Pilih kelas/mapel terlebih dahulu");
      return;
    }

    const { kelas_id, mapel_id } = parseAssignmentKey(rekapAssignmentKey);

    setLoadingRekap(true);

    try {
      const [siswaRes, rekapRes] = await Promise.all([
        studentApi.getAbsensiMapelSiswaByKelas({ kelas_id }),
        studentApi.getRekapAbsensiMapel({
          kelas_id,
          mapel_id,
          tanggal_mulai: rekapMulai || undefined,
          tanggal_akhir: rekapAkhir || undefined,
        }),
      ]);

      setRekapSiswa(
        Array.isArray(siswaRes.data?.data) ? siswaRes.data.data : [],
      );
      setRekapData(
        Array.isArray(rekapRes.data?.data) ? rekapRes.data.data : [],
      );
    } catch (err) {
      console.error("Gagal memuat rekap:", err);
      toast.error(err?.response?.data?.message || "Gagal memuat rekap absensi");
      setRekapSiswa([]);
      setRekapData([]);
    } finally {
      setLoadingRekap(false);
    }
  };

  const getRekapBySiswa = (siswaId) => {
    return (
      rekapData.find((item) => String(item.siswa_id) === String(siswaId)) || {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
        terlambat: 0,
        total: 0,
      }
    );
  };

  const handleExportRekapExcel = () => {
    if (rekapSiswa.length === 0) {
      toast.error("Tidak ada data rekap untuk diexport");
      return;
    }

    const selectedAssignment = assignmentList.find(
      (item) => makeAssignmentKey(item) === rekapAssignmentKey,
    );

    const rows = rekapSiswa.map((siswa, index) => {
      const data = getRekapBySiswa(siswa.id);

      const hadir = Number(data.hadir || 0);
      const izin = Number(data.izin || 0);
      const sakit = Number(data.sakit || 0);
      const alpa = Number(data.alpa || 0);
      const terlambat = Number(data.terlambat || 0);
      const total = Number(
        data.total || hadir + izin + sakit + alpa + terlambat,
      );
      const persentaseHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        No: index + 1,
        "Nama Siswa": siswa.nama_lengkap || siswa.nama_siswa || "-",
        NISN: siswa.nisn || "-",
        Hadir: hadir,
        Izin: izin,
        Sakit: sakit,
        Alpa: alpa,
        Terlambat: terlambat,
        Total: total,
        "Persentase Hadir": `${persentaseHadir}%`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["Rekap Absensi Siswa Guru Mapel"],
        [
          `Kelas/Mapel: ${selectedAssignment ? formatAssignment(selectedAssignment) : "-"}`,
        ],
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const filename = `rekap-absensi-guru-mapel-${Date.now()}.xlsx`;
    saveAs(file, filename);

    toast.success("Rekap berhasil diexport ke Excel");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Absensi Siswa</h1>
            <p className="text-sm text-gray-500">
              Absensi siswa berdasarkan jadwal mapel yang di-assign kepada
              guru-mapel.
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
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Jadwal Mapel
                  </label>
                  <select
                    value={jadwalId}
                    onChange={(e) => setJadwalId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Jadwal Mapel --</option>
                    {jadwalList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatJadwal(item)}
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
              </div>
            </div>

            {selectedJadwal && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                <b>Jadwal dipilih:</b> {formatJadwal(selectedJadwal)}
              </div>
            )}

            {loadingSiswa ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                Memuat siswa...
              </div>
            ) : jadwalId && siswaList.length > 0 ? (
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
                      <p className="text-xs text-gray-400">{tanggal}</p>
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
                              {siswa.nama_lengkap || siswa.nama_siswa || "-"}
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
                      {saving ? "Menyimpan..." : "💾 Simpan Absensi"}
                    </button>
                  </div>
                </div>
              </>
            ) : jadwalId ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">👤</p>
                <p>Tidak ada siswa pada kelas jadwal ini.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">📅</p>
                <p>Pilih jadwal mapel terlebih dahulu.</p>
              </div>
            )}
          </>
        )}

        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">Riwayat Absensi</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Jadwal Mapel
                  </label>
                  <select
                    value={riwayatJadwalId}
                    onChange={(e) => setRiwayatJadwalId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Jadwal --</option>
                    {jadwalList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatJadwal(item)}
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
                  <p>Pilih filter dan klik Tampilkan.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Tanggal</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-left">Kelas</th>
                      <th className="px-5 py-3 text-left">Mapel</th>
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
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {item.nama_kelas || "-"}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {item.nama_mapel || "-"}
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
                Rekap Absensi Per Kelas/Mapel
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas / Mapel
                  </label>
                  <select
                    value={rekapAssignmentKey}
                    onChange={(e) => setRekapAssignmentKey(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas / Mapel --</option>
                    {assignmentList.map((item) => (
                      <option
                        key={makeAssignmentKey(item)}
                        value={makeAssignmentKey(item)}
                      >
                        {formatAssignment(item)}
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
                    disabled={rekapSiswa.length === 0}
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
              ) : rekapSiswa.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-2">📊</p>
                  <p>Pilih kelas/mapel dan klik Tampilkan.</p>
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
                    {rekapSiswa.map((siswa, index) => {
                      const data = getRekapBySiswa(siswa.id);

                      const hadir = Number(data.hadir || 0);
                      const izin = Number(data.izin || 0);
                      const sakit = Number(data.sakit || 0);
                      const alpa = Number(data.alpa || 0);
                      const terlambat = Number(data.terlambat || 0);
                      const total = Number(
                        data.total || hadir + izin + sakit + alpa + terlambat,
                      );
                      const pct =
                        total > 0 ? Math.round((hadir / total) * 100) : 0;

                      return (
                        <tr key={siswa.id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3 text-gray-400">
                            {index + 1}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-800">
                            {siswa.nama_lengkap || siswa.nama_siswa || "-"}
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
