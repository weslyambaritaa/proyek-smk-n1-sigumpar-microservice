const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");
const { getUserRoles } = require("../middleware/role");

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// CREATE (hanya guru)
const createAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { tanggal, status, keterangan } = req.body;
    const user_id = req.user.sub; // dari token

    if (!tanggal || !status) {
      throw createError(400, "Field tanggal dan status wajib diisi");
    }
    if (!isValidDate(tanggal)) {
      throw createError(400, "Format tanggal harus YYYY-MM-DD");
    }

    // Cek duplikasi
    const checkQuery =
      "SELECT id_absensi FROM absensi_guru WHERE user_id = $1 AND tanggal = $2";
    const checkResult = await client.query(checkQuery, [user_id, tanggal]);
    if (checkResult.rows.length > 0) {
      throw createError(409, "Anda sudah melakukan absensi untuk tanggal ini");
    }

    const insertQuery = `
      INSERT INTO absensi_guru (user_id, tanggal, status, keterangan)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await client.query(insertQuery, [
      user_id,
      tanggal,
      status,
      keterangan || null,
    ]);
    res.status(201).json({
      success: true,
      message: "Absensi guru berhasil dibuat",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// READ ALL – guru lihat sendiri, admin lihat semua
const getAllAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const roles = getUserRoles(req);
    const isAdmin = roles.includes("wakepsek") || roles.includes("kepsek");
    const user_id = req.user.sub;

    let query = `
      SELECT id_absensi, user_id, tanggal, status, keterangan, created_at, updated_at
      FROM absensi_guru
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (!isAdmin) {
      query += ` AND user_id = $${paramIndex++}`;
      values.push(user_id);
    }

    query += ` ORDER BY tanggal DESC`;

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

// READ ONE – guru hanya bisa lihat milik sendiri, admin bisa lihat semua
const getAbsensiGuruById = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const roles = getUserRoles(req);
    const isAdmin = roles.includes("wakepsek") || roles.includes("kepsek");
    const user_id = req.user.sub;

    let query = `
      SELECT id_absensi, user_id, tanggal, status, keterangan, created_at, updated_at
      FROM absensi_guru
      WHERE id_absensi = $1
    `;
    const values = [id];
    let paramIndex = 2;
    if (!isAdmin) {
      query += ` AND user_id = $${paramIndex++}`;
      values.push(user_id);
    }

    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      throw createError(404, "Absensi guru tidak ditemukan");
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// UPDATE – guru bisa update milik sendiri, admin bisa update semua
const updateAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;
    const roles = getUserRoles(req);
    const isAdmin = roles.includes("wakepsek") || roles.includes("kepsek");
    const user_id = req.user.sub;

    if (!status && keterangan === undefined) {
      throw createError(400, "Tidak ada field yang akan diupdate");
    }

    // Cek kepemilikan atau admin
    let checkQuery =
      "SELECT id_absensi FROM absensi_guru WHERE id_absensi = $1";
    const checkValues = [id];
    if (!isAdmin) {
      checkQuery += " AND user_id = $2";
      checkValues.push(user_id);
    }
    const checkResult = await client.query(checkQuery, checkValues);
    if (checkResult.rows.length === 0) {
      throw createError(
        404,
        "Absensi guru tidak ditemukan atau Anda tidak memiliki izin",
      );
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
      UPDATE absensi_guru
      SET ${updateFields.join(", ")}, updated_at = NOW()
      WHERE id_absensi = $${paramIndex}
      RETURNING *
    `;
    const result = await client.query(updateQuery, values);
    res.json({
      success: true,
      message: "Absensi guru berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// DELETE – guru hanya bisa hapus milik sendiri, admin bisa hapus semua
const deleteAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const roles = getUserRoles(req);
    const isAdmin = roles.includes("wakepsek") || roles.includes("kepsek");
    const user_id = req.user.sub;

    let deleteQuery = "DELETE FROM absensi_guru WHERE id_absensi = $1";
    const values = [id];
    if (!isAdmin) {
      deleteQuery += " AND user_id = $2";
      values.push(user_id);
    }
    deleteQuery += " RETURNING id_absensi";
    const result = await client.query(deleteQuery, values);
    if (result.rows.length === 0) {
      throw createError(
        404,
        "Absensi guru tidak ditemukan atau Anda tidak memiliki izin",
      );
    }
    res.json({ success: true, message: "Absensi guru berhasil dihapus" });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  createAbsensiGuru,
  getAllAbsensiGuru,
  getAbsensiGuruById,
  updateAbsensiGuru,
  deleteAbsensiGuru,
};
