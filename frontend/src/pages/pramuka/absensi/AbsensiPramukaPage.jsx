import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { vocationalApi } from "../../../api/vocationalApi";

const STATUS_OPTS = ["hadir", "izin", "sakit", "alpa"];

const STATUS_LABEL = {
  hadir: "Hadir",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};

const STATUS_COLOR = {
  hadir: "bg-green-500 text-white",
  izin: "bg-yellow-400 text-white",
  sakit: "bg-blue-500 text-white",
  alpa: "bg-red-500 text-white",
};

const STATUS_BADGE = {
  hadir: "bg-green-100 text-green-700",
  izin: "bg-yellow-100 text-yellow-700",
  sakit: "bg-blue-100 text-blue-700",
  alpa: "bg-red-100 text-red-700",
};

const TABS = [
  { key: "input", label: "Absensi", icon: "✏️" },
  { key: "riwayat", label: "Riwayat", icon: "📋" },
  { key: "rekap", label: "Rekap", icon: "📊" },
];

export default function AbsensiPramukaPage() {
  const [tab, setTab] = useState("input");

  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [deskripsi, setDeskripsi] = useState("");

  const [siswaList, setSiswaList] = useState([]);
  const [absensi, setAbsensi] = useState({});
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [saving, setSaving] = useState(false);

  const [riwayatKelas, setRiwayatKelas] = useState("");
  const [riwayatTanggal, setRiwayatTanggal] = useState("");
  const [riwayatData, setRiwayatData] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  const [rekapKelas, setRekapKelas] = useState("");
  const [rekapMulai, setRekapMulai] = useState("");
  const [rekapAkhir, setRekapAkhir] = useState("");
  const [rekapSiswa, setRekapSiswa] = useState([]);
  const [rekapData, setRekapData] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const selectedKelasObj = kelasList.find(
    (item) => String(item.id) === String(selectedKelas),
  );

  const rekapKelasObj = kelasList.find(
    (item) => String(item.id) === String(rekapKelas),
  );

  const getNamaKelas = (kelasId) => {
    const kelas = kelasList.find((item) => String(item.id) === String(kelasId));
    return kelas?.nama_kelas || "-";
  };

  const loadKelas = async () => {
    try {
      const res = await vocationalApi.getKelasVokasi();
      setKelasList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
      toast.error("Gagal memuat daftar kelas");
    }
  };

  const loadSiswaByKelas = async (kelasId) => {
    if (!kelasId) {
      setSiswaList([]);
      setAbsensi({});
      return;
    }

    setLoadingSiswa(true);

    try {
      const res = await vocationalApi.getSiswaVokasi({ kelas_id: kelasId });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];

      setSiswaList(list);

      const initialAbsensi = {};
      list.forEach((siswa) => {
        initialAbsensi[siswa.id] = {
          status: "",
          keterangan: "",
        };
      });

      setAbsensi(initialAbsensi);
    } catch (err) {
      console.error("Gagal memuat siswa:", err);
      toast.error("Gagal memuat data siswa");
      setSiswaList([]);
      setAbsensi({});
    } finally {
      setLoadingSiswa(false);
    }
  };

  useEffect(() => {
    loadKelas();
  }, []);

  useEffect(() => {
    loadSiswaByKelas(selectedKelas);
  }, [selectedKelas]);

  const summary = useMemo(() => {
    const data = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
      belum: 0,
      total: siswaList.length,
    };

    siswaList.forEach((siswa) => {
      const status = absensi[siswa.id]?.status;

      if (status && data[status] !== undefined) {
        data[status] += 1;
      } else {
        data.belum += 1;
      }
    });

    return data;
  }, [siswaList, absensi]);

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
        ...(absensi[siswa.id] || {}),
        status,
      };
    });
    setAbsensi(next);
  };

  const handleLoadRiwayat = async (customFilter = {}) => {
    setLoadingRiwayat(true);

    const finalKelas = customFilter.kelas_id ?? riwayatKelas;
    const finalTanggal = customFilter.tanggal ?? riwayatTanggal;

    try {
      const res = await vocationalApi.getAbsensiPramuka({
        kelas_id: finalKelas || undefined,
        tanggal: finalTanggal || undefined,
      });

      setRiwayatData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
      toast.error("Gagal memuat riwayat absensi");
      setRiwayatData([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const handleLoadRekap = async (customFilter = {}) => {
    const finalKelas = customFilter.kelas_id ?? rekapKelas;
    const finalMulai = customFilter.tanggal_mulai ?? rekapMulai;
    const finalAkhir = customFilter.tanggal_akhir ?? rekapAkhir;

    if (!finalKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    setLoadingRekap(true);

    try {
      const [siswaRes, rekapRes] = await Promise.all([
        vocationalApi.getSiswaVokasi({ kelas_id: finalKelas }),
        vocationalApi.getRekapAbsensiPramuka({
          kelas_id: finalKelas,
          tanggal_mulai: finalMulai || undefined,
          tanggal_akhir: finalAkhir || undefined,
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
      toast.error("Gagal memuat rekap absensi");
      setRekapSiswa([]);
      setRekapData([]);
    } finally {
      setLoadingRekap(false);
    }
  };

  const handleSimpan = async () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    if (siswaList.length === 0) {
      toast.error("Tidak ada siswa di kelas ini");
      return;
    }

    const belumDiisi = siswaList.filter((siswa) => !absensi[siswa.id]?.status);

    if (belumDiisi.length > 0) {
      toast.error("Semua siswa harus diberi status absensi terlebih dahulu");
      return;
    }

    const payload = {
      kelas_id: selectedKelas,
      tanggal,
      deskripsi,
      data_absensi: siswaList.map((siswa) => ({
        siswa_id: siswa.id,
        nama_lengkap: siswa.nama_lengkap || siswa.nama_siswa || "-",
        nisn: siswa.nisn || null,
        status: absensi[siswa.id]?.status || "",
        keterangan: absensi[siswa.id]?.keterangan || "",
      })),
    };

    setSaving(true);

    try {
      await vocationalApi.submitAbsensiPramuka(payload);

      toast.success("Absensi pramuka berhasil disimpan");

      setRiwayatKelas(selectedKelas);
      setRiwayatTanggal(tanggal);
      setRekapKelas(selectedKelas);
      setRekapMulai(tanggal);
      setRekapAkhir(tanggal);

      await handleLoadRiwayat({
        kelas_id: selectedKelas,
        tanggal,
      });

      await handleLoadRekap({
        kelas_id: selectedKelas,
        tanggal_mulai: tanggal,
        tanggal_akhir: tanggal,
      });

      setDeskripsi("");
    } catch (err) {
      console.error("Gagal menyimpan absensi pramuka:", err);
      toast.error(err?.response?.data?.error || "Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  };

  const getRekapBySiswa = (siswaId) => {
    return (
      rekapData.find((item) => String(item.siswa_id) === String(siswaId)) || {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
        total: 0,
      }
    );
  };

  const handleExportRekapExcel = () => {
    if (rekapSiswa.length === 0) {
      toast.error("Tidak ada data rekap untuk diexport");
      return;
    }

    const rows = rekapSiswa.map((siswa, index) => {
      const data = getRekapBySiswa(siswa.id);

      const hadir = Number(data.hadir || 0);
      const izin = Number(data.izin || 0);
      const sakit = Number(data.sakit || 0);
      const alpa = Number(data.alpa || 0);
      const total = Number(data.total || hadir + izin + sakit + alpa);
      const persentaseHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        No: index + 1,
        "Nama Siswa": siswa.nama_lengkap || siswa.nama_siswa || "-",
        NISN: siswa.nisn || "-",
        Hadir: hadir,
        Izin: izin,
        Sakit: sakit,
        Alpa: alpa,
        Total: total,
        "Persentase Hadir": `${persentaseHadir}%`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet([]);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["Rekap Absensi Pramuka"],
        [`Kelas: ${rekapKelasObj?.nama_kelas || "-"}`],
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Pramuka");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `rekap-absensi-pramuka-${Date.now()}.xlsx`);
    toast.success("Rekap berhasil diexport ke Excel");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Absensi Pramuka</h1>
            <p className="text-sm text-gray-500">
              Absensi siswa kegiatan pramuka. User pramuka dapat mengakses
              seluruh kelas.
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

      <div className="px-8 py-5 max-w-6xl mx-auto space-y-5">
        {tab === "input" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={selectedKelas}
                    onChange={(e) => setSelectedKelas(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Deskripsi Kegiatan
                  </label>
                  <input
                    type="text"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Contoh: Baris-berbaris, P3K..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {selectedKelas && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {[
                    {
                      label: "Total",
                      value: summary.total,
                      className: "bg-white border text-gray-800",
                    },
                    {
                      label: "Belum",
                      value: summary.belum,
                      className:
                        "bg-gray-50 border border-gray-200 text-gray-700",
                    },
                    {
                      label: "Hadir",
                      value: summary.hadir,
                      className:
                        "bg-green-50 border border-green-200 text-green-700",
                    },
                    {
                      label: "Izin",
                      value: summary.izin,
                      className:
                        "bg-yellow-50 border border-yellow-200 text-yellow-700",
                    },
                    {
                      label: "Sakit",
                      value: summary.sakit,
                      className:
                        "bg-blue-50 border border-blue-200 text-blue-700",
                    },
                    {
                      label: "Alpa",
                      value: summary.alpa,
                      className: "bg-red-50 border border-red-200 text-red-700",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl p-3 text-center ${item.className}`}
                    >
                      <p className="text-xs font-semibold opacity-70 mb-1">
                        {item.label}
                      </p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 border-b border-gray-100">
                    <div>
                      <h2 className="font-bold text-gray-800">
                        Daftar Siswa — {selectedKelasObj?.nama_kelas || "-"}
                      </h2>
                      <p className="text-xs text-gray-400">{tanggal}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTS.map((status) => (
                        <button
                          key={status}
                          onClick={() => tandaiSemua(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${STATUS_COLOR[status]} opacity-80 hover:opacity-100`}
                        >
                          Semua {STATUS_LABEL[status]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingSiswa ? (
                    <div className="py-12 text-center text-gray-400">
                      Memuat daftar siswa...
                    </div>
                  ) : siswaList.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      Tidak ada siswa di kelas ini.
                    </div>
                  ) : (
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
                              <td className="px-5 py-3 text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-5 py-3 font-semibold text-gray-800">
                                {siswa.nama_lengkap || siswa.nama_siswa || "-"}
                              </td>
                              <td className="px-5 py-3 text-gray-500">
                                {siswa.nisn || "-"}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex justify-center gap-1">
                                  {STATUS_OPTS.map((status) => (
                                    <button
                                      key={status}
                                      onClick={() =>
                                        setStatus(siswa.id, status)
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                        absensi[siswa.id]?.status === status
                                          ? STATUS_COLOR[status]
                                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                      }`}
                                    >
                                      {STATUS_LABEL[status]}
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
                                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {siswaList.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={handleSimpan}
                        disabled={saving}
                        className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow transition-all"
                      >
                        {saving ? "Menyimpan..." : "💾 Simpan Absensi"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">
                Filter Riwayat Absensi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={riwayatKelas}
                    onChange={(e) => setRiwayatKelas(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Kelas</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas}
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
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => handleLoadRiwayat()}
                  disabled={loadingRiwayat}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl"
                >
                  {loadingRiwayat ? "Memuat..." : "🔍 Tampilkan"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {riwayatData.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  Klik Tampilkan untuk melihat riwayat absensi.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Tanggal</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-left">Kelas</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-left">Keterangan</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {riwayatData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 text-gray-600">
                          {String(item.tanggal).slice(0, 10)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-800">
                          {item.nama_lengkap || "-"}
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {getNamaKelas(item.kelas_id)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              STATUS_BADGE[item.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {STATUS_LABEL[item.status] || item.status || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">
                Rekap Absensi Pramuka
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={rekapKelas}
                    onChange={(e) => setRekapKelas(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas}
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
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => handleLoadRekap()}
                  disabled={loadingRekap}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl"
                >
                  {loadingRekap ? "Memuat..." : "🔍 Tampilkan"}
                </button>

                <button
                  onClick={handleExportRekapExcel}
                  disabled={rekapSiswa.length === 0}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl"
                >
                  📥 Export Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {rekapSiswa.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  Pilih kelas lalu klik Tampilkan untuk melihat rekap.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">No</th>
                      <th className="px-5 py-3 text-left">Nama Siswa</th>
                      <th className="px-5 py-3 text-left">NISN</th>
                      <th className="px-5 py-3 text-center">Hadir</th>
                      <th className="px-5 py-3 text-center">Izin</th>
                      <th className="px-5 py-3 text-center">Sakit</th>
                      <th className="px-5 py-3 text-center">Alpa</th>
                      <th className="px-5 py-3 text-center">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {rekapSiswa.map((siswa, index) => {
                      const data = getRekapBySiswa(siswa.id);

                      return (
                        <tr key={siswa.id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3 text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-800">
                            {siswa.nama_lengkap || siswa.nama_siswa || "-"}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            {siswa.nisn || "-"}
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-green-600">
                            {Number(data.hadir || 0)}
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-yellow-600">
                            {Number(data.izin || 0)}
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-blue-600">
                            {Number(data.sakit || 0)}
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-red-600">
                            {Number(data.alpa || 0)}
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-gray-800">
                            {Number(data.total || 0)}
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
