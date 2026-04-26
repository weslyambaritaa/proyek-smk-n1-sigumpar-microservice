import React, { useEffect, useState } from "react";
import studentApi from "/src/api/studentApi";
import academicApi from "/src/api/academicApi";

const STATUS_OPTS = ["hadir", "izin", "sakit", "alpa", "terlambat"];

const PresensiKelasPage = () => {
  const [kelasId, setKelasId] = useState("");
  const [kelasList, setKelasList] = useState([]);

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [siswaList, setSiswaList] = useState([]);
  const [absensi, setAbsensi] = useState({});
  const [rekap, setRekap] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ================================
  // GET USER ID DARI TOKEN (SAFE)
  // ================================
  const getUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.id;
    } catch (e) {
      console.error("Token error:", e);
      return null;
    }
  };

  // ================================
  // FETCH KELAS WALI
  // ================================
  const fetchKelas = async () => {
  try {
    const userId = getUserId();
    console.log("USER ID:", userId);

    const res = await academicApi.getKelasByWali(userId);

    console.log("FULL RESPONSE:", res);
    console.log("DATA:", res.data);

    setKelasList(res.data?.data || []);
  } catch (err) {
    console.error("ERROR DETAIL:", err);
  }
};

  useEffect(() => {
    fetchKelas();
  }, []);

  // ================================
  // AUTO SELECT JIKA 1 KELAS
  // ================================
  useEffect(() => {
    if (kelasList.length === 1) {
      setKelasId(kelasList[0].id);
    }
  }, [kelasList]);

  // ================================
  // FETCH DATA PRESENSI
  // ================================
  const fetchData = async () => {
    if (!kelasId || !tanggal) return;

    setLoading(true);

    try {
      const [siswaRes, absensiRes] = await Promise.all([
        academicApi.getSiswaByKelas(kelasId),
        studentApi.getRekapKehadiran({
          kelas_id: kelasId,
          tanggal,
        }),
      ]);

      const siswa = Array.isArray(siswaRes.data)
        ? siswaRes.data
        : siswaRes.data?.data || [];

      const absensiRows = Array.isArray(absensiRes.data?.data)
        ? absensiRes.data.data
        : [];

      const absensiMap = {};
      absensiRows.forEach((a) => {
        absensiMap[a.siswa_id] = {
          status: a.status || "hadir",
          keterangan: a.keterangan || "",
        };
      });

      const merged = siswa.map((s) => ({
        siswa_id: s.id,
        nama_lengkap: s.nama_lengkap || s.namasiswa || s.nama_siswa || "-",
        status: absensiMap[s.id]?.status || "hadir",
        keterangan: absensiMap[s.id]?.keterangan || "",
      }));

      setSiswaList(merged);

      const map = {};
      merged.forEach((s) => {
        map[s.siswa_id] = {
          status: s.status,
          keterangan: s.keterangan,
        };
      });

      setAbsensi(map);
      setRekap(merged);
    } catch (err) {
      console.error("Gagal load data presensi:", err);
      alert("Gagal mengambil data presensi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kelasId && tanggal) {
      fetchData();
    }
  }, [kelasId, tanggal]);

  // ================================
  // SET STATUS
  // ================================
  const setStatus = (id, status) => {
    setAbsensi((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        status: status.toLowerCase(),
      },
    }));
  };

  // ================================
  // SET KETERANGAN
  // ================================
  const setKeterangan = (id, ket) => {
    setAbsensi((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        keterangan: ket,
      },
    }));
  };

  // ================================
  // SUBMIT
  // ================================
  const handleSubmit = async () => {
    if (!kelasId || !tanggal) {
      alert("Pilih kelas dan tanggal");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        kelas_id: kelasId,
        tanggal,
        data_absensi: siswaList.map((s) => ({
          siswa_id: s.siswa_id,
          status: (absensi[s.siswa_id]?.status || "hadir").toLowerCase(),
          keterangan: absensi[s.siswa_id]?.keterangan || "",
        })),
      };

      await studentApi.createRekapKehadiran(payload);

      alert("Presensi berhasil disimpan");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan presensi");
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // STATISTIK
  // ================================
  const getStatistik = () => {
    const stats = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
      terlambat: 0,
    };

    rekap.forEach((r) => {
      const s = (r.status || "").toLowerCase();
      if (stats[s] !== undefined) stats[s]++;
    });

    return stats;
  };

  const stats = getStatistik();

  // ================================
  // EXPORT CSV
  // ================================
  const exportExcel = () => {
    const rows = [
      ["Nama Siswa", "Status", "Keterangan"],
      ...rekap.map((r) => [r.nama_lengkap, r.status, r.keterangan || ""]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `rekap_presensi_${tanggal}.csv`;
    link.click();
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Presensi Kelas</h1>

      {/* FILTER */}
      <div className="flex gap-4 mb-4">
        <select
          value={kelasId}
          onChange={(e) => setKelasId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Pilih Kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.tingkat} - {k.nama_kelas}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* REKAP */}
      <div className="mb-4">
        <h2 className="font-semibold">Rekap</h2>
        <div className="flex gap-4 text-sm">
          {Object.entries(stats).map(([k, v]) => (
            <span key={k}>
              {k}: <b>{v}</b>
            </span>
          ))}
        </div>

        <button
          onClick={exportExcel}
          className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
        >
          Export Excel
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {siswaList.map((s) => (
              <tr key={s.siswa_id}>
                <td className="p-2 border">{s.nama_lengkap}</td>

                <td className="p-2 border">
                  <select
                    value={absensi[s.siswa_id]?.status || "hadir"}
                    onChange={(e) => setStatus(s.siswa_id, e.target.value)}
                  >
                    {STATUS_OPTS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border">
                  <input
                    type="text"
                    value={absensi[s.siswa_id]?.keterangan || ""}
                    onChange={(e) => setKeterangan(s.siswa_id, e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? "Menyimpan..." : "Simpan Presensi"}
      </button>
    </div>
  );
};

export default PresensiKelasPage;
