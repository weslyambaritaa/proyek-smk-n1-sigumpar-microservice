import { bacaJson } from "../utils/bacaJson.js";
import { tulisJson } from "../utils/tulisJson.js";
import { ambilDataSiswa } from "../utils/studentApi.js";

const FILE = "absensiSiswa.json";

export const getDataAbsensiSiswa = async (req, res) => {
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
          status: "Hadir",
        }))
      : siswa.map((item) => ({
          id: item.id,
          nis: item.nis,
          nama: item.nama,
          status: "Hadir",
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

export const simpanAbsensiSiswa = (req, res) => {
  const data = bacaJson(FILE);
  const { tanggal, kelas, mapel, tahunAjar, records } = req.body;

  const itemBaru = {
    id: Date.now(),
    guruId: req.user?.sub || req.user?.id,
    guruNama: req.user?.name || req.user?.preferred_username || "Tanpa Nama",
    tanggal,
    kelas,
    mapel,
    tahunAjar,
    records: records || [],
    waktuKirim: new Date().toISOString(),
  };

  data.unshift(itemBaru);
  tulisJson(FILE, data);

  res.status(201).json({
    success: true,
    message: "Absensi siswa berhasil disimpan",
    data: itemBaru,
  });
};