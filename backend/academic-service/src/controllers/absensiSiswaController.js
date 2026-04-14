const { Op } = require('sequelize');
const { AbsensiSiswa, Siswa, MataPelajaran, Kelas } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getDataAbsensiSiswa = asyncHandler(async (req, res) => {
  const { tanggal, kelas_id, status, siswa_id, mapel_id } = req.query;

  const where = {};
  if (tanggal) where.tanggal = tanggal;
  if (status) where.status = status;
  if (siswa_id) where.siswa_id = siswa_id;
  if (mapel_id) where.mapel_id = mapel_id;

  const siswaInclude = {
    model: Siswa,
    as: 'siswa',
    attributes: ['id', 'nama', 'nis', 'kelas_id'],
    include: [{ model: Kelas, as: 'kelas', attributes: ['id', 'nama_kelas'] }],
  };

  if (kelas_id) {
    siswaInclude.where = { kelas_id };
  }

  const data = await AbsensiSiswa.findAll({
    where,
    include: [siswaInclude, { model: MataPelajaran, as: 'mapel', attributes: ['id', 'nama_mapel'] }],
    order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
  });

  res.json({ success: true, data });
});

exports.simpanAbsensiSiswa = asyncHandler(async (req, res) => {
  const { attendance, date, classId, subjectId } = req.body;

  if (!date) throw createError(400, 'Field date wajib diisi');
  if (!subjectId) throw createError(400, 'Field subjectId wajib diisi');
  if (!Array.isArray(attendance) || attendance.length === 0) {
    throw createError(400, 'Field attendance wajib diisi dengan minimal satu record');
  }

  const mapel_id = Number(subjectId) || null;
  const tanggal = date;

  const rows = attendance.map((item) => {
    if (!item.id_siswa) throw createError(400, 'Setiap record absensi harus memiliki id_siswa');
    if (!item.status) throw createError(400, `Status absensi untuk siswa ${item.id_siswa} wajib diisi`);

    return {
      siswa_id: Number(item.id_siswa),
      tanggal,
      mapel_id,
      status: item.status,
      keterangan: item.keterangan || null,
    };
  });

  const siswaIds = rows.map((row) => row.siswa_id);

  await AbsensiSiswa.destroy({
    where: {
      siswa_id: { [Op.in]: siswaIds },
      tanggal,
      mapel_id,
    },
  });

  const created = await AbsensiSiswa.bulkCreate(rows);

  res.status(201).json({ success: true, data: created });
});
