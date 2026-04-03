const pool = require('../config/db');
const { createError } = require('../middleware/errorHandler');

const validStatuses = ['hadir', 'sakit', 'izin', 'alpa', 'terlambat'];
const isValidDate = (dateString) => /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !Number.isNaN(new Date(dateString).getTime());

const normalizeRow = (row) => ({
  ...row,
  namasiswa: row.nama_lengkap,
  nis: row.nisn,
});

exports.createAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { siswa_id, tanggal, status, keterangan, mapel_id = null } = req.body;
    if (!siswa_id || !tanggal || !status) throw createError(400, 'Field siswa_id, tanggal, dan status wajib diisi');
    if (!isValidDate(tanggal)) throw createError(400, 'Format tanggal harus YYYY-MM-DD');
    if (!validStatuses.includes(status)) throw createError(400, 'Status absensi tidak valid');

    const siswaCheck = await client.query('SELECT id FROM siswa WHERE id = $1', [siswa_id]);
    if (!siswaCheck.rows.length) throw createError(404, 'Siswa tidak ditemukan');

    const result = await client.query(
      `INSERT INTO absensi_siswa (siswa_id, tanggal, status, keterangan, mapel_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [siswa_id, tanggal, status, keterangan || null, mapel_id],
    );

    res.status(201).json({ success: true, message: 'Absensi siswa berhasil dibuat', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      next(createError(409, 'Absensi untuk siswa, tanggal, dan mapel ini sudah ada'));
    } else {
      next(error);
    }
  } finally {
    client.release();
  }
};

exports.getAllAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { siswa_id, tanggal, status, mapel_id, kelas_id } = req.query;
    let query = `
      SELECT a.*, s.nisn, s.nama_lengkap, s.kelas_id, k.nama_kelas, m.nama_mapel
      FROM absensi_siswa a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN mata_pelajaran m ON a.mapel_id = m.id
      WHERE 1=1`;
    const values = [];
    let i = 1;
    if (siswa_id) { query += ` AND a.siswa_id = $${i++}`; values.push(siswa_id); }
    if (tanggal) { query += ` AND a.tanggal = $${i++}`; values.push(tanggal); }
    if (status) { query += ` AND a.status = $${i++}`; values.push(status); }
    if (mapel_id) { query += ` AND a.mapel_id = $${i++}`; values.push(mapel_id); }
    if (kelas_id) { query += ` AND s.kelas_id = $${i++}`; values.push(kelas_id); }
    query += ' ORDER BY a.tanggal DESC, s.nama_lengkap ASC';
    const result = await client.query(query, values);
    res.json({ success: true, count: result.rows.length, data: result.rows.map(normalizeRow) });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

exports.getAbsensiSiswaById = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const result = await client.query(`
      SELECT a.*, s.nisn, s.nama_lengkap, s.kelas_id, k.nama_kelas, m.nama_mapel
      FROM absensi_siswa a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN mata_pelajaran m ON a.mapel_id = m.id
      WHERE a.id = $1`, [id]);
    if (!result.rows.length) throw createError(404, 'Absensi siswa tidak ditemukan');
    res.json({ success: true, data: normalizeRow(result.rows[0]) });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

exports.updateAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;
    if (!status && keterangan === undefined) throw createError(400, 'Tidak ada field yang akan diupdate');
    if (status && !validStatuses.includes(status)) throw createError(400, 'Status absensi tidak valid');
    const check = await client.query('SELECT id FROM absensi_siswa WHERE id = $1', [id]);
    if (!check.rows.length) throw createError(404, 'Absensi siswa tidak ditemukan');
    let fields = []; let values = []; let i = 1;
    if (status) { fields.push(`status = $${i++}`); values.push(status); }
    if (keterangan !== undefined) { fields.push(`keterangan = $${i++}`); values.push(keterangan); }
    values.push(id);
    const result = await client.query(`UPDATE absensi_siswa SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, values);
    res.json({ success: true, message: 'Absensi siswa berhasil diperbarui', data: result.rows[0] });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

exports.deleteAbsensiSiswa = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const result = await client.query('DELETE FROM absensi_siswa WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) throw createError(404, 'Absensi siswa tidak ditemukan');
    res.json({ success: true, message: 'Absensi siswa berhasil dihapus' });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};
