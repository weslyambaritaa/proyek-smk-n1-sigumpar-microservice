import { bacaJson } from "../utils/bacaJson.js";
import { tulisJson } from "../utils/tulisJson.js";

const FILE = "absensiGuruMandiri.json";

export const getAbsensiGuruMandiri = (req, res) => {
  const guruId = req.user?.sub || req.user?.id;
  const data = bacaJson(FILE).filter((item) => item.guruId === guruId);

  res.json({
    success: true,
    data,
  });
};

export const tambahAbsensiGuruMandiri = (req, res) => {
  const data = bacaJson(FILE);
  const { tanggal, status, keterangan, fotoUrl } = req.body;

  const sekarang = new Date();
  const tanggalDipilih = new Date(tanggal);
  const hariIni = tanggalDipilih.toDateString() === sekarang.toDateString();
  const jam = sekarang.getHours();
  const menit = sekarang.getMinutes();

  if (hariIni && (jam > 7 || (jam === 7 && menit > 30))) {
    return res.status(400).json({
      success: false,
      message: "Batas absensi pagi maksimal pukul 07:30",
    });
  }

  if (status === "Hadir" && !fotoUrl) {
    return res.status(400).json({
      success: false,
      message: "fotoUrl wajib diisi untuk status hadir",
    });
  }

  const itemBaru = {
    id: Date.now(),
    guruId: req.user?.sub || req.user?.id,
    namaGuru: req.user?.name || req.user?.preferred_username || "Tanpa Nama",
    tanggal,
    status,
    keterangan: keterangan || "",
    fotoUrl: fotoUrl || null,
    waktuKirim: new Date().toISOString(),
  };

  data.unshift(itemBaru);
  tulisJson(FILE, data);

  res.status(201).json({
    success: true,
    message: "Absensi guru mandiri berhasil disimpan",
    data: itemBaru,
  });
};