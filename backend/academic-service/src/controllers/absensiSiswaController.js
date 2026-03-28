const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

// Helper validasi tanggal (YYYY-MM-DD)
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// --- 1. Absensi Siswa ---
const createAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id_siswa, tanggal, status, keterangan } = req.body;

    // Validasi input
    if (!id_siswa || !tanggal || !status) {
      throw createError(400, "Field id_siswa, tanggal, dan status wajib diisi");
    }
    if (!isValidDate(tanggal)) {
      throw createError(400, "Format tanggal harus YYYY-MM-DD");
    }

    // Cek apakah siswa ada
    const siswaCheck = await client.query(
      "SELECT id_siswa FROM siswa WHERE id_siswa = $1",
      [id_siswa],
    );
    if (siswaCheck.rows.length === 0) {
      throw createError(404, "Siswa tidak ditemukan");
    }

    // Insert absensi siswa
    const insertQuery = `
      INSERT INTO absensi_siswa (id_siswa, tanggal, status, keterangan)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await client.query(insertQuery, [
      id_siswa,
      tanggal,
      status,
      keterangan || null,
    ]);

    res.status(201).json({
      success: true,
      message: "Absensi siswa berhasil dibuat",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      next(createError(409, "Absensi untuk siswa dan tanggal ini sudah ada"));
    } else {
      next(error);
    }
  } finally {
    client.release();
  }
};

// --- 2. Filter  Absensi Siswa (All) ---
const getAllAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id_siswa, tanggal, status } = req.query;
    let query = `
      SELECT a.*, s.namaSiswa, s.NIS
      FROM absensi_siswa a
      LEFT JOIN siswa s ON a.id_siswa = s.id_siswa
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (id_siswa) {
      query += ` AND a.id_siswa = $${paramIndex++}`;
      values.push(id_siswa);
    }
    if (tanggal) {
      query += ` AND a.tanggal = $${paramIndex++}`;
      values.push(tanggal);
    }
    if (status) {
      query += ` AND a.status = $${paramIndex++}`;
      values.push(status);
    }

    query += ` ORDER BY a.tanggal DESC`;
    const result = await client.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

//--- 3. Filter Absensi Siswa (By Siswa)
const getAbsensiSiswaById = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const query = `
      SELECT a.*, s.namaSiswa, s.NIS
      FROM absensi_siswa a
      LEFT JOIN siswa s ON a.id_siswa = s.id_siswa
      WHERE a.id_absensi = $1
    `;
    const result = await client.query(query, [id]);
    if (result.rows.length === 0) {
      throw createError(404, "Absensi siswa tidak ditemukan");
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// --- 4. Update Absensi Siswa ---
const updateAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;

    if (!status && keterangan === undefined) {
      throw createError(400, "Tidak ada field yang akan diupdate");
    }

    // Cek apakah absensi ada
    const checkQuery =
      "SELECT id_absensi FROM absensi_siswa WHERE id_absensi = $1";
    const checkResult = await client.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      throw createError(404, "Absensi siswa tidak ditemukan");
    }

    let updateFields = [];
    let values = [];
    let paramIndex = 1;
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (keterangan !== undefined) {
      updateFields.push(`keterangan = $${paramIndex++}`);
      values.push(keterangan);
    }
    values.push(id);

    const updateQuery = `
      UPDATE absensi_siswa
      SET ${updateFields.join(", ")}, updated_at = NOW()
      WHERE id_absensi = $${paramIndex}
      RETURNING *
    `;
    const result = await client.query(updateQuery, values);
    res.json({
      success: true,
      message: "Absensi siswa berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// --- 5. Delete Absensi Siswa ---
const deleteAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const deleteQuery =
      "DELETE FROM absensi_siswa WHERE id_absensi = $1 RETURNING id_absensi";
    const result = await client.query(deleteQuery, [id]);
    if (result.rows.length === 0) {
      throw createError(404, "Absensi siswa tidak ditemukan");
    }
    res.json({ success: true, message: "Absensi siswa berhasil dihapus" });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  createAbsensiSiswa,
  getAllAbsensiSiswa,
  getAbsensiSiswaById,
  updateAbsensiSiswa,
  deleteAbsensiSiswa,
};
