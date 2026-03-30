const pool = require("../config/db");

// Helper alias kolom agar nama field cocok dengan frontend (camelCase)
const SELECT_COLS = `
  id,
  perangkat_id,
  komentar_silabus    AS "komentarSilabus",
  komentar_rpp        AS "komentarRPP",
  komentar_modul_ajar AS "komentarModulAjar",
  created_at
`;

const getAllReviewWakasek = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLS} FROM review_wakasek ORDER BY id DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getReviewWakasekById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLS} FROM review_wakasek WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows[0])
      return res.status(404).json({ success: false, message: "Tidak ditemukan" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createReviewWakasek = async (req, res) => {
  try {
    // terima field yang dikirim dari frontend
    const {
      id_perangkatPembelajaran,
      komentarSilabus,
      komentarRPP,
      komentarModulAjar,
    } = req.body;

    if (!id_perangkatPembelajaran) {
      return res.status(400).json({
        success: false,
        message: "id_perangkatPembelajaran wajib diisi",
      });
    }

    const adaKomentar = komentarSilabus || komentarRPP || komentarModulAjar;
    if (!adaKomentar) {
      return res.status(400).json({
        success: false,
        message: "Isi minimal satu komentar (Silabus, RPP, atau Modul Ajar)",
      });
    }

    const result = await pool.query(
      `INSERT INTO review_wakasek
         (perangkat_id, komentar_silabus, komentar_rpp, komentar_modul_ajar, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING ${SELECT_COLS}`,
      [
        id_perangkatPembelajaran,
        komentarSilabus || null,
        komentarRPP || null,
        komentarModulAjar || null,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateReviewWakasek = async (req, res) => {
  try {
    const { komentarSilabus, komentarRPP, komentarModulAjar } = req.body;

    const result = await pool.query(
      `UPDATE review_wakasek
       SET komentar_silabus    = COALESCE($1, komentar_silabus),
           komentar_rpp        = COALESCE($2, komentar_rpp),
           komentar_modul_ajar = COALESCE($3, komentar_modul_ajar)
       WHERE id = $4
       RETURNING ${SELECT_COLS}`,
      [
        komentarSilabus || null,
        komentarRPP || null,
        komentarModulAjar || null,
        req.params.id,
      ]
    );

    if (!result.rows[0])
      return res.status(404).json({ success: false, message: "Review tidak ditemukan" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteReviewWakasek = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM review_wakasek WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!result.rows[0])
      return res.status(404).json({ success: false, message: "Review tidak ditemukan" });

    res.json({ success: true, message: "Review berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllReviewWakasek,
  getReviewWakasekById,
  createReviewWakasek,
  updateReviewWakasek,
  deleteReviewWakasek,
};