import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";
import keycloak from "../../keycloak";

const BOBOT_DEFAULT = { tugas: 15, kuis: 15, uts: 20, uas: 30, praktik: 20 };
const TAHUN_AJAR_OPTIONS = ["2023/2024", "2024/2025", "2025/2026", "2026/2027"];

const KOMPONEN = [
  { key: "tugas", label: "Tugas", field: "tugas" },
  { key: "kuis", label: "Kuis", field: "kuis" },
  { key: "uts", label: "UTS", field: "uts" },
  { key: "uas", label: "UAS", field: "uas" },
  { key: "praktik", label: "Praktik", field: "praktik" },
];

const TABS = [
  { key: "input", label: "Input Nilai", icon: "✏️" },
  { key: "riwayat", label: "Riwayat", icon: "📋" },
  { key: "rekap", label: "Rekap", icon: "📊" },
];

const PAGE_SIZE = 10;

function hitungNilaiAkhir(row, bobot) {
  const total = Object.values(bobot).reduce((a, b) => a + Number(b || 0), 0);
  if (total === 0) return "0.00";

  const nilai =
    (Number(row.tugas) || 0) * Number(bobot.tugas || 0) +
    (Number(row.kuis) || 0) * Number(bobot.kuis || 0) +
    (Number(row.uts) || 0) * Number(bobot.uts || 0) +
    (Number(row.uas) || 0) * Number(bobot.uas || 0) +
    (Number(row.praktik) || 0) * Number(bobot.praktik || 0);

  return (nilai / total).toFixed(2);
}

function getPredikat(nilai) {
  const n = Number(nilai);
  if (n >= 90)
    return {
      label: "A",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    };
  if (n >= 80)
    return { label: "B", color: "text-blue-600 bg-blue-50 border-blue-200" };
  if (n >= 70)
    return {
      label: "C",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    };
  if (n >= 60)
    return {
      label: "D",
      color: "text-orange-600 bg-orange-50 border-orange-200",
    };
  return { label: "E", color: "text-red-600 bg-red-50 border-red-200" };
}

function getUserId() {
  try {
    return keycloak?.tokenParsed?.sub || null;
  } catch {
    return null;
  }
}

function BobotEditor({ bobot, onChange, onReset }) {
  const total = Object.values(bobot).reduce((a, b) => a + Number(b || 0), 0);
  const isValid = total === 100;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-amber-800 text-sm">
            ⚖️ Pengaturan Bobot Nilai
          </h3>
          <p className="text-xs text-amber-600 mt-0.5">
            Total bobot harus tepat 100%. Saat ini:{" "}
            <span
              className={`font-bold ${isValid ? "text-green-600" : "text-red-600"}`}
            >
              {total}%
            </span>
          </p>
        </div>

        <button
          onClick={onReset}
          className="text-xs px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 font-semibold transition-all"
        >
          Reset Default
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {KOMPONEN.map((k) => (
          <div key={k.key}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {k.label}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={bobot[k.key]}
                onChange={(e) =>
                  onChange(
                    k.key,
                    Math.max(0, Math.min(100, Number(e.target.value))),
                  )
                }
                className={`w-full text-center px-2 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 transition-all pr-6 ${
                  isValid
                    ? "border-gray-200 focus:ring-blue-400"
                    : "border-red-300 focus:ring-red-400 bg-red-50"
                }`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                %
              </span>
            </div>
          </div>
        ))}
      </div>

      {!isValid && (
        <p className="text-xs text-red-600 mt-2 font-medium">
          ⚠️ Selisih: {total > 100 ? `-${total - 100}` : `+${100 - total}`}% —
          sesuaikan agar total = 100%
        </p>
      )}
    </div>
  );
}

