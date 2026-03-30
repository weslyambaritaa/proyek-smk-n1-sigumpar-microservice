const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

// 🔢 HITUNG NILAI AKHIR
const calculateFinalScore = ({
  tugas = 0,
  kuis = 0,
  uts = 0,
  uas = 0,
  praktik = 0,
}) => {
  const total =
    Number(tugas) * 0.2 +
    Number(kuis) * 0.15 +
    Number(uts) * 0.2 +
    Number(uas) * 0.25 +
    Number(praktik) * 0.2;

  return Number(total.toFixed(2));
};

// 🛡️ VALIDASI NILAI
const validateScore = (value, name) => {
  if (value < 0 || value > 100) {
    throw createError(400, `${name} harus antara 0 - 100`);
  }
};

// 📥 GET ALL (FILTER + SEARCH)
const getGrades = async (req, res, next) => {
  try {
    const { mapel, kelas, tahunAjar, search } = req.query;

    let query = `SELECT * FROM student_grades WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (mapel) {
      query += ` AND mapel = $${idx++}`;
      values.push(mapel);
    }

    if (kelas) {
      query += ` AND kelas = $${idx++}`;
      values.push(kelas);
    }

    if (tahunAjar) {
      query += ` AND tahun_ajar = $${idx++}`;
      values.push(tahunAjar);
    }

    if (search) {
      query += ` AND (
        LOWER(student_name) LIKE LOWER($${idx})
        OR LOWER(COALESCE(nis, '')) LIKE LOWER($${idx})
      )`;
      values.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY student_name ASC`;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

// 📥 GET BY ID
const getGradeById = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM student_grades WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "Data tidak ditemukan");
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// 💾 CREATE + UPDATE (ON CONFLICT)
const saveGrades = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { mapel, kelas, tahunAjar, grades } = req.body;

    if (!mapel || !kelas || !tahunAjar || !Array.isArray(grades)) {
      throw createError(400, "mapel, kelas, tahunAjar, dan grades wajib diisi");
    }

    await client.query("BEGIN");

    for (const item of grades) {
      const {
        student_id,
        student_name,
        nis,
        tugas = 0,
        kuis = 0,
        uts = 0,
        uas = 0,
        praktik = 0,
      } = item;

      if (!student_id || !student_name) {
        throw createError(400, "student_id dan student_name wajib diisi");
      }

      // 🔒 VALIDASI NILAI
      validateScore(tugas, "tugas");
      validateScore(kuis, "kuis");
      validateScore(uts, "uts");
      validateScore(uas, "uas");
      validateScore(praktik, "praktik");

      const nilai_akhir = calculateFinalScore({
        tugas,
        kuis,
        uts,
        uas,
        praktik,
      });

      await client.query(
        `
        INSERT INTO student_grades (
          student_id, student_name, nis,
          mapel, kelas, tahun_ajar,
          tugas, kuis, uts, uas, praktik,
          nilai_akhir, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, mapel, kelas, tahun_ajar)
        DO UPDATE SET
          student_name = EXCLUDED.student_name,
          nis = EXCLUDED.nis,
          tugas = EXCLUDED.tugas,
          kuis = EXCLUDED.kuis,
          uts = EXCLUDED.uts,
          uas = EXCLUDED.uas,
          praktik = EXCLUDED.praktik,
          nilai_akhir = EXCLUDED.nilai_akhir,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          student_id,
          student_name,
          nis || null,
          mapel,
          kelas,
          tahunAjar,
          tugas,
          kuis,
          uts,
          uas,
          praktik,
          nilai_akhir,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Semua nilai berhasil disimpan",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

// ✏️ UPDATE MANUAL
const updateGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tugas, kuis, uts, uas, praktik } = req.body;

    validateScore(tugas, "tugas");
    validateScore(kuis, "kuis");
    validateScore(uts, "uts");
    validateScore(uas, "uas");
    validateScore(praktik, "praktik");

    const nilai_akhir = calculateFinalScore({
      tugas,
      kuis,
      uts,
      uas,
      praktik,
    });

    const result = await pool.query(
      `
      UPDATE student_grades
      SET tugas=$1, kuis=$2, uts=$3, uas=$4, praktik=$5,
          nilai_akhir=$6, updated_at=CURRENT_TIMESTAMP
      WHERE id=$7
      RETURNING *
      `,
      [tugas, kuis, uts, uas, praktik, nilai_akhir, id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "Data tidak ditemukan");
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ❌ DELETE
const deleteGrade = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM student_grades WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "Data tidak ditemukan");
    }

    res.json({
      success: true,
      message: "Data berhasil dihapus",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGrades,
  getGradeById,
  saveGrades,
  updateGrade,
  deleteGrade,
};