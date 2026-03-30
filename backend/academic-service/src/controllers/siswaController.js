const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

// Get all siswa with kelas info
exports.getAllSiswa = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT s.id_siswa, s.id_kelas, s.namaSiswa AS namasiswa, s.NIS AS nis,
             s.created_at, s.updated_at, k.nama_kelas
      FROM siswa s
      LEFT JOIN kelas k ON s.id_kelas = k.id
      ORDER BY s.namaSiswa ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// Get siswa by ID
exports.getSiswaById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id_siswa, s.id_kelas, s.namaSiswa AS namasiswa, s.NIS AS nis,
              s.created_at, s.updated_at, k.nama_kelas
       FROM siswa s
       LEFT JOIN kelas k ON s.id_kelas = k.id
       WHERE s.id_siswa = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      throw createError(404, "Siswa tidak ditemukan");
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Create new siswa
exports.createSiswa = async (req, res, next) => {
  const { nis, namasiswa, id_kelas } = req.body;
  if (!nis || !namasiswa || !id_kelas) {
    throw createError(400, "Field nis, namasiswa, dan id_kelas wajib diisi");
  }
  try {
    // Check if kelas exists
    const kelasCheck = await pool.query("SELECT id FROM kelas WHERE id = $1", [
      id_kelas,
    ]);
    if (kelasCheck.rows.length === 0) {
      throw createError(404, "Kelas tidak ditemukan");
    }

    const result = await pool.query(
      `INSERT INTO siswa (id_kelas, namaSiswa, NIS)
       VALUES ($1, $2, $3)
       RETURNING id_siswa, id_kelas, namaSiswa AS namasiswa, NIS AS nis, created_at, updated_at`,
      [id_kelas, namasiswa, nis],
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      next(createError(409, "NIS sudah terdaftar"));
    } else {
      next(err);
    }
  }
};

// Update siswa
exports.updateSiswa = async (req, res, next) => {
  const { id } = req.params;
  const { nis, namasiswa, id_kelas } = req.body;

  if (!nis && !namasiswa && !id_kelas) {
    throw createError(400, "Tidak ada field yang akan diupdate");
  }

  try {
    // Check if siswa exists
    const checkSiswa = await pool.query(
      "SELECT id_siswa FROM siswa WHERE id_siswa = $1",
      [id],
    );
    if (checkSiswa.rows.length === 0) {
      throw createError(404, "Siswa tidak ditemukan");
    }

    // If kelas_id is provided, check if kelas exists
    if (id_kelas) {
      const kelasCheck = await pool.query(
        "SELECT id FROM kelas WHERE id = $1",
        [id_kelas],
      );
      if (kelasCheck.rows.length === 0) {
        throw createError(404, "Kelas tidak ditemukan");
      }
    }

    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (nis) {
      updateFields.push(`NIS = $${paramIndex++}`);
      values.push(nis);
    }
    if (namasiswa) {
      updateFields.push(`namaSiswa = $${paramIndex++}`);
      values.push(namasiswa);
    }
    if (id_kelas) {
      updateFields.push(`id_kelas = $${paramIndex++}`);
      values.push(id_kelas);
    }
    values.push(id);

    const updateQuery = `
      UPDATE siswa
      SET ${updateFields.join(", ")}, updated_at = NOW()
      WHERE id_siswa = $${paramIndex}
      RETURNING id_siswa, id_kelas, namaSiswa AS namasiswa, NIS AS nis, created_at, updated_at
    `;
    const result = await pool.query(updateQuery, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      next(createError(409, "NIS sudah digunakan oleh siswa lain"));
    } else {
      next(err);
    }
  }
};

// Delete siswa
exports.deleteSiswa = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM siswa WHERE id_siswa = $1 RETURNING id_siswa",
      [id],
    );
    if (result.rows.length === 0) {
      throw createError(404, "Siswa tidak ditemukan");
    }
    res.json({ success: true, message: "Siswa berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};