export default function InputNilaiPage() {
  const [tab, setTab] = useState("input");
  const [bobot, setBobot] = useState({ ...BOBOT_DEFAULT });
  const [showBobot, setShowBobot] = useState(false);

  const [assignmentList, setAssignmentList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("2024/2025");
  const [searchNama, setSearchNama] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);
  const [page, setPage] = useState(1);

  const [riwayatKelas, setRiwayatKelas] = useState("");
  const [riwayatMapel, setRiwayatMapel] = useState("");
  const [riwayatTahun, setRiwayatTahun] = useState("2024/2025");
  const [riwayatData, setRiwayatData] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [riwayatPage, setRiwayatPage] = useState(1);

  const [rekapKelas, setRekapKelas] = useState("");
  const [rekapMapel, setRekapMapel] = useState("");
  const [rekapTahun, setRekapTahun] = useState("2024/2025");
  const [rekapData, setRekapData] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const guruId = getUserId();

        if (!guruId) {
          toast.error("User guru-mapel tidak terbaca");
          return;
        }

        const res = await academicApi.getMapelByGuru(guruId);
        const assignments = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];

        setAssignmentList(assignments);
        setMapelList(assignments);

        const uniqueKelas = Object.values(
          assignments.reduce((acc, item) => {
            const kelasId = item.kelas_id;
            if (kelasId && !acc[kelasId]) {
              acc[kelasId] = {
                id: item.kelas_id,
                kelas_id: item.kelas_id,
                nama_kelas: item.nama_kelas,
                tingkat: item.tingkat,
              };
            }
            return acc;
          }, {}),
        );

        setKelasList(uniqueKelas);
      } catch (err) {
        console.error("Gagal memuat assignment guru-mapel:", err);
        toast.error("Gagal memuat kelas dan mapel yang diassign");
      }
    };

    loadAssignment();
  }, []);

  const totalBobot = Object.values(bobot).reduce(
    (a, b) => a + Number(b || 0),
    0,
  );
  const bobotValid = totalBobot === 100;

  const handleBobotChange = (key, val) => {
    setBobot((prev) => ({ ...prev, [key]: val }));
  };

  const handleBobotReset = () => {
    setBobot({ ...BOBOT_DEFAULT });
    toast.success("Bobot dikembalikan ke default");
  };

  const handleSelectMapel = (mapelId) => {
    setSelectedMapel(mapelId);

    const selected = assignmentList.find(
      (m) => String(m.mapel_id || m.id) === String(mapelId),
    );

    if (selected?.kelas_id) {
      setSelectedKelas(String(selected.kelas_id));
    }
  };

  const fetchData = useCallback(async () => {
    if (!selectedMapel || !selectedKelas) {
      toast.error("Pilih mapel dan kelas terlebih dahulu");
      return;
    }

    setLoading(true);
    setSudahCari(true);

    try {
      const [siswaRes, nilaiRes] = await Promise.all([
        academicApi.getSiswaByKelas(selectedKelas),
        studentApi.getNilaiSiswa({
          kelas_id: selectedKelas,
          mapel_id: selectedMapel,
          tahun_ajar: selectedTahun,
          semester: "ganjil",
        }),
      ]);

      const siswa = Array.isArray(siswaRes.data)
        ? siswaRes.data
        : Array.isArray(siswaRes.data?.data)
          ? siswaRes.data.data
          : [];

      const nilai = Array.isArray(nilaiRes.data?.data)
        ? nilaiRes.data.data
        : [];

      if (nilai.length > 0) {
        const n = nilai[0];
        if (
          n.bobot_tugas !== undefined &&
          n.bobot_kuis !== undefined &&
          n.bobot_uts !== undefined &&
          n.bobot_uas !== undefined &&
          n.bobot_praktik !== undefined
        ) {
          setBobot({
            tugas: Number(n.bobot_tugas),
            kuis: Number(n.bobot_kuis),
            uts: Number(n.bobot_uts),
            uas: Number(n.bobot_uas),
            praktik: Number(n.bobot_praktik),
          });
        }
      }

      const nilaiMap = {};
      nilai.forEach((n) => {
        nilaiMap[n.siswa_id] = n;
      });

      const merged = siswa.map((s) => {
        const existing = nilaiMap[s.id] || {};

        return {
          siswa_id: s.id,
          nama_lengkap: s.nama_lengkap || s.namasiswa || s.nama_siswa || "-",
          nisn: s.nisn || "-",
          tugas: existing.tugas ?? 0,
          kuis: existing.kuis ?? 0,
          uts: existing.uts ?? 0,
          uas: existing.uas ?? 0,
          praktik: existing.praktik ?? 0,
          nilai_akhir: existing.nilai_akhir ?? 0,
          _dirty: false,
        };
      });

      const filtered = searchNama
        ? merged.filter((r) =>
            r.nama_lengkap?.toLowerCase().includes(searchNama.toLowerCase()),
          )
        : merged;

      setRows(filtered);
      setPage(1);
    } catch (err) {
      console.error("Gagal memuat data nilai:", err);
      toast.error("Gagal memuat data siswa dan nilai");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedKelas, selectedMapel, selectedTahun, searchNama, assignmentList]);

  const handleNilaiChange = (idx, field, val) => {
    const parsed = val === "" ? "" : Math.min(100, Math.max(0, Number(val)));

    setRows((prev) =>
      prev.map((r, i) =>
        i === idx
          ? {
              ...r,
              [field]: parsed,
              _dirty: true,
            }
          : r,
      ),
    );
  };

  const handleSimpan = async () => {
    if (!selectedMapel) {
      toast.error("Pilih mata pelajaran sebelum menyimpan");
      return;
    }

    if (!selectedKelas) {
      toast.error("Pilih kelas sebelum menyimpan");
      return;
    }

    if (!bobotValid) {
      toast.error("Total bobot harus 100% sebelum menyimpan");
      return;
    }

    const guruId = getUserId();

    if (!guruId) {
      toast.error("User guru-mapel tidak terbaca");
      return;
    }

    setSaving(true);

    try {
      await studentApi.createOrUpdateNilaiSiswa({
        kelas_id: selectedKelas,
        mapel_id: selectedMapel,
        tahun_ajar: selectedTahun,
        semester: "ganjil",
        bobot: {
          tugas: bobot.tugas,
          kuis: bobot.kuis,
          uts: bobot.uts,
          uas: bobot.uas,
          praktik: bobot.praktik,
        },
        data_nilai: rows.map((r) => ({
          siswa_id: r.siswa_id,
          tugas: Number(r.tugas) || 0,
          kuis: Number(r.kuis) || 0,
          uts: Number(r.uts) || 0,
          uas: Number(r.uas) || 0,
          praktik: Number(r.praktik) || 0,
        })),
      });

      toast.success("Semua nilai berhasil disimpan!");
      setRows((prev) => prev.map((r) => ({ ...r, _dirty: false })));
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan nilai:", err);
      toast.error(
        err?.response?.data?.message || "Gagal menyimpan nilai. Coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  };

  const enrichNilaiWithSiswa = async (kelasId, nilaiRows) => {
    try {
      const siswaRes = await academicApi.getSiswaByKelas(kelasId);
      const siswa = Array.isArray(siswaRes.data)
        ? siswaRes.data
        : Array.isArray(siswaRes.data?.data)
          ? siswaRes.data.data
          : [];

      const siswaMap = {};
      siswa.forEach((s) => {
        siswaMap[s.id] = s;
      });

      return nilaiRows.map((n) => {
        const s = siswaMap[n.siswa_id] || {};
        return {
          ...n,
          nama_lengkap:
            s.nama_lengkap ||
            s.namasiswa ||
            s.nama_siswa ||
            `Siswa #${n.siswa_id}`,
          nisn: s.nisn || "-",
        };
      });
    } catch {
      return nilaiRows;
    }
  };

  const handleLoadRiwayat = async () => {
    if (!riwayatKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    setLoadingRiwayat(true);

    try {
      const res = await studentApi.getNilaiSiswa({
        kelas_id: riwayatKelas,
        mapel_id: riwayatMapel || undefined,
        tahun_ajar: riwayatTahun,
        semester: "ganjil",
      });

      const nilai = Array.isArray(res.data?.data) ? res.data.data : [];
      const enriched = await enrichNilaiWithSiswa(riwayatKelas, nilai);

      setRiwayatData(enriched);
      setRiwayatPage(1);
    } catch {
      toast.error("Gagal memuat riwayat");
      setRiwayatData([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const handleLoadRekap = async () => {
    if (!rekapKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    setLoadingRekap(true);

    try {
      const res = await studentApi.getRekapNilai({
        kelas_id: rekapKelas,
        mapel_id: rekapMapel || undefined,
        tahun_ajar: rekapTahun,
        semester: "ganjil",
      });

      const nilai = Array.isArray(res.data?.data) ? res.data.data : [];
      const enriched = await enrichNilaiWithSiswa(rekapKelas, nilai);

      setRekapData(enriched);
    } catch {
      toast.error("Gagal memuat rekap");
      setRekapData([]);
    } finally {
      setLoadingRekap(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const riwayatTotalPages = Math.max(
    1,
    Math.ceil(riwayatData.length / PAGE_SIZE),
  );
  const pagedRiwayat = riwayatData.slice(
    (riwayatPage - 1) * PAGE_SIZE,
    riwayatPage * PAGE_SIZE,
  );

  const nilaiList = rekapData.map((r) =>
    Number(r.nilai_akhir ?? hitungNilaiAkhir(r, bobot)),
  );
  const rataRata = nilaiList.length
    ? (nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length).toFixed(2)
    : "-";
  const tertinggi = nilaiList.length ? Math.max(...nilaiList).toFixed(2) : "-";
  const terendah = nilaiList.length ? Math.min(...nilaiList).toFixed(2) : "-";
  const lulus = nilaiList.filter((n) => n >= 70).length;

  const namaKelas =
    kelasList.find((k) => String(k.id || k.kelas_id) === String(selectedKelas))
      ?.nama_kelas || "";

  const namaMapel =
    mapelList.find((m) => String(m.mapel_id || m.id) === String(selectedMapel))
      ?.nama_mapel || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-blue-600 rounded-full" />
            <h1 className="text-xl font-bold text-gray-800">
              Input & Kelola Nilai
            </h1>
          </div>

          <button
            onClick={() => setShowBobot((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              showBobot
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : bobotValid
                  ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  : "bg-red-50 border-red-300 text-red-700"
            }`}
          >
            ⚖️ Atur Bobot
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                bobotValid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {totalBobot}%
            </span>
          </button>
        </div>

        {showBobot && (
          <BobotEditor
            bobot={bobot}
            onChange={handleBobotChange}
            onReset={handleBobotReset}
          />
        )}

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">
        {tab === "input" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Mapel & Kelas
                  </label>
                  <select
                    value={selectedMapel}
                    onChange={(e) => handleSelectMapel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Mapel & Kelas --</option>
                    {mapelList.map((m) => (
                      <option
                        key={`${m.mapel_id || m.id}-${m.kelas_id}`}
                        value={m.mapel_id || m.id}
                      >
                        {m.nama_mapel} — {m.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={selectedKelas}
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-100"
                  >
                    <option value="">-- Kelas otomatis --</option>
                    {kelasList.map((k) => (
                      <option
                        key={k.id || k.kelas_id}
                        value={k.id || k.kelas_id}
                      >
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Tahun Ajar
                  </label>
                  <select
                    value={selectedTahun}
                    onChange={(e) => setSelectedTahun(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TAHUN_AJAR_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Cari Nama
                  </label>
                  <input
                    type="text"
                    value={searchNama}
                    onChange={(e) => setSearchNama(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchData()}
                    placeholder="Ketik nama..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                  >
                    {loading ? "..." : "CARI"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMapel("");
                      setSelectedKelas("");
                      setRows([]);
                      setSudahCari(false);
                    }}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                  >
                    RESET
                  </button>
                </div>
              </div>
            </div>

            {sudahCari && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-base font-bold text-gray-800">
                      Daftar Nilai
                      {namaKelas && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          — {namaKelas}
                        </span>
                      )}
                    </h2>
                    {rows.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {rows.length} siswa
                      </p>
                    )}
                  </div>

                  {namaMapel && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {namaMapel}
                    </span>
                  )}
                </div>

                <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex flex-wrap gap-3 text-xs text-amber-700 items-center">
                  <span className="font-semibold">⚖️ Bobot aktif:</span>
                  {KOMPONEN.map((k) => (
                    <span key={k.key}>
                      {k.label}{" "}
                      <span className="font-bold text-blue-600">
                        {bobot[k.key]}%
                      </span>
                    </span>
                  ))}
                  {!bobotValid && (
                    <span className="text-red-600 font-bold ml-2">
                      ⚠️ Total {totalBobot}% — harus 100%!
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="py-16 text-center text-gray-400">
                    <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                    <p>Memuat data...</p>
                  </div>
                ) : rows.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <div className="text-5xl mb-3">📋</div>
                    <p>Tidak ada siswa ditemukan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-3 text-left w-10">No</th>
                          <th className="px-4 py-3 text-left">Nama Siswa</th>
                          {KOMPONEN.map((k) => (
                            <th
                              key={k.key}
                              className="px-4 py-3 text-center w-24"
                            >
                              {k.label}
                              <div className="text-blue-500 font-normal normal-case text-xs">
                                {bobot[k.key]}%
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center w-28">AKHIR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pagedRows.map((row, localIdx) => {
                          const globalIdx = (page - 1) * PAGE_SIZE + localIdx;
                          const akhir = hitungNilaiAkhir(row, bobot);

                          return (
                            <tr
                              key={row.siswa_id}
                              className={`transition-colors ${
                                row._dirty
                                  ? "bg-yellow-50/60"
                                  : "hover:bg-gray-50/70"
                              }`}
                            >
                              <td className="px-4 py-3 text-gray-400">
                                {globalIdx + 1}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-800">
                                  {row.nama_lengkap}
                                </div>
                                <div className="text-xs text-gray-400">
                                  NIS: {row.nisn}
                                </div>
                              </td>

                              {KOMPONEN.map((k) => (
                                <td
                                  key={k.key}
                                  className="px-4 py-3 text-center"
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={row[k.field]}
                                    onChange={(e) =>
                                      handleNilaiChange(
                                        globalIdx,
                                        k.field,
                                        e.target.value,
                                      )
                                    }
                                    className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                </td>
                              ))}

                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`font-bold text-base ${
                                    Number(akhir) >= 75
                                      ? "text-blue-600"
                                      : Number(akhir) >= 60
                                        ? "text-yellow-600"
                                        : "text-red-500"
                                  }`}
                                >
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

                {!loading && rows.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Halaman {page} dari {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                      >
                        ← Sebelumnya
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                      >
                        Selanjutnya →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {sudahCari && rows.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleSimpan}
                  disabled={saving || !bobotValid}
                  title={!bobotValid ? "Total bobot harus 100%" : ""}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 px-10 rounded-2xl text-sm shadow-lg shadow-blue-200 transition-all"
                >
                  {saving ? "MENYIMPAN..." : "SIMPAN SEMUA NILAI"}
                </button>
              </div>
            )}
          </>
        )}

        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">
                Riwayat Input Nilai
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={riwayatKelas}
                    onChange={(e) => setRiwayatKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((k) => (
                      <option
                        key={k.id || k.kelas_id}
                        value={k.id || k.kelas_id}
                      >
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Mapel
                  </label>
                  <select
                    value={riwayatMapel}
                    onChange={(e) => setRiwayatMapel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Mapel</option>
                    {mapelList.map((m) => (
                      <option
                        key={`${m.mapel_id || m.id}-${m.kelas_id}`}
                        value={m.mapel_id || m.id}
                      >
                        {m.nama_mapel} — {m.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Tahun Ajar
                  </label>
                  <select
                    value={riwayatTahun}
                    onChange={(e) => setRiwayatTahun(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TAHUN_AJAR_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
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

            {loadingRiwayat ? (
              <div className="py-12 text-center text-gray-400">
                Memuat data...
              </div>
            ) : riwayatData.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p>Pilih filter dan klik Tampilkan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3 text-left">No</th>
                        <th className="px-5 py-3 text-left">Nama Siswa</th>
                        {KOMPONEN.map((k) => (
                          <th key={k.key} className="px-5 py-3 text-center">
                            {k.label}
                          </th>
                        ))}
                        <th className="px-5 py-3 text-center">Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedRiwayat.map((r, i) => {
                        const akhir = Number(
                          r.nilai_akhir ?? hitungNilaiAkhir(r, bobot),
                        ).toFixed(2);

                        return (
                          <tr key={i} className="hover:bg-gray-50/70">
                            <td className="px-5 py-3 text-gray-400">
                              {(riwayatPage - 1) * PAGE_SIZE + i + 1}
                            </td>
                            <td className="px-5 py-3 font-semibold text-gray-800">
                              {r.nama_lengkap}
                            </td>
                            {KOMPONEN.map((k) => (
                              <td
                                key={k.key}
                                className="px-5 py-3 text-center text-gray-600"
                              >
                                {r[k.field] ?? "-"}
                              </td>
                            ))}
                            <td className="px-5 py-3 text-center">
                              <span
                                className={`font-bold ${
                                  Number(akhir) >= 75
                                    ? "text-blue-600"
                                    : Number(akhir) >= 60
                                      ? "text-yellow-600"
                                      : "text-red-500"
                                }`}
                              >
                                {akhir}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {riwayatData.length > PAGE_SIZE && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Halaman {riwayatPage} dari {riwayatTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setRiwayatPage((p) => Math.max(1, p - 1))
                        }
                        disabled={riwayatPage <= 1}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                      >
                        ← Sebelumnya
                      </button>
                      <button
                        onClick={() =>
                          setRiwayatPage((p) =>
                            Math.min(riwayatTotalPages, p + 1),
                          )
                        }
                        disabled={riwayatPage >= riwayatTotalPages}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
                      >
                        Selanjutnya →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "rekap" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={rekapKelas}
                    onChange={(e) => setRekapKelas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((k) => (
                      <option
                        key={k.id || k.kelas_id}
                        value={k.id || k.kelas_id}
                      >
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Mapel
                  </label>
                  <select
                    value={rekapMapel}
                    onChange={(e) => setRekapMapel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Mapel</option>
                    {mapelList.map((m) => (
                      <option
                        key={`${m.mapel_id || m.id}-${m.kelas_id}`}
                        value={m.mapel_id || m.id}
                      >
                        {m.nama_mapel} — {m.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                    Tahun Ajar
                  </label>
                  <select
                    value={rekapTahun}
                    onChange={(e) => setRekapTahun(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TAHUN_AJAR_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleLoadRekap}
                  disabled={loadingRekap}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {loadingRekap ? "Memuat..." : "📊 Tampilkan Rekap"}
                </button>
              </div>
            </div>

            {rekapData.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Rata-rata", value: rataRata, icon: "📊" },
                    { label: "Tertinggi", value: tertinggi, icon: "🏆" },
                    { label: "Terendah", value: terendah, icon: "📉" },
                    {
                      label: "Lulus (≥70)",
                      value: `${lulus}/${rekapData.length}`,
                      icon: "✅",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {s.value}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 text-left">No</th>
                          <th className="px-5 py-3 text-left">Nama Siswa</th>
                          {KOMPONEN.map((k) => (
                            <th key={k.key} className="px-5 py-3 text-center">
                              {k.label}
                            </th>
                          ))}
                          <th className="px-5 py-3 text-center">Akhir</th>
                          <th className="px-5 py-3 text-center">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rekapData.map((r, i) => {
                          const akhir = Number(
                            r.nilai_akhir ?? hitungNilaiAkhir(r, bobot),
                          ).toFixed(2);
                          const pred = getPredikat(akhir);

                          return (
                            <tr
                              key={i}
                              className="hover:bg-blue-50/30 transition-colors"
                            >
                              <td className="px-5 py-3 text-gray-400">
                                {i + 1}
                              </td>
                              <td className="px-5 py-3">
                                <div className="font-semibold text-gray-800">
                                  {r.nama_lengkap}
                                </div>
                                <div className="text-xs text-gray-400">
                                  NIS: {r.nisn}
                                </div>
                              </td>
                              {KOMPONEN.map((k) => (
                                <td
                                  key={k.key}
                                  className={`px-5 py-3 text-center font-medium ${
                                    Number(r[k.field]) >= 70
                                      ? "text-gray-700"
                                      : "text-red-500"
                                  }`}
                                >
                                  {r[k.field] ?? "-"}
                                </td>
                              ))}
                              <td className="px-5 py-3 text-center">
                                <span
                                  className={`font-bold text-base ${
                                    Number(akhir) >= 75
                                      ? "text-blue-600"
                                      : Number(akhir) >= 60
                                        ? "text-yellow-600"
                                        : "text-red-500"
                                  }`}
                                >
                                  {akhir}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded-full border ${pred.color}`}
                                >
                                  {pred.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!loadingRekap && rekapData.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">📊</p>
                <p>Pilih filter dan klik Tampilkan Rekap</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
