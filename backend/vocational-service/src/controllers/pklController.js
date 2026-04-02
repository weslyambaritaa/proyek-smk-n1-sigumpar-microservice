const db = require('../config/db');

// ── LOKASI PKL ────────────────────────────────────────────────────────────

exports.getAllLokasiPKL = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM laporan_lokasi_pkl ORDER BY created_at DESC, id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getAllLokasiPKL]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createLokasiPKL = async (req, res) => {
  const {
    siswa_id, nama_siswa, nama_perusahaan, alamat, posisi,
    deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal
  } = req.body;

  let foto_url = null;
  if (req.file) foto_url = `/uploads/${req.file.filename}`;

  if (!nama_perusahaan) {
    return res.status(400).json({ error: 'nama_perusahaan wajib diisi' });
  }

  try {
    const result = await db.query(
      `INSERT INTO laporan_lokasi_pkl
       (siswa_id, nama_siswa, nama_perusahaan, alamat, posisi,
        deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        siswa_id || null, nama_siswa || null, nama_perusahaan,
        alamat || null, posisi || null, deskripsi_pekerjaan || null,
        pembimbing_industri || null, kontak_pembimbing || null,
        tanggal || new Date().toISOString().slice(0,10), foto_url
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[createLokasiPKL]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateLokasiPKL = async (req, res) => {
  const { id } = req.params;
  const {
    nama_siswa, nama_perusahaan, alamat, posisi,
    deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal
  } = req.body;
  let foto_url = req.body.foto_url || null;
  if (req.file) foto_url = `/uploads/${req.file.filename}`;

  try {
    const result = await db.query(
      `UPDATE laporan_lokasi_pkl SET
        nama_siswa=$1, nama_perusahaan=$2, alamat=$3, posisi=$4,
        deskripsi_pekerjaan=$5, pembimbing_industri=$6, kontak_pembimbing=$7,
        tanggal=$8, foto_url=COALESCE($9, foto_url)
       WHERE id=$10 RETURNING *`,
      [nama_siswa, nama_perusahaan, alamat, posisi,
       deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing,
       tanggal, foto_url, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLokasiPKL = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM laporan_lokasi_pkl WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PROGRES PKL ───────────────────────────────────────────────────────────

exports.getAllProgresPKL = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM laporan_progres_pkl ORDER BY siswa_id, minggu_ke ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProgresPKL = async (req, res) => {
  const { siswa_id, minggu_ke, deskripsi } = req.body;
  if (!siswa_id || !minggu_ke) return res.status(400).json({ error: 'siswa_id dan minggu_ke wajib diisi' });
  try {
    const result = await db.query(
      'INSERT INTO laporan_progres_pkl (siswa_id, minggu_ke, deskripsi) VALUES ($1, $2, $3) RETURNING *',
      [siswa_id, minggu_ke, deskripsi || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProgresPKL = async (req, res) => {
  const { id } = req.params;
  const { minggu_ke, deskripsi } = req.body;
  try {
    const result = await db.query(
      'UPDATE laporan_progres_pkl SET minggu_ke=$1, deskripsi=$2 WHERE id=$3 RETURNING *',
      [minggu_ke, deskripsi, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProgresPKL = async (req, res) => {
  try {
    await db.query('DELETE FROM laporan_progres_pkl WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── NILAI PKL ─────────────────────────────────────────────────────────────

exports.getNilaiPKL = async (req, res) => {
  try {
    const { kelas_id, siswa_id } = req.query;
    let query = `
      SELECT n.*, s.nama_lengkap AS nama_siswa, k.nama_kelas
      FROM nilai_pkl n
      LEFT JOIN laporan_lokasi_pkl l ON n.siswa_id = l.siswa_id
      LEFT JOIN kelas_pramuka k ON n.kelas_id = k.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (kelas_id) { query += ` AND n.kelas_id = $${idx++}`; params.push(kelas_id); }
    if (siswa_id) { query += ` AND n.siswa_id = $${idx++}`; params.push(siswa_id); }
    query += ' ORDER BY n.siswa_id ASC';
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveNilaiPKLBulk = async (req, res) => {
  const { kelas_id, nilai } = req.body;
  if (!Array.isArray(nilai) || nilai.length === 0) {
    return res.status(400).json({ error: 'Data nilai wajib diisi' });
  }
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const item of nilai) {
      const { siswa_id, nilai_praktik, nilai_sikap, nilai_laporan } = item;
      if (!siswa_id) continue;
      const r = await client.query(
        `INSERT INTO nilai_pkl (siswa_id, kelas_id, nilai_praktik, nilai_sikap, nilai_laporan)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (siswa_id, kelas_id)
         DO UPDATE SET
           nilai_praktik = EXCLUDED.nilai_praktik,
           nilai_sikap   = EXCLUDED.nilai_sikap,
           nilai_laporan = EXCLUDED.nilai_laporan,
           updated_at    = NOW()
         RETURNING *`,
        [siswa_id, kelas_id || null, Number(nilai_praktik) || 0, Number(nilai_sikap) || 0, Number(nilai_laporan) || 0]
      );
      results.push(r.rows[0]);
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Nilai PKL berhasil disimpan', data: results });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.deleteNilaiPKL = async (req, res) => {
  try {
    await db.query('DELETE FROM nilai_pkl WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
