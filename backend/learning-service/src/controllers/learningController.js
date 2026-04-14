const multer = require('multer');
const { Op } = require('sequelize');
const { PerangkatPembelajaran, ReviewKepsek } = require('../models');
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

const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => (err ? reject(err) : resolve()));
  });

const isKepsek = (user) => {
  const roles = user?.realm_access?.roles || user?.resource_access?.['smk-sigumpar']?.roles || [];
  return roles.includes('kepala-sekolah');
};

// ── PERANGKAT PEMBELAJARAN ────────────────────────────────────────────────

exports.getAllPerangkat = asyncHandler(async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;
  const kepsek = isKepsek(user);
  const { status_review, jenis_dokumen, search } = req.query;

  const where = {};
  if (!kepsek && guruId) where.guru_id = guruId;
  if (status_review) where.status_review = status_review;
  if (jenis_dokumen) where.jenis_dokumen = jenis_dokumen;
  if (search) {
    where[Op.or] = [
      { nama_dokumen: { [Op.iLike]: `%${search}%` } },
      { nama_guru:    { [Op.iLike]: `%${search}%` } },
    ];
  }

  const data = await PerangkatPembelajaran.findAll({
    where,
    attributes: { exclude: ['file_data'] }, // jangan kirim binary ke list
    order: [['tanggal_upload', 'DESC'], ['id', 'DESC']],
  });

  res.json({ success: true, count: data.length, data });
});

exports.uploadPerangkat = asyncHandler(async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;
  if (!guruId) throw createError(401, 'Identitas guru tidak ditemukan');

  try { await runMulter(req, res); }
  catch (err) { throw createError(400, err.message); }

  const { nama_dokumen, jenis_dokumen, parent_id, nama_guru } = req.body;
  if (!nama_dokumen || !jenis_dokumen) throw createError(400, 'nama_dokumen dan jenis_dokumen wajib diisi');
  if (!req.file) throw createError(400, 'File wajib diunggah (PDF/DOCX)');

  // Hitung versi jika ini adalah revisi
  let versi = 1;
  const resolvedParentId = parent_id ? parseInt(parent_id) : null;
  if (resolvedParentId) {
    const maxVersi = await PerangkatPembelajaran.max('versi', {
      where: {
        [Op.or]: [{ id: resolvedParentId }, { parent_id: resolvedParentId }],
      },
    });
    versi = (maxVersi || 1) + 1;
  }

  const data = await PerangkatPembelajaran.create({
    guru_id:       guruId,
    nama_guru:     nama_guru || user?.name || user?.preferred_username || null,
    nama_dokumen:  nama_dokumen.trim(),
    jenis_dokumen,
    file_name:     req.file.originalname,
    file_data:     req.file.buffer,
    file_mime:     req.file.mimetype,
    status_review: 'menunggu',
    versi,
    parent_id:     resolvedParentId,
  });

  // Kembalikan tanpa file_data
  const { file_data: _, ...result } = data.toJSON();
  res.status(201).json({ success: true, data: result });
});

exports.downloadPerangkat = asyncHandler(async (req, res) => {
  const isView = req.path.endsWith('/view');
  const doc = await PerangkatPembelajaran.findByPk(req.params.id);
  if (!doc) throw createError(404, 'Dokumen tidak ditemukan');

  const mime = doc.file_mime || 'application/octet-stream';
  res.set('Content-Type', mime);
  res.set('Content-Disposition', `${isView ? 'inline' : 'attachment'}; filename="${doc.file_name}"`);
  res.send(doc.file_data);
});

exports.deletePerangkat = asyncHandler(async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;
  const kepsek = isKepsek(user);

  const doc = await PerangkatPembelajaran.findByPk(req.params.id, {
    attributes: ['id', 'guru_id'],
  });
  if (!doc) throw createError(404, 'Dokumen tidak ditemukan');
  if (!kepsek && guruId && String(doc.guru_id) !== String(guruId)) {
    throw createError(403, 'Akses ditolak');
  }

  await doc.destroy();
  res.json({ success: true, message: 'Dokumen berhasil dihapus' });
});

