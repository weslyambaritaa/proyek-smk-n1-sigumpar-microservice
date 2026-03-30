const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

exports.getAllMapel = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT m.*, k.nama_kelas
      FROM mata_pelajaran m
      LEFT JOIN kelas k ON m.kelas_id = k.id
      ORDER BY m.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.createMapel = async (req, res, next) => {
  const { nama_mapel, kelas_id, guru_mapel_id } = req.body;
  if (!nama_mapel || !kelas_id) {
    return next(createError(400, "Field nama_mapel dan kelas_id wajib diisi"));
  }
  try {
    // Konversi kelas_id ke integer (jika dari frontend berupa string)
    const kelasIdInt = parseInt(kelas_id, 10);
    if (isNaN(kelasIdInt)) {
      return next(createError(400, "kelas_id harus berupa angka"));
    }
    // Opsional: cek apakah kelas dengan id tersebut ada
    const kelasCheck = await pool.query("SELECT id FROM kelas WHERE id = $1", [
      kelasIdInt,
    ]);
    if (kelasCheck.rows.length === 0) {
      return next(createError(404, "Kelas tidak ditemukan"));
    }

    const result = await pool.query(
      `INSERT INTO mata_pelajaran (nama_mapel, kelas_id, guru_mapel_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nama_mapel, kelasIdInt, guru_mapel_id || null],
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      next(createError(409, "Nama mata pelajaran sudah ada"));
    } else {
      next(err);
    }
  }
};

exports.updateMapel = async (req, res, next) => {
  const { id } = req.params;
  const { nama_mapel, kelas_id, guru_mapel_id } = req.body;
  try {
    // Jika kelas_id diberikan, konversi ke integer
    let kelasIdInt = null;
    if (kelas_id !== undefined && kelas_id !== null && kelas_id !== "") {
      kelasIdInt = parseInt(kelas_id, 10);
      if (isNaN(kelasIdInt)) {
        return next(createError(400, "kelas_id harus berupa angka"));
      }
      // Cek apakah kelas ada
      const kelasCheck = await pool.query(
        "SELECT id FROM kelas WHERE id = $1",
        [kelasIdInt],
      );
      if (kelasCheck.rows.length === 0) {
        return next(createError(404, "Kelas tidak ditemukan"));
      }
    }

    const query = `
      UPDATE mata_pelajaran
      SET nama_mapel = COALESCE($1, nama_mapel),
          kelas_id = COALESCE($2, kelas_id),
          guru_mapel_id = COALESCE($3, guru_mapel_id)
      WHERE id = $4
      RETURNING *
    `;
    const values = [
      nama_mapel || null,
      kelasIdInt,
      guru_mapel_id !== undefined ? guru_mapel_id : null,
      id,
    ];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return next(createError(404, "Mata pelajaran tidak ditemukan"));
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      next(createError(409, "Nama mata pelajaran sudah ada"));
    } else {
      next(err);
    }
  }
};

exports.deleteMapel = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM mata_pelajaran WHERE id = $1",
      [id],
    );
    if (result.rowCount === 0) {
      return next(createError(404, "Mata pelajaran tidak ditemukan"));
    }
    res.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};
