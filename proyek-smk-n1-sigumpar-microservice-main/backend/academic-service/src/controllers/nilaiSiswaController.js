import { bacaJson } from "../utils/bacaJson.js";
import { tulisJson } from "../utils/tulisJson.js";
import { ambilDataSiswa } from "../utils/studentApi.js";

const FILE = "nilaiSiswa.json";

export const getDataNilaiSiswa = async (req, res) => {
  try {
    const { kelas, namaSiswa } = req.query;
    const token = req.headers.authorization.split(" ")[1];

    const query = new URLSearchParams();
    if (kelas) query.set("kelas", kelas);
    if (namaSiswa) query.set("nama", namaSiswa);

    const siswa = await ambilDataSiswa(token, `?${query.toString()}`);

    const hasil = siswa.data
      ? siswa.data.map((item) => ({
          id: item.id,
          nis: item.nis,
          nama: item.nama,
          tugas: 0,
          kuis: 0,
          uts: 0,
          uas: 0,
          praktik: 0,
        }))
      : siswa.map((item) => ({
          id: item.id,
          nis: item.nis,
          nama: item.nama,
          tugas: 0,
          kuis: 0,
          uts: 0,
          uas: 0,
          praktik: 0,
        }));

    res.json({
      success: true,
      data: hasil,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const simpanNilaiSiswa = (req, res) => {
  const data = bacaJson(FILE);
  const { kelas, mapel, tahunAjar, scores } = req.body;

  const hasilNilai = (scores || []).map((item) => {
    const tugas = Number(item.tugas || 0);
    const kuis = Number(item.kuis || 0);
    const uts = Number(item.uts || 0);
    const uas = Number(item.uas || 0);
    const praktik = Number(item.praktik || 0);

    return {
      studentId: Number(item.studentId),
      tugas,
      kuis,
      uts,
      uas,
      praktik,
      nilaiAkhir: Number(((tugas + kuis + uts + uas + praktik) / 5).toFixed(2)),
    };
  });

  const itemBaru = {
    id: Date.now(),
    guruId: req.user?.sub || req.user?.id,
    guruNama: req.user?.name || req.user?.preferred_username || "Tanpa Nama",
    kelas,
    mapel,
    tahunAjar,
    scores: hasilNilai,
    waktuKirim: new Date().toISOString(),
  };

  data.unshift(itemBaru);
  tulisJson(FILE, data);

  res.status(201).json({
    success: true,
    message: "Nilai siswa berhasil disimpan",
    data: itemBaru,
  });
};