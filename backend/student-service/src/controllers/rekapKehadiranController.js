const fs = require('fs');
const path = require('path');
const { createError } = require('../middleware/errorHandler');

const DATA_FILE = path.join(__dirname, '../data/rekapKehadiran.json');

const readData = () => {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
};

/**
 * GET /api/students/rekap-kehadiran
 * Query params:
 *   - semester   : "Ganjil" | "Genap"
 *   - tahunAjaran: "2024/2025"
 *   - id_kelas   : filter per kelas
 *   - search     : cari berdasarkan nama siswa / NIS
 */
exports.getAllRekapKehadiran = (req, res, next) => {
  try {
    let data = readData();
    const { semester, tahunAjaran, id_kelas, search } = req.query;

    if (semester) {
      data = data.filter((d) => d.semester.toLowerCase() === semester.toLowerCase());
    }
    if (tahunAjaran) {
      data = data.filter((d) => d.tahunAjaran === tahunAjaran);
    }
    if (id_kelas) {
      data = data.filter((d) => d.id_kelas === id_kelas);
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
    const rataRataKehadiran =
      totalSiswa > 0
        ? parseFloat(
            (data.reduce((sum, d) => sum + d.persentaseKehadiran, 0) / totalSiswa).toFixed(2)
          )
        : 0;

    res.json({
      success: true,
      meta: { totalSiswa, rataRataKehadiran },
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/rekap-kehadiran/:id
 * Ambil detail rekap kehadiran satu siswa
 */
exports.getRekapKehadiranById = (req, res, next) => {
  try {
    const data = readData();
    const item = data.find((d) => d.id === req.params.id);

    if (!item) {
      throw createError(404, `Rekap kehadiran dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};