import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "../data/perangkatPembelajaran.json");

const bacaData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  const isi = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(isi || "[]");
};

const tulisData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
};

export const getSemuaPerangkatPembelajaran = (req, res) => {
  const data = bacaData();
  res.json({
    success: true,
    data,
  });
};

export const tambahPerangkatPembelajaran = (req, res) => {
  const data = bacaData();

  const { nama, jenis, fileUrl } = req.body;

  if (!nama || !jenis || !fileUrl) {
    return res.status(400).json({
      success: false,
      message: "nama, jenis, dan fileUrl wajib diisi",
    });
  }

  const itemBaru = {
    id: Date.now(),
    nama,
    jenis,
    fileUrl,
    guruId: "guru-demo",
    guruNama: "Guru Demo",
    tanggalUpload: new Date().toISOString(),
  };

  data.unshift(itemBaru);
  tulisData(data);

  res.status(201).json({
    success: true,
    message: "Perangkat pembelajaran berhasil disimpan",
    data: itemBaru,
  });
};

export const hapusPerangkatPembelajaran = (req, res) => {
  const data = bacaData();
  const id = Number(req.params.id);

  const filtered = data.filter((item) => item.id !== id);

  if (filtered.length === data.length) {
    return res.status(404).json({
      success: false,
      message: "Data perangkat pembelajaran tidak ditemukan",
    });
  }

  tulisData(filtered);

  res.json({
    success: true,
    message: "Perangkat pembelajaran berhasil dihapus",
  });
};