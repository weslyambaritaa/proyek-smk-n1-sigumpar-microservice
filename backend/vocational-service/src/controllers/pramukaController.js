const multer = require('multer');
const { QueryTypes } = require('sequelize');
const {
  sequelize,
  KelasPramuka,
  AnggotaRegu,
  AbsensiPramuka,
  LaporanPramuka,
  SilabusPramuka,
  LaporanKegiatan,
} = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ── Upload middleware ─────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file PDF, DOCX/DOC, dan gambar yang diperbolehkan'));
  },
});

const runMulter = (field) => (req, res) =>
  new Promise((resolve, reject) => {
    upload.single(field)(req, res, (err) => (err ? reject(err) : resolve()));
  });

const INLINE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

// ── REGU ──────────────────────────────────────────────────────────────────

exports.getAllRegu = asyncHandler(async (req, res) => {
  const data = await KelasPramuka.findAll({ order: [['id', 'ASC']] });
  res.json({ success: true, data });
});

exports.createRegu = asyncHandler(async (req, res) => {
  const { nama_regu } = req.body;
  if (!nama_regu) throw createError(400, 'nama_regu wajib diisi');
  const data = await KelasPramuka.create({ nama_regu });
  res.status(201).json({ success: true, data });
});

exports.deleteRegu = asyncHandler(async (req, res) => {
  const regu = await KelasPramuka.findByPk(req.params.id);
  if (!regu) throw createError(404, 'Regu tidak ditemukan');
  await regu.destroy();
  res.json({ success: true, message: 'Regu berhasil dihapus' });
});

// ── ANGGOTA REGU ──────────────────────────────────────────────────────────

exports.getSiswaTersedia = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: [] });
});

exports.assignSiswaToRegu = asyncHandler(async (req, res) => {
  const { regu_id, siswa_id, nama_lengkap } = req.body;
  if (!regu_id || !siswa_id) throw createError(400, 'regu_id dan siswa_id wajib diisi');

  // findOrCreate untuk handle duplikasi
  const [data, created] = await AnggotaRegu.findOrCreate({
    where:    { regu_id, siswa_id },
    defaults: { nama_lengkap: nama_lengkap || '' },
  });
  res.status(created ? 201 : 200).json({ success: true, data });
});

exports.getSiswaByRegu = asyncHandler(async (req, res) => {
  const data = await AnggotaRegu.findAll({
    where: { regu_id: req.params.regu_id },
    order: [['nama_lengkap', 'ASC']],
  });
  res.json({ success: true, data });
});

// ── ABSENSI PRAMUKA ───────────────────────────────────────────────────────

