const { Kelas, MataPelajaran, Siswa, AbsensiSiswa } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');
const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

exports.getTeacherClasses = asyncHandler(async (req, res) => {
  const data = await Kelas.findAll({
    attributes: ['id', 'nama_kelas', 'tingkat'],
    order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']],
  });
  res.json(data);
});

exports.getSubjectsByClass = asyncHandler(async (req, res) => {
  const data = await MataPelajaran.findAll({
    where: { kelas_id: req.params.classId },
    attributes: ['id', 'nama_mapel'],
    order: [['nama_mapel', 'ASC']],
  });
  res.json(data);
});

exports.getClassStudents = asyncHandler(async (req, res) => {
  const data = await Siswa.findAll({
    where: { kelas_id: req.params.classId },
    attributes: [['id', 'id_siswa'], ['nama_lengkap', 'namasiswa'], ['nisn', 'nis']],
    order: [['nama_lengkap', 'ASC']],
  });
  res.json(data);
});

exports.getAttendanceByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date, subjectId } = req.query;
  if (!date) throw createError(400, 'Parameter date wajib diisi');

  const whereAbsensi = { tanggal: date };
  if (subjectId) whereAbsensi.mapel_id = subjectId;

  const rows = await sequelize.query(
    `SELECT a.siswa_id AS id_siswa, a.status, a.keterangan
     FROM absensi_siswa a
     JOIN siswa s ON a.siswa_id = s.id
     WHERE s.kelas_id = :classId AND a.tanggal = :date
     ${subjectId ? 'AND a.mapel_id = :subjectId' : ''}`,
    { replacements: { classId, date, subjectId: subjectId || null }, type: QueryTypes.SELECT }
  );
  res.json(rows);
});

exports.saveBulkAttendance = asyncHandler(async (req, res) => {
  const { classId, date, subjectId, attendance } = req.body;
  if (!classId || !date || !Array.isArray(attendance)) throw createError(400, 'Data tidak lengkap');
  if (attendance.length === 0) return res.json({ success: true, message: 'Tidak ada absensi yang disimpan' });

  await sequelize.transaction(async (t) => {
    for (const item of attendance) {
      const { id_siswa, status, keterangan } = item;
      if (!id_siswa || !status) continue;
      const mapelId = subjectId ? parseInt(subjectId) : null;
      await sequelize.query(
        `INSERT INTO absensi_siswa (siswa_id, tanggal, status, keterangan, mapel_id)
         VALUES (:siswa_id, :date, :status, :ket, :mapel_id)
         ON CONFLICT (siswa_id, tanggal, COALESCE(mapel_id, 0))
         DO UPDATE SET status=EXCLUDED.status, keterangan=EXCLUDED.keterangan, updated_at=NOW()`,
        {
          replacements: { siswa_id: parseInt(id_siswa), date, status, ket: keterangan || null, mapel_id: mapelId },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }
  });

  res.json({ success: true, message: 'Absensi berhasil disimpan' });
});