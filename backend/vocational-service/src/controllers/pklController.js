const pool = require("../config/db");

/**
 * GET /api/pkl/submissions
 * Ambil semua pengajuan PKL, opsional filter nama siswa.
 * Query param: ?nama=<string>
 */
const getAllPKL = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pkl_submissions ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/pkl/submissions
 * Buat pengajuan PKL baru.
 * Body: { siswa_id, nama_perusahaan, alamat }
 */
const createSubmission = async (req, res, next) => {
  const { siswa_id, nama_perusahaan, alamat } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pkl_submissions (siswa_id, nama_perusahaan, alamat)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [siswa_id, nama_perusahaan, alamat]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/pkl/submissions/:id/validate
 * Validasi pengajuan PKL.
 * Body: { status_validasi, keterangan_layak }
 */
const validateAndApprovePKL = async (req, res, next) => {
  const { id } = req.params;
  const { status_validasi, keterangan_layak } = req.body;
  try {
    const statusPersetujuan = status_validasi === "validated" ? "approved" : "pending";
    const result = await pool.query(
      `UPDATE pkl_submissions
       SET status_validasi = $1, keterangan_layak = $2, status_persetujuan = $3
       WHERE id = $4
       RETURNING *`,
      [status_validasi, keterangan_layak, statusPersetujuan, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Data PKL tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPKL, createSubmission, validateAndApprovePKL };