exports.submitAbsensiPramuka = asyncHandler(async (req, res) => {
  const { kelas_id, regu_id, tanggal, deskripsi, file_url, data_absensi } = req.body;
  const kelasOrRegu = kelas_id || regu_id;
  if (!kelasOrRegu || !tanggal || !Array.isArray(data_absensi)) {
    throw createError(400, 'kelas_id, tanggal, dan data_absensi wajib diisi');
  }

  await sequelize.transaction(async (t) => {
    await LaporanPramuka.create(
      { regu_id: kelasOrRegu, tanggal, deskripsi: deskripsi || '', file_url: file_url || '' },
      { transaction: t }
    );

    for (const item of data_absensi) {
      const { siswa_id, nama_lengkap, status } = item;
      if (!siswa_id) continue;

      // ON CONFLICT dengan index unik — tetap pakai raw query
      await sequelize.query(
        `INSERT INTO absensi_pramuka (regu_id, siswa_id, tanggal, status, nama_lengkap, kelas_id)
         VALUES (:regu_id, :siswa_id, :tanggal, :status, :nama_lengkap, :kelas_id)
         ON CONFLICT (regu_id, siswa_id, tanggal)
         DO UPDATE SET status = EXCLUDED.status, nama_lengkap = EXCLUDED.nama_lengkap`,
        {
          replacements: {
            regu_id:      kelasOrRegu,
            siswa_id,
            tanggal,
            status:       status       || 'Hadir',
            nama_lengkap: nama_lengkap || '',
            kelas_id:     kelas_id     || kelasOrRegu,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }
  });

  res.json({ success: true, message: 'Absensi pramuka berhasil disimpan' });
});

exports.getAbsensiPramuka = asyncHandler(async (req, res) => {
  const { regu_id, kelas_id, tanggal, tanggal_mulai, tanggal_akhir } = req.query;
  const kelasFilter = kelas_id || regu_id;

  const where = {};
  if (kelasFilter)   where.regu_id = kelasFilter;
  if (tanggal)       where.tanggal = tanggal;

  // Range tanggal pakai Op dari Sequelize
  const { Op } = require('sequelize');
  if (tanggal_mulai || tanggal_akhir) {
    where.tanggal = {};
    if (tanggal_mulai) where.tanggal[Op.gte] = tanggal_mulai;
    if (tanggal_akhir) where.tanggal[Op.lte] = tanggal_akhir;
  }

  const data = await AbsensiPramuka.findAll({
    where,
    order: [['tanggal', 'DESC'], ['id', 'ASC']],
  });
  res.json({ success: true, data });
});

exports.getRekapAbsensiPramuka = asyncHandler(async (req, res) => {
  const { tanggal_mulai, tanggal_akhir, regu_id } = req.query;

  const params = [tanggal_mulai || null, tanggal_akhir || null];
  let extraWhere = '';
  if (regu_id) {
    extraWhere = ' AND ar.regu_id = :regu_id';
    params.push(regu_id);
  }

  const rows = await sequelize.query(
    `SELECT ar.siswa_id, ar.nama_lengkap, k.nama_regu,
       COUNT(CASE WHEN ap.status = 'Hadir' THEN 1 END) AS hadir,
       COUNT(CASE WHEN ap.status = 'Izin'  THEN 1 END) AS izin,
       COUNT(CASE WHEN ap.status = 'Sakit' THEN 1 END) AS sakit,
       COUNT(CASE WHEN ap.status = 'Alpa'  THEN 1 END) AS alpa,
       COUNT(ap.id) AS total
     FROM anggota_regu ar
     JOIN kelas_pramuka k ON ar.regu_id = k.id
     LEFT JOIN absensi_pramuka ap
       ON ap.siswa_id = ar.siswa_id AND ap.regu_id = ar.regu_id
       AND (:tanggal_mulai::DATE IS NULL OR ap.tanggal >= :tanggal_mulai)
       AND (:tanggal_akhir::DATE IS NULL OR ap.tanggal <= :tanggal_akhir)
     WHERE 1=1 ${regu_id ? 'AND ar.regu_id = :regu_id' : ''}
     GROUP BY ar.siswa_id, ar.nama_lengkap, k.nama_regu
     ORDER BY k.nama_regu, ar.nama_lengkap`,
    {
      replacements: {
        tanggal_mulai: tanggal_mulai || null,
        tanggal_akhir: tanggal_akhir || null,
        ...(regu_id ? { regu_id } : {}),
      },
      type: QueryTypes.SELECT,
    }
  );
  res.json({ success: true, data: rows });
});

// ── SILABUS PRAMUKA ───────────────────────────────────────────────────────

exports.getAllSilabus = asyncHandler(async (req, res) => {
  const data = await SilabusPramuka.findAll({
    attributes: { exclude: ['file_data'] },
    order: [['tanggal', 'DESC'], ['id', 'DESC']],
  });
  res.json({ success: true, data });
});

exports.createSilabus = asyncHandler(async (req, res) => {
  try { await runMulter('file')(req, res); }
  catch (err) { throw createError(400, err.message); }

  const { tingkat_kelas, judul_kegiatan, tanggal } = req.body;
  if (!judul_kegiatan) throw createError(400, 'judul_kegiatan wajib diisi');

  const data = await SilabusPramuka.create({
    tingkat_kelas:  tingkat_kelas || null,
    judul_kegiatan,
    tanggal:        tanggal || new Date().toISOString().slice(0, 10),
    file_data:  req.file?.buffer        || null,
    file_mime:  req.file?.mimetype      || null,
    file_nama:  req.file?.originalname  || null,
  });

  // Jangan kirim file_data ke client
  const { file_data: _, ...result } = data.toJSON();
  res.status(201).json({ success: true, data: result });
});

exports.downloadSilabus = asyncHandler(async (req, res) => {
  const isView = req.path.endsWith('/view');
  const silabus = await SilabusPramuka.findByPk(req.params.id);
  if (!silabus)          throw createError(404, 'Silabus tidak ditemukan');
  if (!silabus.file_data) throw createError(404, 'File tidak tersedia');

  const mime = silabus.file_mime || 'application/octet-stream';
  res.set('Content-Type', mime);
  res.set('Content-Disposition',
    `${isView && INLINE_TYPES.includes(mime) ? 'inline' : 'attachment'}; filename="${silabus.file_nama}"`
  );
  res.send(silabus.file_data);
});

exports.deleteSilabus = asyncHandler(async (req, res) => {
  const silabus = await SilabusPramuka.findByPk(req.params.id);
  if (!silabus) throw createError(404, 'Silabus tidak ditemukan');
  await silabus.destroy();
  res.json({ success: true, message: 'Silabus berhasil dihapus' });
});

// ── LAPORAN KEGIATAN PRAMUKA ──────────────────────────────────────────────

exports.getAllLaporanKegiatan = asyncHandler(async (req, res) => {
  const data = await LaporanKegiatan.findAll({
    attributes: { exclude: ['file_data'] },
    order: [['tanggal', 'DESC'], ['id', 'DESC']],
  });
  res.json({ success: true, data });
});

exports.createLaporanKegiatan = asyncHandler(async (req, res) => {
  try { await runMulter('file_laporan')(req, res); }
  catch (err) { throw createError(400, err.message); }

  const { judul, deskripsi, tanggal } = req.body;
  if (!judul) throw createError(400, 'judul wajib diisi');

  const data = await LaporanKegiatan.create({
    judul,
    deskripsi:  deskripsi || '',
    tanggal:    tanggal   || new Date().toISOString().slice(0, 10),
    file_data:  req.file?.buffer        || null,
    file_mime:  req.file?.mimetype      || null,
    file_nama:  req.file?.originalname  || null,
  });

  const { file_data: _, ...result } = data.toJSON();
  res.status(201).json({ success: true, data: result });
});

exports.downloadLaporanKegiatan = asyncHandler(async (req, res) => {
  const isView = req.path.endsWith('/view');
  const laporan = await LaporanKegiatan.findByPk(req.params.id);
  if (!laporan)           throw createError(404, 'Laporan tidak ditemukan');
  if (!laporan.file_data) throw createError(404, 'File tidak tersedia');

  const mime = laporan.file_mime || 'application/octet-stream';
  res.set('Content-Type', mime);
  res.set('Content-Disposition',
    `${isView && INLINE_TYPES.includes(mime) ? 'inline' : 'attachment'}; filename="${laporan.file_nama}"`
  );
  res.send(laporan.file_data);
});

exports.deleteLaporanKegiatan = asyncHandler(async (req, res) => {
  const laporan = await LaporanKegiatan.findByPk(req.params.id);
  if (!laporan) throw createError(404, 'Laporan tidak ditemukan');
  await laporan.destroy();
  res.json({ success: true, message: 'Laporan berhasil dihapus' });
});