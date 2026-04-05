const pool = require("../config/db");
const { callAcademicService } = require("../utils/academicClient");

// Helper: ambil daftar guru dari academic service
async function getGuruListFromAcademic(token) {
  const response = await callAcademicService("/api/academic/guru", token);
  return response.data || [];
}

// GET /api/learning/evaluasi/guru?periode=...
exports.getDaftarGuruEvaluasi = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // ambil token tanpa 'Bearer'
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Token tidak ditemukan" });

  const periode =
    req.query.periode ||
    new Date().getFullYear() + "/" + (new Date().getFullYear() + 1) + " Ganjil";

  try {
    // 1. Ambil data guru dari academic service
    const guruList = await getGuruListFromAcademic(token);

    // 2. Ambil data evaluasi yang sudah ada di learning-service
    const evalResult = await pool.query(
      `SELECT guru_id, nilai_numerik, nilai_huruf, komentar, dinilai_pada
       FROM evaluasi_guru WHERE periode_penilaian = $1`,
      [periode],
    );
    const evaluasiMap = new Map();
    evalResult.rows.forEach((ev) => evaluasiMap.set(ev.guru_id, ev));

    // 3. Gabungkan
    const result = guruList.map((guru) => ({
      id_guru: guru.id_guru,
      nama: guru.nama,
      nip: guru.nip,
      mapel_diampu: guru.mapel_diampu || "-",
      evaluasi: evaluasiMap.get(guru.id_guru) || null,
    }));

    res.json({ success: true, data: result, periode });
  } catch (err) {
    console.error("[getDaftarGuruEvaluasi]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/learning/evaluasi/guru/:guruId
exports.simpanEvaluasi = async (req, res) => {
  const { guruId } = req.params;
  const { nilai_numerik, komentar, periode_penilaian } = req.body;
  const kepalaSekolahId = req.user.sub; // dari extractIdentity

  if (!nilai_numerik || !periode_penilaian) {
    return res
      .status(400)
      .json({ success: false, message: "Nilai dan periode wajib diisi" });
  }

  // Konversi ke huruf
  let nilai_huruf = "E";
  if (nilai_numerik >= 90) nilai_huruf = "A";
  else if (nilai_numerik >= 80) nilai_huruf = "B";
  else if (nilai_numerik >= 70) nilai_huruf = "C";
  else if (nilai_numerik >= 60) nilai_huruf = "D";

  try {
    const result = await pool.query(
      `INSERT INTO evaluasi_guru (guru_id, periode_penilaian, nilai_numerik, nilai_huruf, komentar, dinilai_oleh, dinilai_pada)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (guru_id, periode_penilaian) DO UPDATE SET
         nilai_numerik = EXCLUDED.nilai_numerik,
         nilai_huruf = EXCLUDED.nilai_huruf,
         komentar = EXCLUDED.komentar,
         dinilai_oleh = EXCLUDED.dinilai_oleh,
         dinilai_pada = NOW()
       RETURNING *`,
      [
        guruId,
        periode_penilaian,
        nilai_numerik,
        nilai_huruf,
        komentar || "",
        kepalaSekolahId,
      ],
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[simpanEvaluasi]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
