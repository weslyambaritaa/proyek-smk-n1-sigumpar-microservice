const { Op } = require('sequelize');
const { AbsensiGuru } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllAbsensiGuru = asyncHandler(async (req, res) => {
  const { user_id, tanggal, status } = req.query;
  const where = {};
  if (user_id) where.user_id = user_id;
  if (tanggal) where.tanggal = tanggal;
  if (status)  where.status  = status;

  const data = await AbsensiGuru.findAll({
    where,
    order: [['jam_masuk', 'DESC']],
  });
  res.json({ success: true, count: data.length, data });
});

exports.getAbsensiGuruById = asyncHandler(async (req, res) => {
  // Cari by id_absensiguru (UUID) atau id (integer)
  const data = await AbsensiGuru.findOne({
    where: {
      [Op.or]: [
        { id_absensiguru: req.params.id },
        // fallback ke integer id jika param adalah angka
        ...(Number.isInteger(Number(req.params.id)) ? [{ id: req.params.id }] : []),
      ],
    },
  });
  if (!data) throw createError(404, 'Absensi guru tidak ditemukan');
  res.json({ success: true, data });
});

exports.createAbsensiGuru = asyncHandler(async (req, res) => {
  const {
    user_id, namaGuru, mataPelajaran,
    keterangan = '', foto = null, status: statusOverride,
  } = req.body;
  if (!user_id)  throw createError(400, 'Field user_id wajib diisi');
  if (!namaGuru) throw createError(400, 'Field namaGuru wajib diisi');

  const now     = new Date();
  const tanggal = now.toISOString().slice(0, 10);

  // Cek duplikasi absensi hari ini
  const existing = await AbsensiGuru.findOne({ where: { user_id, tanggal } });
  if (existing) throw createError(409, 'Anda sudah melakukan absensi hari ini');

  const isTerlambat = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 30);
  const status = statusOverride || (isTerlambat ? 'terlambat' : 'hadir');

  const data = await AbsensiGuru.create({
    user_id,
    nama_guru:      namaGuru,
    mata_pelajaran: mataPelajaran || '-',
    jam_masuk:      now,
    tanggal,
    foto,
    status,
    keterangan,
  });

  res.status(201).json({ success: true, message: 'Absensi guru berhasil dicatat', data });
});

exports.updateAbsensiGuru = asyncHandler(async (req, res) => {
  const { status, keterangan, foto } = req.body;
  if (status === undefined && keterangan === undefined && foto === undefined) {
    throw createError(400, 'Tidak ada field yang akan diupdate');
  }

  const absensi = await AbsensiGuru.findOne({
    where: {
      [Op.or]: [
        { id_absensiguru: req.params.id },
        ...(Number.isInteger(Number(req.params.id)) ? [{ id: req.params.id }] : []),
      ],
    },
  });
  if (!absensi) throw createError(404, 'Absensi guru tidak ditemukan');

  await absensi.update({
    ...(status     !== undefined && { status }),
    ...(keterangan !== undefined && { keterangan }),
    ...(foto       !== undefined && { foto }),
    updated_at: new Date(),
  });

  res.json({ success: true, message: 'Absensi guru berhasil diperbarui', data: absensi });
});

exports.deleteAbsensiGuru = asyncHandler(async (req, res) => {
  const absensi = await AbsensiGuru.findOne({
    where: {
      [Op.or]: [
        { id_absensiguru: req.params.id },
        ...(Number.isInteger(Number(req.params.id)) ? [{ id: req.params.id }] : []),
      ],
    },
  });
  if (!absensi) throw createError(404, 'Absensi guru tidak ditemukan');
  await absensi.destroy();
  res.json({ success: true, message: 'Absensi guru berhasil dihapus' });
});