const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');

const validStatuses = ['hadir', 'sakit', 'izin', 'alpa', 'terlambat'];
const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime());

exports.createAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { siswa_id, tanggal, status, keterangan, mapel_id = null } = req.body;
    if (!siswa_id || !tanggal || !status) throw createError(400, 'Field siswa_id, tanggal, dan status wajib diisi');
    if (!isValidDate(tanggal)) throw createError(400, 'Format tanggal harus YYYY-MM-DD');
    if (!validStatuses.includes(status)) throw createError(400, 'Status absensi tidak valid');

    // Upsert instead of insert to handle duplicates gracefully
    const result = await client.query(
      `INSERT INTO absensi_siswa (siswa_id, tanggal, status, keterangan, mapel_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (siswa_id, tanggal, COALESCE(mapel_id, 0))
       DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, updated_at = NOW()
       RETURNING *`,
      [siswa_id, tanggal, status, keterangan || null, mapel_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
};

exports.getAllAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { siswa_id, tanggal, status, mapel_id, kelas_id } = req.query;
    let query = `
      SELECT a.*, s.nisn, s.nama_lengkap, s.kelas_id, k.nama_kelas, m.nama_mapel
      FROM absensi_siswa a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN mata_pelajaran m ON a.mapel_id = m.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (siswa_id) { query += ` AND a.siswa_id = $${idx++}`; params.push(siswa_id); }
    if (tanggal)  { query += ` AND a.tanggal = $${idx++}`;  params.push(tanggal); }
    if (status)   { query += ` AND a.status = $${idx++}`;   params.push(status); }
    if (mapel_id) { query += ` AND a.mapel_id = $${idx++}`; params.push(mapel_id); }
    if (kelas_id) { query += ` AND s.kelas_id = $${idx++}`; params.push(kelas_id); }
    query += ` ORDER BY a.tanggal DESC, s.nama_lengkap ASC`;
    const result = await client.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
  finally { client.release(); }
};

exports.getAbsensiSiswaById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM absensi_siswa WHERE id=$1', [req.params.id]);
    if (!result.rows.length) throw createError(404, 'Absensi tidak ditemukan');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

exports.updateAbsensiSiswa = async (req, res, next) => {
  try {
    const { status, keterangan } = req.body;
    if (!status) throw createError(400, 'Status wajib diisi');
    const result = await pool.query(
      'UPDATE absensi_siswa SET status=$1, keterangan=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, keterangan || null, req.params.id]
    );
    if (!result.rowCount) throw createError(404, 'Absensi tidak ditemukan');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

exports.deleteAbsensiSiswa = async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM absensi_siswa WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) throw createError(404, 'Absensi tidak ditemukan');
    res.json({ success: true, message: 'Absensi berhasil dihapus' });
  } catch (err) { next(err); }
};
