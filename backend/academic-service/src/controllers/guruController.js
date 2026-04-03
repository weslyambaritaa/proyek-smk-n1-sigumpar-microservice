const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');

exports.getTeacherClasses = async (req, res, next) => {
  const guruId = req.user?.sub;
  try {
    const query = `
      SELECT DISTINCT k.id, k.nama_kelas, k.tingkat
      FROM kelas k
      LEFT JOIN mata_pelajaran m ON m.kelas_id = k.id AND m.guru_mapel_id = $1
      WHERE k.wali_kelas_id = $1 OR m.id IS NOT NULL
      ORDER BY k.tingkat, k.nama_kelas`;
    const result = await pool.query(query, [guruId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getSubjectsByClass = async (req, res, next) => {
  const { classId } = req.params;
  const guruId = req.user?.sub;
  try {
    const result = await pool.query(
      'SELECT id, nama_mapel FROM mata_pelajaran WHERE kelas_id = $1 AND guru_mapel_id = $2 ORDER BY nama_mapel ASC',
      [classId, guruId],
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getClassStudents = async (req, res, next) => {
  const { classId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id AS id_siswa, nama_lengkap AS namasiswa, nisn AS nis FROM siswa WHERE kelas_id = $1 ORDER BY nama_lengkap ASC`,
      [classId],
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceByClass = async (req, res, next) => {
  const { classId } = req.params;
  const { date, subjectId } = req.query;
  if (!date || !subjectId) return next(createError(400, 'Parameter date dan subjectId wajib diisi'));
  try {
    const result = await pool.query(
      `SELECT a.siswa_id AS id_siswa, a.status, a.keterangan
       FROM absensi_siswa a
       JOIN siswa s ON a.siswa_id = s.id
       WHERE s.kelas_id = $1 AND a.tanggal = $2 AND a.mapel_id = $3`,
      [classId, date, subjectId],
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.saveBulkAttendance = async (req, res, next) => {
  const { classId, date, subjectId, attendance } = req.body;
  if (!classId || !date || !subjectId || !Array.isArray(attendance)) {
    return next(createError(400, 'Data tidak lengkap'));
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of attendance) {
      const { id_siswa, status, keterangan } = item;
      if (!id_siswa || !status) continue;
      await client.query(
        `INSERT INTO absensi_siswa (siswa_id, tanggal, status, keterangan, mapel_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (siswa_id, tanggal, mapel_id)
         DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, updated_at = NOW()`,
        [id_siswa, date, status, keterangan || null, subjectId],
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
