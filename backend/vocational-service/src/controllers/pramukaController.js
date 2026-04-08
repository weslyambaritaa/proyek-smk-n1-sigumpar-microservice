const db = require('../config/db');
const multer = require('multer');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

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

// ── REGU ──────────────────────────────────────────────────────────────────

exports.getAllRegu = asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM kelas_pramuka ORDER BY id ASC');
  res.json({ success: true, data: result.rows });
});

exports.createRegu = asyncHandler(async (req, res) => {
  const { nama_regu } = req.body;
  if (!nama_regu) throw createError(400, 'nama_regu wajib diisi');
  const result = await db.query('INSERT INTO kelas_pramuka (nama_regu) VALUES ($1) RETURNING *', [nama_regu]);
  res.status(201).json({ success: true, data: result.rows[0] });
});

exports.deleteRegu = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM kelas_pramuka WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) throw createError(404, 'Regu tidak ditemukan');
  res.json({ success: true, message: 'Regu berhasil dihapus' });
});

// ── ANGGOTA REGU ──────────────────────────────────────────────────────────

exports.getSiswaTersedia = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: [] });
});

exports.assignSiswaToRegu = asyncHandler(async (req, res) => {
  const { regu_id, siswa_id, nama_lengkap } = req.body;
  if (!regu_id || !siswa_id) throw createError(400, 'regu_id dan siswa_id wajib diisi');
  const result = await db.query(
    'INSERT INTO anggota_regu (regu_id, siswa_id, nama_lengkap) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING *',
    [regu_id, siswa_id, nama_lengkap || '']
  );
  res.status(201).json({ success: true, data: result.rows[0] || { message: 'Sudah ada' } });
});

exports.getSiswaByRegu = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM anggota_regu WHERE regu_id=$1 ORDER BY nama_lengkap ASC',
    [req.params.regu_id]
  );
  res.json({ success: true, data: result.rows });
});

// ── ABSENSI PRAMUKA ───────────────────────────────────────────────────────

