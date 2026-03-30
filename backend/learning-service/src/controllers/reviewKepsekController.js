// Fitur 5.5 — Review Perangkat oleh Kepala Sekolah
// Tabel: t_review_perangkat_kepsek
// Fields: id_reviewPerangkatPembelajaranKepsek (UUID), id_perangkatPembelajaran,
//         user_id (kepsek), komentarSilabus, komentarRPP, komentarModulAjar

const pool = require("../config/db");

// GET /review-kepsek
exports.getAllReviewKepsek = async (req, res) => {
  try {
    const { id_perangkatPembelajaran } = req.query;
    let query = `
      SELECT rk.*, p."namaMapel", p.kelas, p.user_id AS guru_id
      FROM t_review_perangkat_kepsek rk
      LEFT JOIN t_perangkat_pembelajaran p
        ON rk."id_perangkatPembelajaran" = p."id_perangkatPembelajaran"
    `;
    const params = [];
    if (id_perangkatPembelajaran) {
      params.push(id_perangkatPembelajaran);
      query += ` WHERE rk."id_perangkatPembelajaran" = $1`;
    }
    query += " ORDER BY rk.created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /review-kepsek/:id
exports.getReviewKepsekById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rk.*, p."namaMapel", p.kelas, p.user_id AS guru_id
       FROM t_review_perangkat_kepsek rk
       LEFT JOIN t_perangkat_pembelajaran p
         ON rk."id_perangkatPembelajaran" = p."id_perangkatPembelajaran"
       WHERE rk."id_reviewPerangkatPembelajaranKepsek" = $1`,
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

// POST /review-kepsek — kepsek buat review
exports.createReviewKepsek = async (req, res) => {
  try {
    const userId = req.user.sub; // ID kepsek dari token
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
      `INSERT INTO t_review_perangkat_kepsek
        ("id_perangkatPembelajaran", user_id, "komentarSilabus", "komentarRPP", "komentarModulAjar")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        id_perangkatPembelajaran, userId,
        komentarSilabus || null, komentarRPP || null, komentarModulAjar || null
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /review-kepsek/:id
exports.updateReviewKepsek = async (req, res) => {
  try {
    const { id } = req.params;
    const { komentarSilabus, komentarRPP, komentarModulAjar } = req.body;

    const result = await pool.query(
      `UPDATE t_review_perangkat_kepsek
       SET "komentarSilabus"   = COALESCE($1, "komentarSilabus"),
           "komentarRPP"       = COALESCE($2, "komentarRPP"),
           "komentarModulAjar" = COALESCE($3, "komentarModulAjar"),
           updated_at          = NOW()
       WHERE "id_reviewPerangkatPembelajaranKepsek" = $4
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

// DELETE /review-kepsek/:id
exports.deleteReviewKepsek = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM t_review_perangkat_kepsek WHERE "id_reviewPerangkatPembelajaranKepsek" = $1 RETURNING *`,
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