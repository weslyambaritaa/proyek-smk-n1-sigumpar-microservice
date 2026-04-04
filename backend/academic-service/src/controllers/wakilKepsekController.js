const pool = require('../config/db');

// ─── PENGECEKAN PERANGKAT PEMBELAJARAN ───────────────────────────────────────

/**
 * GET /api/academic/wakil/perangkat-guru
 * Daftar semua guru beserta status kelengkapan perangkat pembelajaran mereka
 */
exports.getDaftarGuruPerangkat = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        g.id,
        g.nip,
        g.nama_lengkap,
        g.mata_pelajaran,
        g.jabatan,
        COUNT(wp.id) AS total_perangkat,
        COUNT(wp.id) FILTER (WHERE wp.status = 'lengkap') AS perangkat_lengkap,
        COUNT(wp.id) FILTER (WHERE wp.status = 'belum_lengkap') AS perangkat_belum_lengkap
      FROM guru g
      LEFT JOIN wakil_perangkat_pembelajaran wp ON g.id = wp.guru_id
      WHERE g.jabatan NOT IN ('Kepala Sekolah', 'Wakil Kepala Sekolah') OR g.jabatan IS NULL
      GROUP BY g.id, g.nip, g.nama_lengkap, g.mata_pelajaran, g.jabatan
      ORDER BY g.nama_lengkap ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getDaftarGuruPerangkat]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/academic/wakil/perangkat-guru/:guruId
 * Detail perangkat pembelajaran satu guru
 */
exports.getPerangkatByGuru = async (req, res) => {
  const { guruId } = req.params;
  try {
    const [guruRes, perangkatRes] = await Promise.all([
      pool.query('SELECT id, nip, nama_lengkap, mata_pelajaran, jabatan FROM guru WHERE id = $1', [guruId]),
      pool.query('SELECT * FROM wakil_perangkat_pembelajaran WHERE guru_id = $1 ORDER BY created_at DESC', [guruId]),
    ]);
    if (guruRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Guru tidak ditemukan' });
    res.json({ success: true, guru: guruRes.rows[0], data: perangkatRes.rows });
  } catch (err) {
    console.error('[getPerangkatByGuru]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/academic/wakil/perangkat
 * Tambah perangkat pembelajaran untuk guru
 */
exports.createPerangkat = async (req, res) => {
  const { guru_id, nama_perangkat, jenis, status, catatan } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO wakil_perangkat_pembelajaran (guru_id, nama_perangkat, jenis, status, catatan)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [guru_id, nama_perangkat, jenis || 'RPP', status || 'belum_lengkap', catatan || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[createPerangkat]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PUT /api/academic/wakil/perangkat/:id
 */
exports.updatePerangkat = async (req, res) => {
  const { id } = req.params;
  const { nama_perangkat, jenis, status, catatan } = req.body;
  try {
    const result = await pool.query(
      `UPDATE wakil_perangkat_pembelajaran SET nama_perangkat=$1, jenis=$2, status=$3, catatan=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [nama_perangkat, jenis, status, catatan || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[updatePerangkat]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/academic/wakil/perangkat/:id
 */
exports.deletePerangkat = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM wakil_perangkat_pembelajaran WHERE id=$1', [id]);
    res.json({ success: true, message: 'Perangkat berhasil dihapus' });
  } catch (err) {
    console.error('[deletePerangkat]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── SUPERVISI GURU ──────────────────────────────────────────────────────────

/**
 * GET /api/academic/wakil/supervisi
 */
exports.getAllSupervisi = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, g.nama_lengkap AS nama_guru, g.mata_pelajaran, g.nip
      FROM wakil_supervisi s
      JOIN guru g ON s.guru_id = g.id
      ORDER BY s.tanggal DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getAllSupervisi]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/academic/wakil/supervisi
 */
exports.createSupervisi = async (req, res) => {
  const { guru_id, tanggal, kelas, mata_pelajaran, aspek_penilaian, nilai, catatan, rekomendasi } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO wakil_supervisi (guru_id, tanggal, kelas, mata_pelajaran, aspek_penilaian, nilai, catatan, rekomendasi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [guru_id, tanggal, kelas, mata_pelajaran, aspek_penilaian || null, nilai || null, catatan || null, rekomendasi || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[createSupervisi]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PUT /api/academic/wakil/supervisi/:id
 */
exports.updateSupervisi = async (req, res) => {
  const { id } = req.params;
  const { guru_id, tanggal, kelas, mata_pelajaran, aspek_penilaian, nilai, catatan, rekomendasi } = req.body;
  try {
    const result = await pool.query(
      `UPDATE wakil_supervisi SET guru_id=$1, tanggal=$2, kelas=$3, mata_pelajaran=$4,
       aspek_penilaian=$5, nilai=$6, catatan=$7, rekomendasi=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [guru_id, tanggal, kelas, mata_pelajaran, aspek_penilaian, nilai, catatan, rekomendasi, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[updateSupervisi]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/academic/wakil/supervisi/:id
 */
exports.deleteSupervisi = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM wakil_supervisi WHERE id=$1', [id]);
    res.json({ success: true, message: 'Data supervisi berhasil dihapus' });
  } catch (err) {
    console.error('[deleteSupervisi]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PROGRAM KERJA ───────────────────────────────────────────────────────────

/**
 * GET /api/academic/wakil/program-kerja
 */
exports.getAllProgramKerja = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wakil_program_kerja ORDER BY tanggal_mulai ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getAllProgramKerja]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/academic/wakil/program-kerja
 */
exports.createProgramKerja = async (req, res) => {
  const { nama_program, bidang, tanggal_mulai, tanggal_selesai, penanggung_jawab, status, deskripsi } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO wakil_program_kerja (nama_program, bidang, tanggal_mulai, tanggal_selesai, penanggung_jawab, status, deskripsi)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nama_program, bidang || 'Kurikulum', tanggal_mulai, tanggal_selesai || null, penanggung_jawab || null, status || 'belum_mulai', deskripsi || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[createProgramKerja]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PUT /api/academic/wakil/program-kerja/:id
 */
exports.updateProgramKerja = async (req, res) => {
  const { id } = req.params;
  const { nama_program, bidang, tanggal_mulai, tanggal_selesai, penanggung_jawab, status, deskripsi } = req.body;
  try {
    const result = await pool.query(
      `UPDATE wakil_program_kerja SET nama_program=$1, bidang=$2, tanggal_mulai=$3, tanggal_selesai=$4,
       penanggung_jawab=$5, status=$6, deskripsi=$7, updated_at=NOW() WHERE id=$8 RETURNING *`,
      [nama_program, bidang, tanggal_mulai, tanggal_selesai || null, penanggung_jawab || null, status, deskripsi || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Data tidak ditemukan' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[updateProgramKerja]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/academic/wakil/program-kerja/:id
 */
exports.deleteProgramKerja = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM wakil_program_kerja WHERE id=$1', [id]);
    res.json({ success: true, message: 'Program kerja berhasil dihapus' });
  } catch (err) {
    console.error('[deleteProgramKerja]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
