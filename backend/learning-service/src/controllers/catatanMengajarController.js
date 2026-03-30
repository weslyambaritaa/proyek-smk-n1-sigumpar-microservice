// Fitur 5.2 — Catatan Mengajar
// Tabel: t_catatan_mengajar
// Fields: id_catatanMengajar (UUID), user_id, tanggal, kelas, mataPelajaran, materiDisampaikan, catatan

const pool = require("../config/db");

// GET /catatan-mengajar — semua catatan (wakasek & kepsek)
exports.getAllCatatan = async (req, res) => {
  try {
    const { user_id, kelas, tanggal } = req.query;
    const params = [];
    const conditions = [];
    let query = `SELECT * FROM t_catatan_mengajar`;

    if (user_id) { params.push(user_id); conditions.push(`user_id = $${params.length}`); }
    if (kelas)   { params.push(kelas);   conditions.push(`kelas = $${params.length}`); }
    if (tanggal) { params.push(tanggal); conditions.push(`tanggal = $${params.length}`); }
    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY tanggal DESC, created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /catatan-mengajar/guru-saya
exports.getCatatanSaya = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM t_catatan_mengajar WHERE user_id = $1 ORDER BY tanggal DESC`,
      [req.user.sub]
    );
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /catatan-mengajar/:id
exports.getCatatanById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM t_catatan_mengajar WHERE "id_catatanMengajar" = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Catatan tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /catatan-mengajar — guru buat catatan baru
exports.createCatatan = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { tanggal, kelas, mataPelajaran, materiDisampaikan, catatan } = req.body;

    if (!tanggal || !kelas || !mataPelajaran || !materiDisampaikan) {
      return res.status(400).json({
        success: false,
        message: "Field tanggal, kelas, mataPelajaran, dan materiDisampaikan wajib diisi",
      });
    }

    const result = await pool.query(
      `INSERT INTO t_catatan_mengajar
        (user_id, tanggal, kelas, "mataPelajaran", "materiDisampaikan", catatan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, tanggal, kelas, mataPelajaran, materiDisampaikan, catatan || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /catatan-mengajar/:id — guru update catatan milik sendiri
exports.updateCatatan = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const { tanggal, kelas, mataPelajaran, materiDisampaikan, catatan } = req.body;

    const existing = await pool.query(
      `SELECT * FROM t_catatan_mengajar WHERE "id_catatanMengajar" = $1 AND user_id = $2`,
      [id, userId]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Catatan tidak ditemukan atau bukan milik Anda" });
    }

    const result = await pool.query(
      `UPDATE t_catatan_mengajar
       SET tanggal             = COALESCE($1, tanggal),
           kelas               = COALESCE($2, kelas),
           "mataPelajaran"     = COALESCE($3, "mataPelajaran"),
           "materiDisampaikan" = COALESCE($4, "materiDisampaikan"),
           catatan             = COALESCE($5, catatan),
           updated_at          = NOW()
       WHERE "id_catatanMengajar" = $6
       RETURNING *`,
      [tanggal || null, kelas || null, mataPelajaran || null, materiDisampaikan || null, catatan || null, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /catatan-mengajar/:id — guru hapus catatan milik sendiri
exports.deleteCatatan = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM t_catatan_mengajar WHERE "id_catatanMengajar" = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.sub]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Catatan tidak ditemukan atau bukan milik Anda" });
    }
    res.json({ success: true, message: "Catatan berhasil dihapus", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};