const db = require('../config/db');
const axios = require('axios');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const getSiswaFromAcademic = async (kelas_id, authToken) => {
  try {
    const url  = `http://academic-service:3003/api/academic/siswa${kelas_id ? `?kelas_id=${kelas_id}` : ''}`;
    const resp = await axios.get(url, { headers: authToken ? { Authorization: authToken } : {}, timeout: 5000 });
    const data = resp.data;
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error('[getSiswaFromAcademic]', err.message);
    return [];
  }
};

const getKelasFromAcademic = async (authToken) => {
  try {
    const resp = await axios.get('http://academic-service:3003/api/academic/kelas', {
      headers: authToken ? { Authorization: authToken } : {},
      timeout: 5000,
    });
    const data = resp.data;
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error('[getKelasFromAcademic]', err.message);
    return [];
  }
};

// ── LOKASI PKL ────────────────────────────────────────────────────────────

exports.getAllLokasiPKL = asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM laporan_lokasi_pkl ORDER BY created_at DESC, id ASC');
  res.json({ success: true, data: result.rows });
});

exports.createLokasiPKL = asyncHandler(async (req, res) => {
  const { siswa_id, nama_siswa, nama_perusahaan, alamat, posisi,
          deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal } = req.body;
  if (!nama_perusahaan) throw createError(400, 'nama_perusahaan wajib diisi');

  let foto_url = null;
  if (req.file) foto_url = `/api/vocational/uploads/${req.file.filename}`;

  const result = await db.query(
    `INSERT INTO laporan_lokasi_pkl
       (siswa_id, nama_siswa, nama_perusahaan, alamat, posisi,
        deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal, foto_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [siswa_id ? String(siswa_id) : null, nama_siswa || null, nama_perusahaan,
     alamat || null, posisi || null, deskripsi_pekerjaan || null,
     pembimbing_industri || null, kontak_pembimbing || null,
     tanggal || new Date().toISOString().slice(0, 10), foto_url]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

exports.updateLokasiPKL = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama_siswa, nama_perusahaan, alamat, posisi,
          deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal } = req.body;
  if (!nama_perusahaan) throw createError(400, 'nama_perusahaan wajib diisi');

  let foto_url = req.body.foto_url || null;
  if (req.file) foto_url = `/api/vocational/uploads/${req.file.filename}`;

  const result = await db.query(
    `UPDATE laporan_lokasi_pkl SET
       nama_siswa=$1, nama_perusahaan=$2, alamat=$3, posisi=$4,
       deskripsi_pekerjaan=$5, pembimbing_industri=$6, kontak_pembimbing=$7,
       tanggal=$8, foto_url=COALESCE($9, foto_url)
     WHERE id=$10 RETURNING *`,
    [nama_siswa, nama_perusahaan, alamat, posisi, deskripsi_pekerjaan,
     pembimbing_industri, kontak_pembimbing, tanggal, foto_url, id]
  );
  if (!result.rowCount) throw createError(404, 'Data PKL tidak ditemukan');
  res.json({ success: true, data: result.rows[0] });
});

exports.deleteLokasiPKL = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM laporan_lokasi_pkl WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) throw createError(404, 'Data PKL tidak ditemukan');
  res.json({ success: true, message: 'Data berhasil dihapus' });
});

// ── PROGRES PKL ───────────────────────────────────────────────────────────

exports.getAllProgresPKL = asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM laporan_progres_pkl ORDER BY siswa_id, minggu_ke ASC');
  res.json({ success: true, data: result.rows });
});

exports.createProgresPKL = asyncHandler(async (req, res) => {
  const { siswa_id, minggu_ke, deskripsi } = req.body;
  if (!siswa_id || !minggu_ke) throw createError(400, 'siswa_id dan minggu_ke wajib diisi');

  const result = await db.query(
    'INSERT INTO laporan_progres_pkl (siswa_id, minggu_ke, deskripsi) VALUES ($1,$2,$3) RETURNING *',
    [siswa_id, minggu_ke, deskripsi || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

exports.updateProgresPKL = asyncHandler(async (req, res) => {
  const { minggu_ke, deskripsi } = req.body;
  if (!minggu_ke) throw createError(400, 'minggu_ke wajib diisi');

  const result = await db.query(
    'UPDATE laporan_progres_pkl SET minggu_ke=$1, deskripsi=$2 WHERE id=$3 RETURNING *',
    [minggu_ke, deskripsi, req.params.id]
  );
  if (!result.rowCount) throw createError(404, 'Data progres tidak ditemukan');
  res.json({ success: true, data: result.rows[0] });
});

exports.deleteProgresPKL = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM laporan_progres_pkl WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) throw createError(404, 'Data progres tidak ditemukan');
  res.json({ success: true, message: 'Data progres berhasil dihapus' });
});

// ── NILAI PKL ─────────────────────────────────────────────────────────────

exports.getNilaiPKL = asyncHandler(async (req, res) => {
  const { kelas_id, siswa_id } = req.query;
  let query  = 'SELECT n.* FROM nilai_pkl n WHERE 1=1';
  const params = [];
  let idx = 1;
  if (kelas_id) { query += ` AND n.kelas_id = $${idx++}`; params.push(kelas_id); }
  if (siswa_id) { query += ` AND n.siswa_id = $${idx++}`; params.push(siswa_id); }
  query += ' ORDER BY n.siswa_id ASC';

  const nilaiRows = (await db.query(query, params)).rows;

  let siswaList = [];
  if (kelas_id) siswaList = await getSiswaFromAcademic(kelas_id, req.headers['authorization']);

  const merged = nilaiRows.map(n => {
    const siswa = siswaList.find(s => String(s.id) === String(n.siswa_id));
    return { ...n, nama_siswa: siswa?.nama_lengkap || n.nama_siswa || '-', nisn: siswa?.nisn || '-' };
  });

  res.json({ success: true, data: merged });
});

exports.saveNilaiPKLBulk = asyncHandler(async (req, res) => {
  const { kelas_id, nilai } = req.body;
  if (!Array.isArray(nilai) || !nilai.length) throw createError(400, 'Data nilai wajib diisi');

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const item of nilai) {
      const { siswa_id, nama_siswa, nilai_praktik, nilai_sikap, nilai_laporan } = item;
      if (!siswa_id) continue;
      const r = await client.query(
        `INSERT INTO nilai_pkl (siswa_id, kelas_id, nama_siswa, nilai_praktik, nilai_sikap, nilai_laporan)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (siswa_id, kelas_id)
         DO UPDATE SET nama_siswa=EXCLUDED.nama_siswa, nilai_praktik=EXCLUDED.nilai_praktik,
           nilai_sikap=EXCLUDED.nilai_sikap, nilai_laporan=EXCLUDED.nilai_laporan, updated_at=NOW()
         RETURNING *`,
        [siswa_id, kelas_id || null, nama_siswa || null,
         Number(nilai_praktik) || 0, Number(nilai_sikap) || 0, Number(nilai_laporan) || 0]
      );
      results.push(r.rows[0]);
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Nilai PKL berhasil disimpan', data: results });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

exports.deleteNilaiPKL = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM nilai_pkl WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) throw createError(404, 'Data nilai tidak ditemukan');
  res.json({ success: true, message: 'Nilai PKL berhasil dihapus' });
});

// ── PROXY SISWA & KELAS dari academic-service ─────────────────────────────

exports.getSiswaForVokasi = asyncHandler(async (req, res) => {
  const siswa = await getSiswaFromAcademic(req.query.kelas_id, req.headers['authorization']);
  res.json({ success: true, data: siswa });
});

exports.getKelasForVokasi = asyncHandler(async (req, res) => {
  const kelas = await getKelasFromAcademic(req.headers['authorization']);
  res.json({ success: true, data: kelas });
});