exports.reviewPerangkat = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!isKepsek(user)) throw createError(403, 'Hanya kepala sekolah yang dapat mereview dokumen');

  const { status, catatan } = req.body;
  const allowedStatus = ['disetujui', 'revisi', 'ditolak'];
  if (!status || !allowedStatus.includes(status)) {
    throw createError(400, `Status harus salah satu dari: ${allowedStatus.join(', ')}`);
  }

  const kepsekNama = user?.name || user?.preferred_username || 'Kepala Sekolah';
  const kepsekId   = user?.sub  || user?.id || null;

  const doc = await PerangkatPembelajaran.findByPk(req.params.id);
  if (!doc) throw createError(404, 'Dokumen tidak ditemukan');

  await doc.update({
    status_review:  status,
    catatan_review: catatan || null,
    reviewed_by:    kepsekNama,
    reviewed_at:    new Date(),
  });

  // Simpan riwayat review
  await ReviewKepsek.create({
    perangkat_id: doc.id,
    status,
    komentar:    catatan    || null,
    kepsek_id:   kepsekId,
    kepsek_nama: kepsekNama,
  }).catch((e) => console.warn('[ReviewKepsek create]', e.message));

  const { file_data: _, ...result } = doc.toJSON();
  res.json({ success: true, data: result });
});

exports.getRiwayatReview = asyncHandler(async (req, res) => {
  const doc = await PerangkatPembelajaran.findByPk(req.params.id, {
    attributes: ['id', 'parent_id'],
  });
  if (!doc) throw createError(404, 'Dokumen tidak ditemukan');

  const rootId = doc.parent_id || doc.id;

  // Semua versi dokumen (root + revisi)
  const allDocs = await PerangkatPembelajaran.findAll({
    where: { [Op.or]: [{ id: rootId }, { parent_id: rootId }] },
    attributes: ['id'],
  });
  const allIds = allDocs.map(d => d.id);

  const data = await ReviewKepsek.findAll({
    where: { perangkat_id: { [Op.in]: allIds } },
    include: [{
      model: PerangkatPembelajaran,
      as: 'perangkat',
      attributes: ['nama_dokumen', 'jenis_dokumen', 'versi', 'file_name'],
    }],
    order: [['created_at', 'DESC']],
  });

  res.json({ success: true, data });
});

exports.getVersiDokumen = asyncHandler(async (req, res) => {
  const doc = await PerangkatPembelajaran.findByPk(req.params.id, {
    attributes: ['id', 'parent_id'],
  });
  if (!doc) throw createError(404, 'Dokumen tidak ditemukan');

  const rootId = doc.parent_id || doc.id;

  const data = await PerangkatPembelajaran.findAll({
    where: { [Op.or]: [{ id: rootId }, { parent_id: rootId }] },
    attributes: { exclude: ['file_data'] },
    order: [['versi', 'ASC']],
  });

  res.json({ success: true, data });
});

// ── LAPORAN TAHUNAN ──────────────────────────────────────────────────────

exports.getLaporanTahunan = asyncHandler(async (req, res) => {
  const { tahun } = req.query;
  const tahunAjar = tahun || '2026/2027';

  // Placeholder data untuk laporan tahunan
  // Dalam implementasi asli, ini bisa query dari database
  const data = {
    tahun_ajar: tahunAjar,
    ringkasan: {
      total_guru: 25,
      total_siswa: 450,
      total_kelas: 12,
      total_mapel: 15,
    },
    prestasi: {
      akademik: 'Rata-rata nilai kelas meningkat 10%',
      non_akademik: 'Juara lomba pramuka tingkat kabupaten',
    },
    kegiatan: [
      'Upacara bendera rutin',
      'Pelatihan guru',
      'Kegiatan pramuka',
      'PKL siswa',
    ],
    rekomendasi: 'Perlu peningkatan fasilitas laboratorium',
  };

  res.json({ success: true, data });
});