import { bacaJson } from "../utils/bacaJson.js";

export const getDashboardGuru = (req, res) => {
  const absensiGuru = bacaJson("absensiGuruMandiri.json");
  const absensiSiswa = bacaJson("absensiSiswa.json");
  const nilaiSiswa = bacaJson("nilaiSiswa.json");

  const guruId = req.user?.sub || req.user?.id;
  const hariIni = new Date().toISOString().split("T")[0];

  const absensiHariIni = absensiGuru.find(
    (item) => item.guruId === guruId && item.tanggal === hariIni
  );

  res.json({
    success: true,
    guru: {
      id: guruId,
      nama: req.user?.name || req.user?.preferred_username || "Tanpa Nama",
      email: req.user?.email || null,
    },
    ringkasan: {
      sudahAbsensiHariIni: !!absensiHariIni,
      totalAbsensiGuru: absensiGuru.filter((x) => x.guruId === guruId).length,
      totalInputAbsensiSiswa: absensiSiswa.filter((x) => x.guruId === guruId).length,
      totalInputNilai: nilaiSiswa.filter((x) => x.guruId === guruId).length,
    },
  });
};