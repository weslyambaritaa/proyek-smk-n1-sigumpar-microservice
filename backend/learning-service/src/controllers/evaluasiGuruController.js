const pool = require("../config/db");
const { getAllGuru } = require("../utils/keycloakAdmin");

// GET /api/learning/evaluasi/guru?periode=...
exports.getDaftarGuruEvaluasi = async (req, res) => {
  const periode =
    req.query.periode ||
    new Date().getFullYear() + "/" + (new Date().getFullYear() + 1) + " Ganjil";

  try {
    // Ambil daftar guru dari Keycloak
    const guruList = await getAllGuru();

    // Ambil data evaluasi yang sudah ada dari tabel learning-service
    const evalResult = await pool.query(
      `SELECT guru_id, nilai_numerik, nilai_huruf, komentar, dinilai_pada
       FROM evaluasi_guru WHERE periode_penilaian = $1`,
      [periode],
    );
    const evaluasiMap = new Map();
    evalResult.rows.forEach((ev) => evaluasiMap.set(ev.guru_id, ev));

    // Gabungkan
    const result = guruList.map((guru) => ({
      ...guru,
      evaluasi: evaluasiMap.get(guru.id_guru) || null,
    }));

    res.json({ success: true, data: result, periode });
  } catch (err) {
    console.error("[getDaftarGuruEvaluasi]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/learning/evaluasi/guru/:guruId (tidak berubah)
exports.simpanEvaluasi = async (req, res) => {
  // ... kode tetap sama seperti sebelumnya
};
