import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { studentApi } from "../../api/studentApi";
import { academicApi } from "../../api/academicApi";

const toArray = (res) => {
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

export default function RekapAbsensiSiswaPage() {
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);

  const [kelasId, setKelasId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [search, setSearch] = useState("");

  const [rekapData, setRekapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  useEffect(() => {
    const loadKelas = async () => {
      setLoadingInitial(true);

      try {
        const res = await academicApi.getKelas();
        setKelasList(toArray(res));
      } catch (err) {
        console.error("Gagal memuat kelas:", err);
        toast.error(err?.response?.data?.message || "Gagal memuat data kelas");
        setKelasList([]);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadKelas();
  }, []);

  useEffect(() => {
    const loadByKelas = async () => {
      setMapelId("");
      setMapelList([]);
      setSiswaList([]);
      setRekapData([]);

      if (!kelasId) return;

      try {
        const [mapelRes, siswaRes] = await Promise.all([
          academicApi.getMapel({ kelas_id: kelasId }),
          academicApi.getSiswa({ kelas_id: kelasId }),
        ]);

        setMapelList(toArray(mapelRes));
        setSiswaList(toArray(siswaRes));
      } catch (err) {
        console.error("Gagal memuat mapel/siswa:", err);
        toast.error(
          err?.response?.data?.message || "Gagal memuat mapel atau siswa",
        );
        setMapelList([]);
        setSiswaList([]);
      }
    };

    loadByKelas();
  }, [kelasId]);

  const selectedKelas = useMemo(
    () => kelasList.find((item) => String(item.id) === String(kelasId)),
    [kelasList, kelasId],
  );

  const selectedMapel = useMemo(
    () => mapelList.find((item) => String(item.id) === String(mapelId)),
    [mapelList, mapelId],
  );

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

  const filteredSiswa = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return siswaList;

    return siswaList.filter((siswa) => {
      const nama = String(
        siswa.nama_lengkap || siswa.nama_siswa || siswa.nama || "",
      ).toLowerCase();

      const nisn = String(siswa.nisn || siswa.nis || "").toLowerCase();

      return nama.includes(keyword) || nisn.includes(keyword);
    });
  }, [siswaList, search]);

  const summary = useMemo(() => {
    return filteredSiswa.reduce(
      (acc, siswa) => {
        const data = getRekapBySiswa(siswa.id);

        const hadir = Number(data.hadir || 0);
        const izin = Number(data.izin || 0);
        const sakit = Number(data.sakit || 0);
        const alpa = Number(data.alpa || 0);
        const terlambat = Number(data.terlambat || 0);
        const total = Number(
          data.total || hadir + izin + sakit + alpa + terlambat,
        );

        acc.hadir += hadir;
        acc.izin += izin;
        acc.sakit += sakit;
        acc.alpa += alpa;
        acc.terlambat += terlambat;
        acc.total += total;

        return acc;
      },
      { hadir: 0, izin: 0, sakit: 0, alpa: 0, terlambat: 0, total: 0 },
    );
  }, [filteredSiswa, rekapData]);

  const handleLoadRekap = async () => {
    if (!kelasId) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const res = await studentApi.getRekapAbsensiKepalaSekolah({
        kelas_id: kelasId,
        mapel_id: mapelId || undefined,
        tanggal_mulai: tanggalMulai || undefined,
        tanggal_akhir: tanggalAkhir || undefined,
      });

      setRekapData(toArray(res));
    } catch (err) {
      console.error("Gagal memuat rekap absensi:", err);
      toast.error(err?.response?.data?.message || "Gagal memuat rekap absensi");
      setRekapData([]);
    } finally {
      setLoading(false);
    }
  };

  const namaKelas =
    selectedKelas?.nama_kelas || selectedKelas?.nama || `Kelas ${kelasId}`;

  const namaMapel =
    selectedMapel?.nama_mapel ||
    selectedMapel?.mata_pelajaran ||
    selectedMapel?.nama ||
    `Mapel ${mapelId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Rekap Absensi Siswa
            </h1>
            <p className="text-sm text-gray-500">
              Kepala sekolah dapat melihat rekap absensi siswa per kelas dan
              opsional per mata pelajaran.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Kelas
              </label>
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                disabled={loadingInitial}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingInitial ? "Memuat kelas..." : "-- Pilih Kelas --"}
                </option>

                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama_kelas || kelas.nama || `Kelas ${kelas.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Mata Pelajaran
              </label>
              <select
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                disabled={!kelasId}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Semua Mapel</option>

                {mapelList.map((mapel) => (
                  <option key={mapel.id} value={mapel.id}>
                    {mapel.nama_mapel ||
                      mapel.mata_pelajaran ||
                      mapel.nama ||
                      `Mapel ${mapel.id}`}
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
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleLoadRekap}
              disabled={loading || !kelasId}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
            >
              {loading ? "Memuat..." : "📊 Tampilkan"}
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Search Siswa
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa atau NISN..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {kelasId && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
            <b>Filter aktif:</b> {namaKelas} •{" "}
            {mapelId ? namaMapel : "Semua Mata Pelajaran"}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="rounded-xl p-3 text-center bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
          </div>

          <div className="rounded-xl p-3 text-center bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 mb-1">Hadir</p>
            <p className="text-2xl font-bold text-green-600">{summary.hadir}</p>
          </div>

          <div className="rounded-xl p-3 text-center bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 mb-1">Izin</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.izin}</p>
          </div>

          <div className="rounded-xl p-3 text-center bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 mb-1">Sakit</p>
            <p className="text-2xl font-bold text-blue-600">{summary.sakit}</p>
          </div>

          <div className="rounded-xl p-3 text-center bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 mb-1">Alpa</p>
            <p className="text-2xl font-bold text-red-600">{summary.alpa}</p>
          </div>

          <div className="rounded-xl p-3 text-center bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 mb-1">
              Terlambat
            </p>
            <p className="text-2xl font-bold text-orange-500">
              {summary.terlambat}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Tabel Rekap Absensi</h2>
            <p className="text-xs text-gray-400">
              Jika mapel tidak dipilih, data menampilkan akumulasi seluruh mata
              pelajaran pada kelas tersebut.
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-400">
                Memuat data...
              </div>
            ) : !kelasId ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">🏫</p>
                <p>Pilih kelas terlebih dahulu.</p>
              </div>
            ) : filteredSiswa.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-2">👤</p>
                <p>Tidak ada siswa yang cocok.</p>
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
                    <th className="px-5 py-3 text-center">Terlambat</th>
                    <th className="px-5 py-3 text-center">Total</th>
                    <th className="px-5 py-3 text-center">% Hadir</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {filteredSiswa.map((siswa, index) => {
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
                        <td className="px-5 py-3 text-gray-400">{index + 1}</td>

                        <td className="px-5 py-3 font-semibold text-gray-800">
                          {siswa.nama_lengkap ||
                            siswa.nama_siswa ||
                            siswa.nama ||
                            "-"}
                        </td>

                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {siswa.nisn || siswa.nis || "-"}
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
      </div>
    </div>
  );
}
