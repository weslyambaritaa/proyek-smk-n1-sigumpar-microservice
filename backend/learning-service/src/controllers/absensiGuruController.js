const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

// Helper: cek apakah waktu melebihi jam 07:30 (menggunakan UTC, sesuaikan jika perlu)
const isTerlambat = (jamMasuk) => {
  const hour = jamMasuk.getUTCHours();
  const minute = jamMasuk.getUTCMinutes();
  return (hour > 7) || (hour === 7 && minute > 30);
};

// Helper: konversi file ke base64 (jika ada)
const fileToBase64 = (file) => {
  if (!file) return null;
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// CREATE – tambah absensi guru dengan foto
const createAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { user_id, namaGuru, mataPelajaran, keterangan } = req.body;

    // Validasi wajib
    if (!user_id || !namaGuru || !mataPelajaran) {
      throw createError(400, "Field user_id, namaGuru, mataPelajaran wajib diisi");
    }

    // Cek apakah sudah absen hari ini
    const tanggal = new Date().toISOString().split('T')[0];
    const checkQuery = `
      SELECT id_absensiGuru FROM absensi_guru
      WHERE user_id = $1 AND DATE(jamMasuk) = $2
    `;
    const checkResult = await client.query(checkQuery, [user_id, tanggal]);
    if (checkResult.rows.length > 0) {
      throw createError(409, "Anda sudah melakukan absensi hari ini");
    }

    const jamMasuk = new Date(); // waktu server saat ini
    const status = isTerlambat(jamMasuk) ? 'terlambat' : 'hadir';
    const foto = fileToBase64(req.file); // konversi file ke base64

    const insertQuery = `
      INSERT INTO absensi_guru (user_id, namaGuru, mataPelajaran, jamMasuk, foto, status, keterangan)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await client.query(insertQuery, [
      user_id,
      namaGuru,
      mataPelajaran,
      jamMasuk,
      foto,
      status,
      keterangan || null
    ]);

    res.status(201).json({
      success: true,
      message: "Absensi guru berhasil dicatat",
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// READ ALL (sama seperti sebelumnya)
const getAllAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { user_id, tanggal, status } = req.query;
    let query = `SELECT * FROM absensi_guru WHERE 1=1`;
    const values = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      values.push(user_id);
    }
    if (tanggal) {
      query += ` AND DATE(jamMasuk) = $${paramIndex++}`;
      values.push(tanggal);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(status);
    }
    query += ` ORDER BY jamMasuk DESC`;

    const result = await client.query(query, values);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// READ ONE
const getAbsensiGuruById = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM absensi_guru WHERE id_absensiGuru = $1',
      [id]
    );
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

// UPDATE – bisa mengganti foto, status, atau keterangan
const updateAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;

    // Cek apakah record ada
    const checkQuery = 'SELECT id_absensiGuru FROM absensi_guru WHERE id_absensiGuru = $1';
    const checkResult = await client.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      throw createError(404, "Absensi guru tidak ditemukan");
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
    // Jika ada file foto baru
    if (req.file) {
      const foto = fileToBase64(req.file);
      updateFields.push(`foto = $${paramIndex++}`);
      values.push(foto);
    }
    values.push(id);

    if (updateFields.length === 0) {
      throw createError(400, "Tidak ada field yang akan diupdate");
    }

    const updateQuery = `
      UPDATE absensi_guru
      SET ${updateFields.join(", ")}, updated_at = NOW()
      WHERE id_absensiGuru = $${paramIndex}
      RETURNING *
    `;
    const result = await client.query(updateQuery, values);
    res.json({
      success: true,
      message: "Absensi guru berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// DELETE
const deleteAbsensiGuru = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const deleteQuery = `
      DELETE FROM absensi_guru
      WHERE id_absensiGuru = $1
      RETURNING id_absensiGuru
    `;
    const result = await client.query(deleteQuery, [id]);
    if (result.rows.length === 0) {
      throw createError(404, "Absensi guru tidak ditemukan");
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
  deleteAbsensiGuru
};