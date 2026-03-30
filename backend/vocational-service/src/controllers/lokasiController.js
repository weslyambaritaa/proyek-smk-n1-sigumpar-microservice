const pool = require('../config/db');

// GET semua lokasi PKL (milik guru yang login)
const getAllLokasi = async (req, res, next) => {
  try {
    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM pkl_lokasi WHERE guru_id = $1',
      [guruId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM pkl_lokasi WHERE guru_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [guruId, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST buat laporan lokasi baru
const createLokasi = async (req, res, next) => {
  try {
    const {
      nama_siswa, siswa_id, nama_perusahaan, alamat_singkat,
      tanggal, judul_penempatan, deskripsi_pekerjaan,
      pembimbing_industri, kontak_pembimbing,
    } = req.body;

    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';
    const guruNama = req.user?.name || req.user?.preferred_username || 'Unknown';
    const fotoLokasi = req.file ? `/api/vokasi/uploads/${req.file.filename}` : null;

    if (!nama_siswa || !nama_perusahaan || !tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Nama siswa, nama perusahaan, dan tanggal wajib diisi',
      });
    }

    const result = await pool.query(
      `INSERT INTO pkl_lokasi
        (nama_siswa, siswa_id, nama_perusahaan, alamat_singkat, tanggal,
         judul_penempatan, deskripsi_pekerjaan, pembimbing_industri,
         kontak_pembimbing, foto_lokasi, guru_id, guru_nama)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        nama_siswa, siswa_id || null, nama_perusahaan, alamat_singkat,
        tanggal, judul_penempatan, deskripsi_pekerjaan,
        pembimbing_industri, kontak_pembimbing, fotoLokasi, guruId, guruNama,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT update lokasi
const updateLokasi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nama_siswa, siswa_id, nama_perusahaan, alamat_singkat,
      tanggal, judul_penempatan, deskripsi_pekerjaan,
      pembimbing_industri, kontak_pembimbing,
    } = req.body;

    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';

    // Cek kepemilikan
    const existing = await pool.query(
      'SELECT * FROM pkl_lokasi WHERE id = $1 AND guru_id = $2',
      [id, guruId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    const fotoLokasi = req.file
      ? `/api/vokasi/uploads/${req.file.filename}`
      : existing.rows[0].foto_lokasi;

    const result = await pool.query(
      `UPDATE pkl_lokasi SET
        nama_siswa=$1, siswa_id=$2, nama_perusahaan=$3, alamat_singkat=$4,
        tanggal=$5, judul_penempatan=$6, deskripsi_pekerjaan=$7,
        pembimbing_industri=$8, kontak_pembimbing=$9, foto_lokasi=$10,
        updated_at=NOW()
       WHERE id=$11 AND guru_id=$12 RETURNING *`,
      [
        nama_siswa, siswa_id || null, nama_perusahaan, alamat_singkat,
        tanggal, judul_penempatan, deskripsi_pekerjaan,
        pembimbing_industri, kontak_pembimbing, fotoLokasi, id, guruId,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE lokasi
const deleteLokasi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';

    const result = await pool.query(
      'DELETE FROM pkl_lokasi WHERE id = $1 AND guru_id = $2 RETURNING id',
      [id, guruId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllLokasi, createLokasi, updateLokasi, deleteLokasi };
