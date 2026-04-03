import { bacaJson } from "../utils/bacaJson.js";

export function getSiswa(req, res) {
  const { kelas, nama } = req.query;
  let data = bacaJson("siswa.json");

  if (kelas) {
    data = data.filter((item) => item.kelas === kelas);
  }

  if (nama) {
    data = data.filter((item) =>
      item.nama.toLowerCase().includes(nama.toLowerCase())
    );
  }

  res.json(data);
}