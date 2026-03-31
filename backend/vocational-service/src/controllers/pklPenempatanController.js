const pool = require("../config/db");

/**
 * GET /api/pkl/penempatan
 * Ambil semua data penempatan PKL.
 */
const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pkl_penempatan ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/pkl/penempatan
 * Buat laporan penempatan PKL baru (dengan opsional foto_lokasi dari multer).
 * Body: { nama_siswa, nama_perusahaan, alamat_singkat, tanggal,
 *         judul_penempatan, deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing }
 * File: foto_lokasi
 */
const create = async (req, res, next) => {
  const {
    nama_siswa, nama_perusahaan, alamat_singkat, tanggal,
    judul_penempatan, deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing,
  } = req.body;
  const foto_lokasi = req.file ? req.file.filename : null;
  // Konversi string kosong ke null untuk kolom DATE
  const tanggalValue = tanggal && tanggal.trim() !== "" ? tanggal : null;
  try {
    const result = await pool.query(
      `INSERT INTO pkl_penempatan
         (nama_siswa, nama_perusahaan, alamat_singkat, tanggal,
          judul_penempatan, deskripsi_pekerjaan, pembimbing_industri,
          kontak_pembimbing, foto_lokasi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nama_siswa, nama_perusahaan, alamat_singkat, tanggalValue,
        judul_penempatan, deskripsi_pekerjaan, pembimbing_industri,
        kontak_pembimbing, foto_lokasi,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create };
