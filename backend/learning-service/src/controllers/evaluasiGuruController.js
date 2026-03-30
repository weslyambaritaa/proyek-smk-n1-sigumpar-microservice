// Fitur 5.3 — Evaluasi Guru
// Tabel: t_evaluasi_guru
// Fields: id_evaluasiGuru (UUID), user_id (target guru), user_id_penilai (kepsek/wakasek),
//         statusEvaluasi, catatanEvaluasi

const pool = require("../config/db");

// GET /evaluasi — semua evaluasi
exports.getAllEvaluasi = async (req, res) => {
  try {
    const { user_id, user_id_penilai } = req.query;
    const params = [];
    const conditions = [];
    let query = `SELECT * FROM t_evaluasi_guru`;

    if (user_id)         { params.push(user_id);         conditions.push(`user_id = $${params.length}`); }
    if (user_id_penilai) { params.push(user_id_penilai); conditions.push(`user_id_penilai = $${params.length}`); }
    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /evaluasi/:id
exports.getEvaluasiById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM t_evaluasi_guru WHERE "id_evaluasiGuru" = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Evaluasi tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /evaluasi — kepsek/wakasek buat evaluasi untuk guru
exports.createEvaluasi = async (req, res) => {
  try {
    const userIdPenilai = req.user.sub; // ID kepsek/wakasek dari token
    const { user_id, statusEvaluasi, catatanEvaluasi } = req.body;

    if (!user_id || !statusEvaluasi) {
      return res.status(400).json({
        success: false,
        message: "Field user_id (guru) dan statusEvaluasi wajib diisi",
      });
    }

    const allowedStatus = ["baik", "cukup", "kurang", "perlu_pembinaan"];
    if (!allowedStatus.includes(statusEvaluasi)) {
      return res.status(400).json({
        success: false,
        message: `statusEvaluasi harus salah satu dari: ${allowedStatus.join(", ")}`,
      });
    }

    const result = await pool.query(
      `INSERT INTO t_evaluasi_guru
        (user_id, user_id_penilai, "statusEvaluasi", "catatanEvaluasi")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, userIdPenilai, statusEvaluasi, catatanEvaluasi || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /evaluasi/:id
exports.updateEvaluasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusEvaluasi, catatanEvaluasi } = req.body;

    const allowedStatus = ["baik", "cukup", "kurang", "perlu_pembinaan"];
    if (statusEvaluasi && !allowedStatus.includes(statusEvaluasi)) {
      return res.status(400).json({
        success: false,
        message: `statusEvaluasi harus salah satu dari: ${allowedStatus.join(", ")}`,
      });
    }

    const result = await pool.query(
      `UPDATE t_evaluasi_guru
       SET "statusEvaluasi"  = COALESCE($1, "statusEvaluasi"),
           "catatanEvaluasi" = COALESCE($2, "catatanEvaluasi"),
           updated_at        = NOW()
       WHERE "id_evaluasiGuru" = $3
       RETURNING *`,
      [statusEvaluasi || null, catatanEvaluasi || null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Evaluasi tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /evaluasi/:id — hanya kepsek
exports.deleteEvaluasi = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM t_evaluasi_guru WHERE "id_evaluasiGuru" = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Evaluasi tidak ditemukan" });
    }
    res.json({ success: true, message: "Evaluasi berhasil dihapus", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};