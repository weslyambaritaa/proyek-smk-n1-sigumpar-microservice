const fs   = require('fs');
const path = require('path');
const { ArsipSurat } = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllArsipSurat = asyncHandler(async (req, res) => {
  const data = await ArsipSurat.findAll({ order: [['id', 'DESC']] });
  res.json({ success: true, data });
});

exports.createArsipSurat = asyncHandler(async (req, res) => {
  const { nomor_surat } = req.body;
  if (!req.file) throw createError(400, 'File surat harus diunggah');

  const arsip = await ArsipSurat.create({
    nomor_surat,
    file_url: `/api/academic/uploads/${req.file.filename}`,
  });
  res.status(201).json({ success: true, data: arsip });
});

exports.updateArsipSurat = asyncHandler(async (req, res) => {
  const { nomor_surat } = req.body;
  const arsip = await ArsipSurat.findByPk(req.params.id);
  if (!arsip) throw createError(404, 'Arsip surat tidak ditemukan');

  const updates = { nomor_surat };

  if (req.file) {
    // Hapus file lama dari disk jika ada
    if (arsip.file_url) {
      const oldPath = path.join(__dirname, '../../', arsip.file_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    updates.file_url = `/api/academic/uploads/${req.file.filename}`;
  }

  await arsip.update(updates);
  res.json({ success: true, data: arsip });
});

exports.deleteArsipSurat = asyncHandler(async (req, res) => {
  const arsip = await ArsipSurat.findByPk(req.params.id);
  if (!arsip) throw createError(404, 'Arsip surat tidak ditemukan');

  // Hapus file fisik
  if (arsip.file_url) {
    const filePath = path.join(__dirname, '../../', arsip.file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await arsip.destroy();
  res.json({ success: true, message: 'Arsip surat beserta file berhasil dihapus' });
});

exports.previewArsipSurat = asyncHandler(async (req, res) => {
  const arsip = await ArsipSurat.findByPk(req.params.id);
  if (!arsip) throw createError(404, 'Dokumen tidak ditemukan');

  if (!arsip.file_url) throw createError(404, 'File tidak ditemukan di server');

  const filePath = path.join(__dirname, '../../uploads', path.basename(arsip.file_url));
  if (!fs.existsSync(filePath)) throw createError(404, 'File tidak ditemukan di server');

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.pdf':  'application/pdf',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.gif':  'image/gif',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  res.set('Content-Type', mimeMap[ext] || 'application/octet-stream');
  res.set('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
  fs.createReadStream(filePath).pipe(res);
});