const pool = require("../config/db");

const getAllReviewWakasek = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM review_wakasek ORDER BY id DESC`);
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getReviewWakasekById = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM review_wakasek WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: "Tidak ditemukan" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createReviewWakasek = async (req, res) => {
  try {
    const { perangkat_id, komentar } = req.body;
    const result = await pool.query(
      `INSERT INTO review_wakasek (perangkat_id, komentar) VALUES ($1,$2) RETURNING *`,
      [perangkat_id, komentar]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateReviewWakasek = async (req, res) => {
  try {
    const { komentar } = req.body;
    const result = await pool.query(
      `UPDATE review_wakasek SET komentar=$1 WHERE id=$2 RETURNING *`,
      [komentar, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteReviewWakasek = async (req, res) => {
  try {
    await pool.query(`DELETE FROM review_wakasek WHERE id = $1`, [req.params.id]);
    res.json({ success: true, message: "Review berhasil dihapus" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAllReviewWakasek, getReviewWakasekById, createReviewWakasek, updateReviewWakasek, deleteReviewWakasek };