exports.submitAbsensiPramuka = asyncHandler(async (req, res) => {
  const { kelas_id, regu_id, tanggal, deskripsi, file_url, data_absensi } = req.body;
  const kelasOrRegu = kelas_id || regu_id;
  if (!kelasOrRegu || !tanggal || !Array.isArray(data_absensi)) {
    throw createError(400, 'kelas_id, tanggal, dan data_absensi wajib diisi');
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO laporan_pramuka (regu_id, tanggal, deskripsi, file_url) VALUES ($1,$2,$3,$4)',
      [kelasOrRegu, tanggal, deskripsi || '', file_url || '']
    );
    for (const item of data_absensi) {
      const { siswa_id, nama_lengkap, status } = item;
      if (!siswa_id) continue;
      await client.query(
        `INSERT INTO absensi_pramuka (regu_id, siswa_id, tanggal, status, nama_lengkap, kelas_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (regu_id, siswa_id, tanggal)
         DO UPDATE SET status=EXCLUDED.status, nama_lengkap=EXCLUDED.nama_lengkap`,
        [kelasOrRegu, siswa_id, tanggal, status || 'Hadir', nama_lengkap || '', kelas_id || kelasOrRegu]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Absensi pramuka berhasil disimpan' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

exports.getAbsensiPramuka = asyncHandler(async (req, res) => {
  const { regu_id, kelas_id, tanggal, tanggal_mulai, tanggal_akhir } = req.query;
  const kelasFilter = kelas_id || regu_id;
  let query = 'SELECT ap.*, ap.nama_lengkap FROM absensi_pramuka ap WHERE 1=1';
  const params = [];
  let idx = 1;
  if (kelasFilter)   { query += ` AND ap.regu_id = $${idx++}`;   params.push(kelasFilter); }
  if (tanggal)       { query += ` AND ap.tanggal = $${idx++}`;   params.push(tanggal); }
  if (tanggal_mulai) { query += ` AND ap.tanggal >= $${idx++}`;  params.push(tanggal_mulai); }
  if (tanggal_akhir) { query += ` AND ap.tanggal <= $${idx++}`;  params.push(tanggal_akhir); }
  query += ' ORDER BY ap.tanggal DESC, ap.id ASC';
  const result = await db.query(query, params);
  res.json({ success: true, data: result.rows });
});

exports.getRekapAbsensiPramuka = asyncHandler(async (req, res) => {
  const { tanggal_mulai, tanggal_akhir, regu_id } = req.query;
  let query = `
    SELECT ar.siswa_id, ar.nama_lengkap, k.nama_regu,
      COUNT(CASE WHEN ap.status='Hadir' THEN 1 END) AS hadir,
      COUNT(CASE WHEN ap.status='Izin'  THEN 1 END) AS izin,
      COUNT(CASE WHEN ap.status='Sakit' THEN 1 END) AS sakit,
      COUNT(CASE WHEN ap.status='Alpa'  THEN 1 END) AS alpa,
      COUNT(ap.id) AS total
    FROM anggota_regu ar
    JOIN kelas_pramuka k ON ar.regu_id = k.id
    LEFT JOIN absensi_pramuka ap ON ap.siswa_id = ar.siswa_id AND ap.regu_id = ar.regu_id
      AND ($1::DATE IS NULL OR ap.tanggal >= $1)
      AND ($2::DATE IS NULL OR ap.tanggal <= $2)
    WHERE 1=1`;
  const params = [tanggal_mulai || null, tanggal_akhir || null];
  let idx = 3;
  if (regu_id) { query += ` AND ar.regu_id = $${idx++}`; params.push(regu_id); }
  query += ' GROUP BY ar.siswa_id, ar.nama_lengkap, k.nama_regu ORDER BY k.nama_regu, ar.nama_lengkap';
  const result = await db.query(query, params);
  res.json({ success: true, data: result.rows });
});

// ── SILABUS PRAMUKA ───────────────────────────────────────────────────────

exports.getAllSilabus = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, tingkat_kelas, judul_kegiatan, tanggal, file_nama, file_mime,
            to_char(created_at,'YYYY-MM-DD') AS created_at
     FROM silabus_pramuka ORDER BY tanggal DESC, id DESC`
  );
  res.json({ success: true, data: result.rows });
});

exports.createSilabus = asyncHandler(async (req, res) => {
  try {
    await runMulter('file')(req, res);
  } catch (err) {
    throw createError(400, err.message);
  }
  const { tingkat_kelas, judul_kegiatan, tanggal } = req.body;
  if (!judul_kegiatan) throw createError(400, 'judul_kegiatan wajib diisi');

  const result = await db.query(
    `INSERT INTO silabus_pramuka (tingkat_kelas, judul_kegiatan, tanggal, file_data, file_mime, file_nama)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, tingkat_kelas, judul_kegiatan, tanggal, file_nama, file_mime,
               to_char(created_at,'YYYY-MM-DD') AS created_at`,
    [tingkat_kelas || null, judul_kegiatan,
     tanggal || new Date().toISOString().slice(0, 10),
     req.file?.buffer || null, req.file?.mimetype || null, req.file?.originalname || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

exports.downloadSilabus = asyncHandler(async (req, res) => {
  const isView = req.path.endsWith('/view');
  const result = await db.query('SELECT file_nama, file_data, file_mime FROM silabus_pramuka WHERE id=$1', [req.params.id]);
  if (!result.rows.length) throw createError(404, 'Silabus tidak ditemukan');
  const doc = result.rows[0];
  if (!doc.file_data) throw createError(404, 'File tidak tersedia');
  const mime = doc.file_mime || 'application/octet-stream';
  const inlineTypes = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','application/pdf'];
  res.set('Content-Type', mime);
  res.set('Content-Disposition', `${isView && inlineTypes.includes(mime) ? 'inline' : 'attachment'}; filename="${doc.file_nama}"`);
  res.send(doc.file_data);
});

exports.deleteSilabus = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM silabus_pramuka WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) throw createError(404, 'Silabus tidak ditemukan');
  res.json({ success: true, message: 'Silabus berhasil dihapus' });
});

// ── LAPORAN KEGIATAN PRAMUKA ──────────────────────────────────────────────

exports.getAllLaporanKegiatan = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, judul, deskripsi, tanggal, file_nama, file_mime,
            to_char(created_at,'YYYY-MM-DD') AS created_at
     FROM laporan_kegiatan ORDER BY tanggal DESC, id DESC`
  );
  res.json({ success: true, data: result.rows });
});

exports.createLaporanKegiatan = asyncHandler(async (req, res) => {
  try {
    await runMulter('file_laporan')(req, res);
  } catch (err) {
    throw createError(400, err.message);
  }
  const { judul, deskripsi, tanggal } = req.body;
  if (!judul) throw createError(400, 'judul wajib diisi');

  const result = await db.query(
    `INSERT INTO laporan_kegiatan (judul, deskripsi, tanggal, file_data, file_mime, file_nama)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, judul, deskripsi, tanggal, file_nama, file_mime,
               to_char(created_at,'YYYY-MM-DD') AS created_at`,
    [judul, deskripsi || '',
     tanggal || new Date().toISOString().slice(0, 10),
     req.file?.buffer || null, req.file?.mimetype || null, req.file?.originalname || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

exports.downloadLaporanKegiatan = asyncHandler(async (req, res) => {
  const isView = req.path.endsWith('/view');
  const result = await db.query('SELECT file_nama, file_data, file_mime FROM laporan_kegiatan WHERE id=$1', [req.params.id]);
  if (!result.rows.length) throw createError(404, 'Laporan tidak ditemukan');
  const doc = result.rows[0];
  if (!doc.file_data) throw createError(404, 'File tidak tersedia');
  const mime = doc.file_mime || 'application/octet-stream';
  const inlineTypes = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','application/pdf'];
  res.set('Content-Type', mime);
  res.set('Content-Disposition', `${isView && inlineTypes.includes(mime) ? 'inline' : 'attachment'}; filename="${doc.file_nama}"`);
  res.send(doc.file_data);
});

exports.deleteLaporanKegiatan = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM laporan_kegiatan WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) throw createError(404, 'Laporan tidak ditemukan');
  res.json({ success: true, message: 'Laporan berhasil dihapus' });
});