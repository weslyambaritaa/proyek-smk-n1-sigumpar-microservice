const fs = require('fs');
const path = require('path');
const { createError } = require('../middleware/errorHandler');

const DATA_FILE = path.join(__dirname, '../data/rekapNilai.json');

const readData = () => {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
};

/**
 * GET /api/students/rekap-nilai
 * Query params:
 *   - semester   : "Ganjil" | "Genap"
 *   - tahunAjaran: "2024/2025"
 *   - id_kelas   : filter per kelas
 *   - search     : cari berdasarkan nama siswa / NIS
 *   - keterangan : "Naik Kelas" | "Perlu Perhatian"
 */
exports.getAllRekapNilai = (req, res, next) => {
  try {
    let data = readData();
    const { semester, tahunAjaran, id_kelas, search, keterangan } = req.query;

    if (semester) {
      data = data.filter((d) => d.semester.toLowerCase() === semester.toLowerCase());
    }
    if (tahunAjaran) {
      data = data.filter((d) => d.tahunAjaran === tahunAjaran);
    }
    if (id_kelas) {
      data = data.filter((d) => d.id_kelas === id_kelas);
    }
    if (keterangan) {
      data = data.filter((d) =>
        d.keterangan.toLowerCase().includes(keterangan.toLowerCase())
      );
    }
    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.namaSiswa.toLowerCase().includes(keyword) ||
          d.NIS.toLowerCase().includes(keyword)
      );
    }

    // Hitung ringkasan statistik kelas
    const totalSiswa = data.length;
    const rataRataKelas =
      totalSiswa > 0
        ? parseFloat(
            (data.reduce((sum, d) => sum + d.rataRata, 0) / totalSiswa).toFixed(2)
          )
        : 0;
    const nilaiTertinggi = totalSiswa > 0 ? Math.max(...data.map((d) => d.rataRata)) : 0;
    const nilaiTerendah = totalSiswa > 0 ? Math.min(...data.map((d) => d.rataRata)) : 0;

    res.json({
      success: true,
      meta: { totalSiswa, rataRataKelas, nilaiTertinggi, nilaiTerendah },
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/rekap-nilai/:id
 * Ambil detail nilai lengkap per mata pelajaran untuk satu siswa
 */
exports.getRekapNilaiById = (req, res, next) => {
  try {
    const data = readData();
    const item = data.find((d) => d.id === req.params.id);

    if (!item) {
      throw createError(404, `Rekap nilai dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};