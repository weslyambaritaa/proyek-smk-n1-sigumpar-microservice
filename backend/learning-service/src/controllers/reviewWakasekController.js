// Fitur 5.6 — Review / Notifikasi / Instruksi oleh Waka Sekolah
// Tabel: t_review_perangkat_wakasek
// Fields: id_reviewPerangkatPembelajaranWakasek (UUID), id_perangkatPembelajaran,
//         user_id (wakasek), komentarSilabus, komentarRPP, komentarModulAjar

const pool = require("../config/db");

// GET /review-wakasek
exports.getAllReviewWakasek = async (req, res) => {
  try {
    const { id_perangkatPembelajaran } = req.query;
    let query = `
      SELECT rw.*, p."namaMapel", p.kelas, p.user_id AS guru_id
      FROM t_review_perangkat_wakasek rw
      LEFT JOIN t_perangkat_pembelajaran p
        ON rw."id_perangkatPembelajaran" = p."id_perangkatPembelajaran"
    `;
    const params = [];
    if (id_perangkatPembelajaran) {
      params.push(id_perangkatPembelajaran);
      query += ` WHERE rw."id_perangkatPembelajaran" = $1`;
    }
    query += " ORDER BY rw.created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /review-wakasek/:id
exports.getReviewWakasekById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rw.*, p."namaMapel", p.kelas, p.user_id AS guru_id
       FROM t_review_perangkat_wakasek rw
       LEFT JOIN t_perangkat_pembelajaran p
         ON rw."id_perangkatPembelajaran" = p."id_perangkatPembelajaran"
       WHERE rw."id_reviewPerangkatPembelajaranWakasek" = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Review tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /review-wakasek — wakasek kirim review/komentar/instruksi
// Body: { id_perangkatPembelajaran, komentarSilabus?, komentarRPP?, komentarModulAjar? }
exports.createReviewWakasek = async (req, res) => {
  try {
    const userId = req.user.sub; // ID wakasek dari token
    const { id_perangkatPembelajaran, komentarSilabus, komentarRPP, komentarModulAjar } = req.body;

    if (!id_perangkatPembelajaran) {
      return res.status(400).json({ success: false, message: "id_perangkatPembelajaran wajib diisi" });
    }

    // Cek perangkat ada
    const cek = await pool.query(
      `SELECT "id_perangkatPembelajaran" FROM t_perangkat_pembelajaran WHERE "id_perangkatPembelajaran" = $1`,
      [id_perangkatPembelajaran]
    );
    if (cek.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan" });
    }

    const result = await pool.query(
      `INSERT INTO t_review_perangkat_wakasek
        ("id_perangkatPembelajaran", user_id, "komentarSilabus", "komentarRPP", "komentarModulAjar")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        id_perangkatPembelajaran, userId,
        komentarSilabus || null, komentarRPP || null, komentarModulAjar || null
      ]
    );
    res.status(201).json({
      success: true,
      message: "Review/instruksi berhasil dikirim",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /review-wakasek/:id
exports.updateReviewWakasek = async (req, res) => {
  try {
    const { id } = req.params;
    const { komentarSilabus, komentarRPP, komentarModulAjar } = req.body;

    const result = await pool.query(
      `UPDATE t_review_perangkat_wakasek
       SET "komentarSilabus"   = COALESCE($1, "komentarSilabus"),
           "komentarRPP"       = COALESCE($2, "komentarRPP"),
           "komentarModulAjar" = COALESCE($3, "komentarModulAjar"),
           updated_at          = NOW()
       WHERE "id_reviewPerangkatPembelajaranWakasek" = $4
       RETURNING *`,
      [komentarSilabus || null, komentarRPP || null, komentarModulAjar || null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Review tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /review-wakasek/:id
exports.deleteReviewWakasek = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM t_review_perangkat_wakasek WHERE "id_reviewPerangkatPembelajaranWakasek" = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Review tidak ditemukan" });
    }
    res.json({ success: true, message: "Review berhasil dihapus", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};