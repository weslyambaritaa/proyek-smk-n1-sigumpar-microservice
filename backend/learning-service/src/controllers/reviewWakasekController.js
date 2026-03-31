const pool = require("../config/db");

// 🪄 Fungsi untuk memastikan tabel ada
const ensureReviewTableExists = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_wakasek (
        id SERIAL PRIMARY KEY, 
        perangkat_id INTEGER, 
        komentar TEXT
      );
    `);
  } catch (err) {
    console.error("Gagal sinkronisasi tabel review:", err.message);
  }
};

const createReviewWakasek = async (req, res) => {
  await ensureReviewTableExists();
  try {
    const { id_perangkatPembelajaran, komentarSilabus, komentarRPP, komentarModulAjar } = req.body;

    // 🛡️ VALIDASI: Cek apakah ID adalah angka
    const perangkatId = parseInt(id_perangkatPembelajaran);
    if (isNaN(perangkatId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Gagal: ID Perangkat harus berupa ANGKA (Contoh: 1). Jangan masukkan huruf!" 
      });
    }

    // Membungkus 3 input ke dalam 1 kolom text JSON (Sesuai skema lama)
    const komentarJSON = JSON.stringify({
      komentarSilabus: komentarSilabus || "",
      komentarRPP: komentarRPP || "",
      komentarModulAjar: komentarModulAjar || ""
    });

    const result = await pool.query(
      `INSERT INTO review_wakasek (perangkat_id, komentar) VALUES ($1, $2) RETURNING *`,
      [perangkatId, komentarJSON]
    );

    res.status(201).json({ 
      success: true, 
      message: "Berhasil mengirim review/instruksi!",
      data: result.rows[0] 
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Kesalahan Database: " + err.message });
  }
};

const getAllReviewWakasek = async (req, res) => {
  await ensureReviewTableExists();
  try {
    const result = await pool.query(`SELECT * FROM review_wakasek ORDER BY id DESC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createReviewWakasek, getAllReviewWakasek };