const multer = require('multer');
const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ── Upload multer (memory storage — file disimpan sebagai BYTEA di DB) ────
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

  let query, params;

  if (kepsek) {
    query = `
      SELECT p.id, p.guru_id,
        COALESCE(p.nama_guru, p.guru_id::text) AS nama_guru,
        p.nama_dokumen, p.jenis_dokumen, p.file_name, p.file_mime,
        COALESCE(p.status_review, 'menunggu') AS status_review,
        p.catatan_review, p.reviewed_by, p.reviewed_at,
        COALESCE(p.versi, 1) AS versi, p.parent_id,
        to_char(p.tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload,
        (SELECT COUNT(*) FROM perangkat_pembelajaran r
         WHERE r.parent_id = COALESCE(p.parent_id, p.id) OR r.id = COALESCE(p.parent_id, p.id)
        )::int AS total_versi
      FROM perangkat_pembelajaran p WHERE 1=1`;
    params = [];
    let idx = 1;
    if (status_review)  { query += ` AND COALESCE(p.status_review,'menunggu') = $${idx++}`; params.push(status_review); }
    if (jenis_dokumen)  { query += ` AND p.jenis_dokumen = $${idx++}`; params.push(jenis_dokumen); }
    if (search)         { query += ` AND (p.nama_dokumen ILIKE $${idx} OR COALESCE(p.nama_guru,'') ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
    query += ' ORDER BY p.tanggal_upload DESC, p.id DESC';
  } else {
    query = `
      SELECT id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
        COALESCE(status_review, 'menunggu') AS status_review,
        catatan_review, reviewed_at, COALESCE(versi, 1) AS versi, parent_id,
        to_char(tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload
      FROM perangkat_pembelajaran
      WHERE ($1::uuid IS NULL OR guru_id = $1)
      ORDER BY tanggal_upload DESC, id DESC`;
    params = [guruId || null];
  }

  const result = await pool.query(query, params);
  res.json({ success: true, count: result.rows.length, data: result.rows });
});

exports.uploadPerangkat = asyncHandler(async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;
  if (!guruId) throw createError(401, 'Identitas guru tidak ditemukan');

  try {
    await runMulter(req, res);
  } catch (err) {
    throw createError(400, err.message);
  }

  const { nama_dokumen, jenis_dokumen, parent_id, nama_guru } = req.body;
  if (!nama_dokumen || !jenis_dokumen) throw createError(400, 'nama_dokumen dan jenis_dokumen wajib diisi');
  if (!req.file) throw createError(400, 'File wajib diunggah (PDF/DOCX)');

  let versi = 1;
  const resolvedParentId = parent_id ? parseInt(parent_id) : null;
  if (resolvedParentId) {
    const vRes = await pool.query(
      `SELECT COALESCE(MAX(versi), 1) + 1 AS next_versi FROM perangkat_pembelajaran WHERE parent_id = $1 OR id = $1`,
      [resolvedParentId]
    );
    versi = vRes.rows[0]?.next_versi || 2;
  }

  const result = await pool.query(
    `INSERT INTO perangkat_pembelajaran
       (guru_id, nama_dokumen, jenis_dokumen, file_name, file_data, file_mime, status_review, versi, parent_id, nama_guru)
     VALUES ($1, $2, $3, $4, $5, $6, 'menunggu', $7, $8, $9)
     RETURNING id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
               status_review, versi, parent_id, nama_guru,
               to_char(tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload`,
    [guruId, nama_dokumen.trim(), jenis_dokumen, req.file.originalname,
     req.file.buffer, req.file.mimetype, versi, resolvedParentId,
     nama_guru || user?.name || user?.preferred_username || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

exports.downloadPerangkat = asyncHandler(async (req, res) => {
  const isView = req.path.endsWith('/view');
  const result = await pool.query(
    'SELECT file_name, file_data, file_mime FROM perangkat_pembelajaran WHERE id = $1',
    [req.params.id]
  );
  if (!result.rows.length) throw createError(404, 'Dokumen tidak ditemukan');

  const doc  = result.rows[0];
  const mime = doc.file_mime || 'application/octet-stream';
  res.set('Content-Type', mime);
  res.set('Content-Disposition', `${isView ? 'inline' : 'attachment'}; filename="${doc.file_name}"`);
  res.send(doc.file_data);
});

exports.deletePerangkat = asyncHandler(async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;
  const kepsek = isKepsek(user);

  const check = await pool.query('SELECT guru_id FROM perangkat_pembelajaran WHERE id = $1', [req.params.id]);
  if (!check.rows.length) throw createError(404, 'Dokumen tidak ditemukan');
  if (!kepsek && guruId && String(check.rows[0].guru_id) !== String(guruId)) {
    throw createError(403, 'Akses ditolak');
  }

  await pool.query('DELETE FROM perangkat_pembelajaran WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Dokumen berhasil dihapus' });
});

exports.reviewPerangkat = asyncHandler(async (req, res) => {
  const user   = req.user;
  if (!isKepsek(user)) throw createError(403, 'Hanya kepala sekolah yang dapat mereview dokumen');

  const { status, catatan } = req.body;
  const allowedStatus = ['disetujui', 'revisi', 'ditolak'];
  if (!status || !allowedStatus.includes(status)) {
    throw createError(400, `Status harus salah satu dari: ${allowedStatus.join(', ')}`);
  }

  const kepsekNama = user?.name || user?.preferred_username || 'Kepala Sekolah';
  const kepsekId   = user?.sub || user?.id || null;

  const result = await pool.query(
    `UPDATE perangkat_pembelajaran
     SET status_review=$1, catatan_review=$2, reviewed_by=$3, reviewed_at=NOW()
     WHERE id=$4
     RETURNING id, nama_dokumen, jenis_dokumen, status_review, catatan_review,
               reviewed_by, reviewed_at, guru_id, nama_guru, versi`,
    [status, catatan || null, kepsekNama, req.params.id]
  );
  if (!result.rowCount) throw createError(404, 'Dokumen tidak ditemukan');

  // Simpan riwayat — abaikan error jika kolom belum ada
  await pool.query(
    `INSERT INTO review_kepsek (perangkat_id, status, komentar, kepsek_id, kepsek_nama, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT DO NOTHING`,
    [req.params.id, status, catatan || null, kepsekId, kepsekNama]
  ).catch((e) => console.warn('[review_kepsek insert]', e.message));

  res.json({ success: true, data: result.rows[0] });
});

exports.getRiwayatReview = asyncHandler(async (req, res) => {
  const docRes = await pool.query('SELECT id, parent_id FROM perangkat_pembelajaran WHERE id = $1', [req.params.id]);
  if (!docRes.rows.length) throw createError(404, 'Dokumen tidak ditemukan');

  const rootId  = docRes.rows[0].parent_id || req.params.id;
  const versiRes = await pool.query(
    'SELECT id FROM perangkat_pembelajaran WHERE id = $1 OR parent_id = $1 ORDER BY versi ASC',
    [rootId]
  );
  const allIds = versiRes.rows.map(r => r.id);

  const result = await pool.query(
    `SELECT r.*, p.nama_dokumen, p.jenis_dokumen, p.versi, p.file_name
     FROM review_kepsek r
     JOIN perangkat_pembelajaran p ON r.perangkat_id = p.id
     WHERE r.perangkat_id = ANY($1) ORDER BY r.created_at DESC`,
    [allIds]
  );
  res.json({ success: true, data: result.rows });
});

exports.getVersiDokumen = asyncHandler(async (req, res) => {
  const docRes = await pool.query('SELECT id, parent_id FROM perangkat_pembelajaran WHERE id = $1', [req.params.id]);
  if (!docRes.rows.length) throw createError(404, 'Dokumen tidak ditemukan');

  const rootId = docRes.rows[0].parent_id || req.params.id;
  const result = await pool.query(
    `SELECT id, nama_dokumen, jenis_dokumen, file_name, file_mime,
            COALESCE(status_review,'menunggu') AS status_review,
            catatan_review, reviewed_by, reviewed_at,
            COALESCE(versi,1) AS versi, parent_id, nama_guru,
            to_char(tanggal_upload,'YYYY-MM-DD HH24:MI') AS tanggal_upload
     FROM perangkat_pembelajaran
     WHERE id = $1 OR parent_id = $1 ORDER BY versi ASC`,
    [rootId]
  );
  res.json({ success: true, data: result.rows });
});