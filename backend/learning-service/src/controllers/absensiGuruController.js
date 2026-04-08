const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const normalizeRow = (row) => ({
  ...row,
  id_absensiGuru: row.id_absensiGuru ?? row.id_absensiguru ?? row.id,
  namaGuru:       row.namaGuru       ?? row.namaguru       ?? row.nama_guru    ?? '-',
  mataPelajaran:  row.mataPelajaran  ?? row.matapelajaran  ?? row.mata_pelajaran ?? '-',
  jamMasuk:       row.jamMasuk       ?? row.jammasuk       ?? row.jam_masuk    ?? null,
});

const getColNames = async () => {
  const res = await pool.query(`
    SELECT lower(column_name) AS col
    FROM information_schema.columns
    WHERE table_name = 'absensi_guru'
  `);
  return new Set(res.rows.map(r => r.col));
};

const buildSelect = (cols) => {
  const idCol    = cols.has('id_absensiguru') ? `id_absensiguru AS "id_absensiGuru"` : `id AS "id_absensiGuru"`;
  const namaCol  = cols.has('nama_guru')      ? `nama_guru AS "namaGuru"`            : cols.has('namaguru') ? `namaguru AS "namaGuru"` : `'' AS "namaGuru"`;
  const mapelCol = cols.has('mata_pelajaran') ? `mata_pelajaran AS "mataPelajaran"`  : cols.has('matapelajaran') ? `matapelajaran AS "mataPelajaran"` : `'-' AS "mataPelajaran"`;
  const jamCol   = cols.has('jam_masuk')      ? `jam_masuk AS "jamMasuk"`            : cols.has('jammasuk') ? `jammasuk AS "jamMasuk"` : `NULL AS "jamMasuk"`;
  return `${idCol}, user_id, ${namaCol}, ${mapelCol}, ${jamCol}, tanggal, foto, status, keterangan, created_at, updated_at`;
};

const buildInsertCols = (cols) => ({
  namaCol:   cols.has('nama_guru')      ? 'nama_guru'      : 'namaguru',
  mapelCol:  cols.has('mata_pelajaran') ? 'mata_pelajaran' : 'matapelajaran',
  jamCol:    cols.has('jam_masuk')      ? 'jam_masuk'      : 'jammasuk',
  idColPart: cols.has('id_absensiguru') ? ', id_absensiguru' : '',
});

exports.getAllAbsensiGuru = asyncHandler(async (req, res) => {
  const { user_id, tanggal, status } = req.query;
  const cols = await getColNames();
  const selectClause = buildSelect(cols);

  let query = `SELECT ${selectClause} FROM absensi_guru WHERE 1=1`;
  const params = [];
  let idx = 1;
  if (user_id) { query += ` AND user_id = $${idx++}`; params.push(user_id); }
  if (tanggal) { query += ` AND tanggal = $${idx++}`; params.push(tanggal); }
  if (status)  { query += ` AND status  = $${idx++}`; params.push(status); }

  const orderBy = cols.has('jam_masuk') ? 'jam_masuk' : cols.has('jammasuk') ? 'jammasuk' : 'created_at';
  query += ` ORDER BY ${orderBy} DESC NULLS LAST`;

  const result = await pool.query(query, params);
  res.json({ success: true, count: result.rows.length, data: result.rows });
});

exports.getAbsensiGuruById = asyncHandler(async (req, res) => {
  const cols = await getColNames();
  const selectClause = buildSelect(cols);
  const idWhere = cols.has('id_absensiguru') ? `id_absensiguru::text = $1` : `id::text = $1`;

  const result = await pool.query(
    `SELECT ${selectClause} FROM absensi_guru WHERE ${idWhere}`,
    [req.params.id]
  );
  if (!result.rows.length) throw createError(404, 'Absensi guru tidak ditemukan');
  res.json({ success: true, data: result.rows[0] });
});

exports.createAbsensiGuru = asyncHandler(async (req, res) => {
  const { user_id, namaGuru, mataPelajaran, keterangan = '', foto = null, status: statusOverride } = req.body;
  if (!user_id)  throw createError(400, 'Field user_id wajib diisi');
  if (!namaGuru) throw createError(400, 'Field namaGuru wajib diisi');

  const now     = new Date();
  const tanggal = now.toISOString().slice(0, 10);

  const existing = await pool.query(
    'SELECT 1 FROM absensi_guru WHERE user_id = $1 AND tanggal = $2',
    [user_id, tanggal]
  );
  if (existing.rows.length) throw createError(409, 'Anda sudah melakukan absensi hari ini');

  const isTerlambat = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 30);
  const status = statusOverride || (isTerlambat ? 'terlambat' : 'hadir');

  const cols = await getColNames();
  const { namaCol, mapelCol, jamCol, idColPart } = buildInsertCols(cols);
  const idValPart    = cols.has('id_absensiguru') ? ', gen_random_uuid()' : '';
  const selectClause = buildSelect(cols);

  const result = await pool.query(
    `INSERT INTO absensi_guru
       (user_id, ${namaCol}, ${mapelCol}, ${jamCol}, tanggal, foto, status, keterangan${idColPart})
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8${idValPart})
     RETURNING ${selectClause}`,
    [user_id, namaGuru, mataPelajaran || '-', now, tanggal, foto, status, keterangan]
  );
  res.status(201).json({ success: true, message: 'Absensi guru berhasil dicatat', data: result.rows[0] });
});

exports.updateAbsensiGuru = asyncHandler(async (req, res) => {
  const { status, keterangan, foto } = req.body;
  const updates = [];
  const params  = [];
  let idx = 1;

  if (status     !== undefined) { updates.push(`status = $${idx++}`);     params.push(status); }
  if (keterangan !== undefined) { updates.push(`keterangan = $${idx++}`); params.push(keterangan); }
  if (foto       !== undefined) { updates.push(`foto = $${idx++}`);       params.push(foto); }
  if (!updates.length) throw createError(400, 'Tidak ada field yang akan diupdate');

  updates.push('updated_at = NOW()');
  params.push(req.params.id);

  const cols    = await getColNames();
  const idWhere = cols.has('id_absensiguru') ? `id_absensiguru::text = $${idx}` : `id::text = $${idx}`;
  const selectClause = buildSelect(cols);

  const result = await pool.query(
    `UPDATE absensi_guru SET ${updates.join(', ')} WHERE ${idWhere} RETURNING ${selectClause}`,
    params
  );
  if (!result.rowCount) throw createError(404, 'Absensi guru tidak ditemukan');
  res.json({ success: true, message: 'Absensi guru berhasil diperbarui', data: result.rows[0] });
});

exports.deleteAbsensiGuru = asyncHandler(async (req, res) => {
  const cols    = await getColNames();
  const idWhere = cols.has('id_absensiguru') ? `id_absensiguru::text = $1` : `id::text = $1`;

  const result = await pool.query(
    `DELETE FROM absensi_guru WHERE ${idWhere} RETURNING *`,
    [req.params.id]
  );
  if (!result.rowCount) throw createError(404, 'Absensi guru tidak ditemukan');
  res.json({ success: true, message: 'Absensi guru berhasil dihapus' });
});