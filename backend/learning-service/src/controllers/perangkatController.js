const pool = require("../config/db");
const path = require("path");

// Helper alias kolom agar nama field cocok dengan frontend (camelCase)
const SELECT_COLS = `
  id, user_id,
  nama_mapel     AS "namaMapel",
  kelas,
  upload_silabus AS "uploadSilabus",
  upload_rpp     AS "uploadRPP",
  modul_ajar     AS "modulAjar",
  created_at
`;

const getDashboardWakasek = async (req, res) => {
  try {
    const total = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS total FROM perangkat_pembelajaran`
    );
    const lengkap = await pool.query(`
      SELECT COUNT(DISTINCT user_id) AS lengkap FROM perangkat_pembelajaran
      WHERE upload_silabus IS NOT NULL
        AND upload_rpp IS NOT NULL
        AND modul_ajar IS NOT NULL
    `);
    const terbaru = await pool.query(
      `SELECT ${SELECT_COLS} FROM perangkat_pembelajaran ORDER BY created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        total_guru: parseInt(total.rows[0].total),
        unggahan_lengkap: parseInt(lengkap.rows[0].lengkap),
        unggahan_belum_lengkap:
          parseInt(total.rows[0].total) - parseInt(lengkap.rows[0].lengkap),
        unggahan_terbaru: terbaru.rows, // key cocok dengan frontend
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDaftarGuruStatus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        user_id,
        COUNT(*) AS total_perangkat,
        COUNT(
          CASE WHEN upload_silabus IS NOT NULL
                AND upload_rpp IS NOT NULL
                AND modul_ajar IS NOT NULL
          THEN 1 END
        ) AS lengkap,
        CASE
          WHEN COUNT(
            CASE WHEN upload_silabus IS NOT NULL
                  AND upload_rpp IS NOT NULL
                  AND modul_ajar IS NOT NULL
            THEN 1 END
          ) > 0
          THEN 'Lengkap'
          ELSE 'Belum Lengkap'
        END AS status_unggahan
      FROM perangkat_pembelajaran
      GROUP BY user_id
    `);
    // sekarang tiap row punya field status_unggahan yang dibaca frontend
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDetailGuruById = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT ${SELECT_COLS} FROM perangkat_pembelajaran WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    const data = result.rows;
    // pakai camelCase field hasil alias
    const semua_lengkap =
      data.length > 0 &&
      data.every((d) => d.uploadSilabus && d.uploadRPP && d.modulAjar);

    res.json({
      success: true,
      data: {
        user_id: userId,
        status_kelengkapan: semua_lengkap ? "Lengkap" : "Belum Lengkap",
        data,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPerangkatSaya = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const result = await pool.query(
      `SELECT ${SELECT_COLS} FROM perangkat_pembelajaran WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllPerangkat = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLS} FROM perangkat_pembelajaran ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPerangkatById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLS} FROM perangkat_pembelajaran WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Tidak ditemukan" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createPerangkat = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { nama_mapel, kelas } = req.body;
    const silabus = req.files?.uploadSilabus?.[0]?.path || null;
    const rpp     = req.files?.uploadRPP?.[0]?.path || null;
    const modul   = req.files?.modulAjar?.[0]?.path || null;

    const result = await pool.query(
      `INSERT INTO perangkat_pembelajaran
         (user_id, nama_mapel, kelas, upload_silabus, upload_rpp, modul_ajar, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING ${SELECT_COLS}`,
      [userId, nama_mapel, kelas, silabus, rpp, modul]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePerangkat = async (req, res) => {
  try {
    const { nama_mapel, kelas } = req.body;
    const silabus = req.files?.uploadSilabus?.[0]?.path || null;
    const rpp     = req.files?.uploadRPP?.[0]?.path || null;
    const modul   = req.files?.modulAjar?.[0]?.path || null;

    const result = await pool.query(
      `UPDATE perangkat_pembelajaran
       SET nama_mapel     = $1,
           kelas          = $2,
           upload_silabus = COALESCE($3, upload_silabus),
           upload_rpp     = COALESCE($4, upload_rpp),
           modul_ajar     = COALESCE($5, modul_ajar)
       WHERE id = $6
       RETURNING ${SELECT_COLS}`,
      [nama_mapel, kelas, silabus, rpp, modul, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePerangkat = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM perangkat_pembelajaran WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan" });

    res.json({ success: true, message: "Perangkat berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardWakasek,
  getDaftarGuruStatus,
  getDetailGuruById,
  getPerangkatSaya,
  getAllPerangkat,
  getPerangkatById,
  createPerangkat,
  updatePerangkat,
  deletePerangkat,
};