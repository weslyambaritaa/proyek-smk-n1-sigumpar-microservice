const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');

// Helper: normalisasi row agar frontend selalu mendapatkan field yang konsisten
// PostgreSQL menyimpan kolom camelCase hanya jika dibuat dengan tanda kutip.
// Fungsi ini memastikan data selalu memiliki key namaGuru, mataPelajaran, jamMasuk
// terlepas dari bagaimana kolom disimpan di DB.
const normalizeRow = (row) => ({
  ...row,
  namaGuru:      row.namaGuru      ?? row.namaguru      ?? row.nama_guru      ?? '-',
  mataPelajaran: row.mataPelajaran ?? row.matapelajaran ?? row.mata_pelajaran ?? '-',
  jamMasuk:      row.jamMasuk      ?? row.jammasuk      ?? row.jam_masuk      ?? null,
  id_absensiGuru: row.id_absensiGuru ?? row.id_absensiguru ?? row.id,
});

const getAllAbsensiGuru = async (req, res, next) => {
  try {
    const { user_id, tanggal, status } = req.query;
    // Gunakan COALESCE untuk mendukung nama kolom camelCase maupun lowercase
    let query = `
      SELECT
        COALESCE("id_absensiGuru", id_absensiguru) AS "id_absensiGuru",
        user_id,
        COALESCE("namaGuru", namaguru, nama_guru) AS "namaGuru",
        COALESCE("mataPelajaran", matapelajaran, mata_pelajaran) AS "mataPelajaran",
        COALESCE("jamMasuk", jammasuk, jam_masuk) AS "jamMasuk",
        tanggal,
        foto,
        status,
        keterangan,
        created_at,
        updated_at
      FROM absensi_guru
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (user_id) { query += ` AND user_id = $${idx++}`;  params.push(user_id); }
    if (tanggal) { query += ` AND tanggal = $${idx++}`;  params.push(tanggal); }
    if (status)  { query += ` AND status = $${idx++}`;   params.push(status); }
    query += ` ORDER BY COALESCE("jamMasuk", jammasuk, jam_masuk, created_at) DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
};

const getAbsensiGuruById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
        COALESCE("id_absensiGuru", id_absensiguru) AS "id_absensiGuru",
        user_id,
        COALESCE("namaGuru", namaguru, nama_guru) AS "namaGuru",
        COALESCE("mataPelajaran", matapelajaran, mata_pelajaran) AS "mataPelajaran",
        COALESCE("jamMasuk", jammasuk, jam_masuk) AS "jamMasuk",
        tanggal, foto, status, keterangan, created_at, updated_at
       FROM absensi_guru
       WHERE COALESCE("id_absensiGuru", id_absensiguru)::text = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) throw createError(404, 'Absensi guru tidak ditemukan');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

const createAbsensiGuru = async (req, res, next) => {
  try {
    const { user_id, namaGuru, mataPelajaran, keterangan = '', foto = null, status: statusOverride } = req.body;
    if (!user_id || !namaGuru) throw createError(400, 'Field user_id dan namaGuru wajib diisi');

    const now = new Date();
    const tanggal = now.toISOString().slice(0, 10);

    // Cek duplikasi
    const existing = await pool.query(
      'SELECT 1 FROM absensi_guru WHERE user_id = $1 AND tanggal = $2',
      [user_id, tanggal]
    );
    if (existing.rows.length > 0) throw createError(409, 'Anda sudah melakukan absensi hari ini');

    const isTerlambat = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 30);
    const status = statusOverride || (isTerlambat ? 'terlambat' : 'hadir');

    // Deteksi nama kolom yang digunakan di DB (quoted vs unquoted)
    const colCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'absensi_guru'
        AND lower(column_name) = 'namaguru'
      LIMIT 1
    `);

    let result;
    if (colCheck.rows.length > 0 && colCheck.rows[0].column_name === 'namaGuru') {
      // Kolom dengan quotes (camelCase asli)
      result = await pool.query(
        `INSERT INTO absensi_guru (user_id, "namaGuru", "mataPelajaran", "jamMasuk", tanggal, foto, status, keterangan)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
           COALESCE("id_absensiGuru", id_absensiguru) AS "id_absensiGuru",
           user_id,
           "namaGuru", "mataPelajaran", "jamMasuk",
           tanggal, foto, status, keterangan, created_at, updated_at`,
        [user_id, namaGuru, mataPelajaran || '-', now, tanggal, foto, status, keterangan]
      );
    } else {
      // Kolom lowercase (tanpa quotes saat DDL)
      result = await pool.query(
        `INSERT INTO absensi_guru (user_id, namaguru, matapelajaran, jammasuk, tanggal, foto, status, keterangan)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
           id AS "id_absensiGuru",
           user_id,
           namaguru AS "namaGuru",
           matapelajaran AS "mataPelajaran",
           jammasuk AS "jamMasuk",
           tanggal, foto, status, keterangan, created_at, updated_at`,
        [user_id, namaGuru, mataPelajaran || '-', now, tanggal, foto, status, keterangan]
      );
    }

    res.status(201).json({ success: true, message: 'Absensi guru berhasil dicatat', data: result.rows[0] });
  } catch (err) { next(err); }
};

const updateAbsensiGuru = async (req, res, next) => {
  try {
    const { status, keterangan, foto } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;
    if (status !== undefined)     { updates.push(`status = $${idx++}`);     params.push(status); }
    if (keterangan !== undefined) { updates.push(`keterangan = $${idx++}`); params.push(keterangan); }
    if (foto !== undefined)       { updates.push(`foto = $${idx++}`);       params.push(foto); }
    if (updates.length === 0)     throw createError(400, 'Tidak ada field yang akan diupdate');
    updates.push(`updated_at = NOW()`);
    params.push(req.params.id);

    // Support kedua format nama kolom id
    const result = await pool.query(
      `UPDATE absensi_guru SET ${updates.join(', ')}
       WHERE COALESCE("id_absensiGuru", id_absensiguru)::text = $${idx}
       RETURNING *`,
      params
    );
    if (result.rowCount === 0) throw createError(404, 'Absensi guru tidak ditemukan');
    res.json({ success: true, message: 'Absensi guru berhasil diperbarui', data: normalizeRow(result.rows[0]) });
  } catch (err) { next(err); }
};

const deleteAbsensiGuru = async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM absensi_guru WHERE COALESCE("id_absensiGuru", id_absensiguru)::text = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rowCount === 0) throw createError(404, 'Absensi guru tidak ditemukan');
    res.json({ success: true, message: 'Absensi guru berhasil dihapus' });
  } catch (err) { next(err); }
};

module.exports = { getAllAbsensiGuru, getAbsensiGuruById, createAbsensiGuru, updateAbsensiGuru, deleteAbsensiGuru };
