const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');

// Ambil semua kelas yang tersedia (semua guru bisa melihat semua kelas untuk absensi)
exports.getTeacherClasses = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, nama_kelas, tingkat FROM kelas ORDER BY tingkat, nama_kelas`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// Ambil mapel berdasarkan kelas (tidak filter per guru agar semua mapel bisa dipilih)
exports.getSubjectsByClass = async (req, res, next) => {
  const { classId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, nama_mapel FROM mata_pelajaran WHERE kelas_id = $1 ORDER BY nama_mapel ASC`,
      [classId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getClassStudents = async (req, res, next) => {
  const { classId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id AS id_siswa, nama_lengkap AS namasiswa, nisn AS nis FROM siswa WHERE kelas_id = $1 ORDER BY nama_lengkap ASC`,
      [classId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getAttendanceByClass = async (req, res, next) => {
  const { classId } = req.params;
  const { date, subjectId } = req.query;
  if (!date) return next(createError(400, 'Parameter date wajib diisi'));
  try {
    let query = `
      SELECT a.siswa_id AS id_siswa, a.status, a.keterangan
      FROM absensi_siswa a
      JOIN siswa s ON a.siswa_id = s.id
      WHERE s.kelas_id = $1 AND a.tanggal = $2`;
    const params = [classId, date];
    if (subjectId) { query += ` AND a.mapel_id = $3`; params.push(subjectId); }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.saveBulkAttendance = async (req, res, next) => {
  const { classId, date, subjectId, attendance } = req.body;
  if (!classId || !date || !Array.isArray(attendance)) {
    return next(createError(400, 'Data tidak lengkap'));
  }
  if (attendance.length === 0) {
    return res.json({ success: true, message: 'Tidak ada absensi yang disimpan' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of attendance) {
      const { id_siswa, status, keterangan } = item;
      if (!id_siswa || !status) continue;
      const mapelId = subjectId ? parseInt(subjectId) : null;
      await client.query(
        `INSERT INTO absensi_siswa (siswa_id, tanggal, status, keterangan, mapel_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (siswa_id, tanggal, COALESCE(mapel_id, 0))
         DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, updated_at = NOW()`,
        [parseInt(id_siswa), date, status, keterangan || null, mapelId]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Absensi berhasil disimpan' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
// Note: saveBulkAttendance already fixed above in this file
