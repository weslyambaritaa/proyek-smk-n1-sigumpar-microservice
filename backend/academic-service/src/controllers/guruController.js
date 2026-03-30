const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

// Helper untuk decode token tanpa verifikasi (sudah dilakukan gateway)
// req.user sudah diisi oleh middleware extractIdentity

// 1. Daftar kelas yang diampu guru
exports.getTeacherClasses = async (req, res, next) => {
  const guruId = req.user.sub; // UUID dari token
  try {
    const query = `
      SELECT DISTINCT k.id, k.nama_kelas, k.tingkat
      FROM kelas k
      LEFT JOIN mata_pelajaran m ON m.kelas_id = k.id AND m.guru_mapel_id = $1
      WHERE k.wali_kelas_id = $1 OR m.id IS NOT NULL
      ORDER BY k.tingkat, k.nama_kelas
    `;
    const result = await pool.query(query, [guruId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// 2. Mata pelajaran yang diajarkan guru di suatu kelas
exports.getSubjectsByClass = async (req, res, next) => {
  const { classId } = req.params;
  const guruId = req.user.sub;
  try {
    const query = `
      SELECT id, nama_mapel 
      FROM mata_pelajaran 
      WHERE kelas_id = $1 AND guru_mapel_id = $2
    `;
    const result = await pool.query(query, [classId, guruId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// 3. Daftar siswa dalam kelas
exports.getClassStudents = async (req, res, next) => {
  const { classId } = req.params;
  try {
    const query = `
      SELECT id_siswa, namaSiswa, NIS 
      FROM siswa 
      WHERE id_kelas = $1
      ORDER BY namaSiswa ASC
    `;
    const result = await pool.query(query, [classId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// 4. Ambil absensi yang sudah ada untuk tanggal dan mata pelajaran tertentu
exports.getAttendanceByClass = async (req, res, next) => {
  const { classId } = req.params;
  const { date, subjectId } = req.query;
  if (!date || !subjectId) {
    return next(createError(400, "Parameter date dan subjectId wajib diisi"));
  }
  try {
    const query = `
      SELECT a.id_siswa, a.status, a.keterangan
      FROM absensi_siswa a
      JOIN siswa s ON a.id_siswa = s.id_siswa
      WHERE s.id_kelas = $1 AND a.tanggal = $2 AND a.mata_pelajaran_id = $3
    `;
    const result = await pool.query(query, [classId, date, subjectId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// 5. Simpan absensi massal (bulk upsert)
exports.saveBulkAttendance = async (req, res, next) => {
  const { classId, date, subjectId, attendance } = req.body;
  if (!classId || !date || !subjectId || !Array.isArray(attendance)) {
    return next(createError(400, "Data tidak lengkap"));
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of attendance) {
      const { id_siswa, status, keterangan } = item;
      const upsertQuery = `
        INSERT INTO absensi_siswa (id_siswa, tanggal, status, keterangan, mata_pelajaran_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id_siswa, tanggal, mata_pelajaran_id)
        DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan, updated_at = NOW()
      `;
      await client.query(upsertQuery, [
        id_siswa,
        date,
        status,
        keterangan,
        subjectId,
      ]);
    }
    await client.query("COMMIT");
    res.json({ success: true, message: "Absensi berhasil disimpan" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};
