const pool = require('../config/db');

// GET semua progres PKL (milik guru yang login)
const getAllProgres = async (req, res, next) => {
  try {
    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const siswaId = req.query.siswa_id || null;

    let whereClause = 'WHERE guru_id = $1';
    const params = [guruId];

    if (siswaId) {
      whereClause += ' AND siswa_id = $2';
      params.push(siswaId);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM pkl_progres ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM pkl_progres ${whereClause}
       ORDER BY tanggal DESC, created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
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

// GET daftar siswa yang pernah dilaporkan (untuk dropdown)
const getSiswaList = async (req, res, next) => {
  try {
    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';

    // Gabung dari pkl_lokasi dan pkl_progres
    const result = await pool.query(
      `SELECT DISTINCT siswa_id, nama_siswa FROM (
         SELECT siswa_id, nama_siswa FROM pkl_lokasi WHERE guru_id = $1 AND siswa_id IS NOT NULL
         UNION
         SELECT siswa_id, nama_siswa FROM pkl_progres WHERE guru_id = $1
       ) AS combined
       ORDER BY nama_siswa`,
      [guruId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST buat laporan progres baru
const createProgres = async (req, res, next) => {
  try {
    const { siswa_id, nama_siswa, tanggal, nilai_progres, judul_pekerjaan, deskripsi_pekerjaan } = req.body;

    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';
    const guruNama = req.user?.name || req.user?.preferred_username || 'Unknown';
    const fotoBukti = req.file ? `/api/vokasi/uploads/${req.file.filename}` : null;

    if (!siswa_id || !nama_siswa || !tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Siswa, dan tanggal wajib diisi',
      });
    }

    const nilaiNum = nilai_progres !== undefined ? parseInt(nilai_progres) : null;
    if (nilaiNum !== null && (nilaiNum < 0 || nilaiNum > 100)) {
      return res.status(400).json({ success: false, message: 'Nilai progres harus antara 0-100' });
    }

    const result = await pool.query(
      `INSERT INTO pkl_progres
        (siswa_id, nama_siswa, tanggal, nilai_progres, judul_pekerjaan,
         deskripsi_pekerjaan, foto_bukti, guru_id, guru_nama)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        siswa_id, nama_siswa, tanggal, nilaiNum,
        judul_pekerjaan, deskripsi_pekerjaan, fotoBukti, guruId, guruNama,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT update progres
const updateProgres = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { siswa_id, nama_siswa, tanggal, nilai_progres, judul_pekerjaan, deskripsi_pekerjaan } = req.body;

    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';

    const existing = await pool.query(
      'SELECT * FROM pkl_progres WHERE id = $1 AND guru_id = $2',
      [id, guruId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    const fotoBukti = req.file
      ? `/api/vokasi/uploads/${req.file.filename}`
      : existing.rows[0].foto_bukti;

    const nilaiNum = nilai_progres !== undefined ? parseInt(nilai_progres) : existing.rows[0].nilai_progres;

    const result = await pool.query(
      `UPDATE pkl_progres SET
        siswa_id=$1, nama_siswa=$2, tanggal=$3, nilai_progres=$4,
        judul_pekerjaan=$5, deskripsi_pekerjaan=$6, foto_bukti=$7, updated_at=NOW()
       WHERE id=$8 AND guru_id=$9 RETURNING *`,
      [siswa_id, nama_siswa, tanggal, nilaiNum, judul_pekerjaan, deskripsi_pekerjaan, fotoBukti, id, guruId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE progres
const deleteProgres = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guruId = req.user?.sub || req.user?.preferred_username || 'unknown';

    const result = await pool.query(
      'DELETE FROM pkl_progres WHERE id = $1 AND guru_id = $2 RETURNING id',
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

module.exports = { getAllProgres, getSiswaList, createProgres, updateProgres, deleteProgres };
