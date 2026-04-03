const pool = require('../config/db');

// =============================================
// NILAI CONTROLLER
// Mengelola nilai tugas, kuis, UTS, UAS, praktik siswa
// =============================================

/**
 * GET /api/academic/nilai
 * Query params: mapel_id, kelas_id, tahun_ajar, search
 * Mengembalikan daftar nilai siswa berdasarkan filter
 */
exports.getNilai = async (req, res) => {
  const { mapel_id, kelas_id, tahun_ajar, search } = req.query;

  try {
    let query = `
      SELECT 
        n.id,
        n.siswa_id,
        s.nisn,
        s.nama_lengkap,
        k.nama_kelas,
        m.nama_mapel,
        n.mapel_id,
        n.kelas_id,
        n.tahun_ajar,
        n.nilai_tugas,
        n.nilai_kuis,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_praktik,
        ROUND(
          (
            n.nilai_tugas * 0.15 +
            n.nilai_kuis * 0.15 +
            n.nilai_uts * 0.20 +
            n.nilai_uas * 0.30 +
            n.nilai_praktik * 0.20
          )::numeric,
          2
        ) AS nilai_akhir
      FROM nilai_siswa n
      JOIN siswa s ON n.siswa_id = s.id
      JOIN kelas k ON n.kelas_id = k.id
      JOIN mata_pelajaran m ON n.mapel_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (mapel_id) {
      query += ` AND n.mapel_id = $${idx++}`;
      params.push(mapel_id);
    }
    if (kelas_id) {
      query += ` AND n.kelas_id = $${idx++}`;
      params.push(kelas_id);
    }
    if (tahun_ajar) {
      query += ` AND n.tahun_ajar = $${idx++}`;
      params.push(tahun_ajar);
    }
    if (search) {
      query += ` AND LOWER(s.nama_lengkap) LIKE $${idx++}`;
      params.push(`%${search.toLowerCase()}%`);
    }

    query += ` ORDER BY s.nama_lengkap ASC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error getNilai:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/academic/nilai/siswa-by-kelas
 * Query params: kelas_id, mapel_id, tahun_ajar
 * Mengembalikan daftar siswa di kelas + nilai mereka (jika ada)
 */
exports.getSiswaByKelas = async (req, res) => {
  const { kelas_id, mapel_id, tahun_ajar } = req.query;

  if (!kelas_id) {
    return res.status(400).json({ success: false, message: 'kelas_id wajib diisi' });
  }

  try {
    const query = `
      SELECT 
        s.id AS siswa_id,
        s.nisn,
        s.nama_lengkap,
        k.nama_kelas,
        COALESCE(n.id, NULL) AS nilai_id,
        COALESCE(n.mapel_id, NULL) AS mapel_id,
        COALESCE(n.tahun_ajar, $3) AS tahun_ajar,
        COALESCE(n.nilai_tugas, 0) AS nilai_tugas,
        COALESCE(n.nilai_kuis, 0) AS nilai_kuis,
        COALESCE(n.nilai_uts, 0) AS nilai_uts,
        COALESCE(n.nilai_uas, 0) AS nilai_uas,
        COALESCE(n.nilai_praktik, 0) AS nilai_praktik,
        CASE 
          WHEN n.id IS NOT NULL THEN
            ROUND(
              (
                n.nilai_tugas * 0.15 +
                n.nilai_kuis * 0.15 +
                n.nilai_uts * 0.20 +
                n.nilai_uas * 0.30 +
                n.nilai_praktik * 0.20
              )::numeric,
              2
            )
          ELSE 0
        END AS nilai_akhir
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN nilai_siswa n 
        ON n.siswa_id = s.id 
        AND n.kelas_id = $1
        AND ($2::INTEGER IS NULL OR n.mapel_id = $2::INTEGER)
        AND ($3::VARCHAR IS NULL OR n.tahun_ajar = $3)
      WHERE s.kelas_id = $1
      ORDER BY s.nama_lengkap ASC
    `;

    const result = await pool.query(query, [
      kelas_id,
      mapel_id || null,
      tahun_ajar || null,
    ]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error getSiswaByKelas:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/academic/nilai/bulk
 * Body: { mapel_id, kelas_id, tahun_ajar, nilai: [{ siswa_id, nilai_tugas, nilai_kuis, nilai_uts, nilai_uas, nilai_praktik }] }
 * Upsert massal nilai siswa
 */
exports.saveNilaiBulk = async (req, res) => {
  const { mapel_id, kelas_id, tahun_ajar, nilai } = req.body;

  if (!mapel_id || !kelas_id || !tahun_ajar || !Array.isArray(nilai)) {
    return res.status(400).json({
      success: false,
      message: 'mapel_id, kelas_id, tahun_ajar, dan nilai[] wajib diisi',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const results = [];
    for (const item of nilai) {
      const { siswa_id, nilai_tugas, nilai_kuis, nilai_uts, nilai_uas, nilai_praktik } = item;

      const upsertQuery = `
  INSERT INTO nilai_siswa
    (
      siswa_id,
      mapel_id,
      kelas_id,
      tahun_ajar,
      nilai_tugas,
      nilai_kuis,
      nilai_uts,
      nilai_uas,
      nilai_praktik,
      updated_at
    )
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
  ON CONFLICT (siswa_id, mapel_id, kelas_id, tahun_ajar)
  DO UPDATE SET
    nilai_tugas = EXCLUDED.nilai_tugas,
    nilai_kuis = EXCLUDED.nilai_kuis,
    nilai_uts = EXCLUDED.nilai_uts,
    nilai_uas = EXCLUDED.nilai_uas,
    nilai_praktik = EXCLUDED.nilai_praktik,
    updated_at = NOW()
  RETURNING *;
`;

      const r = await client.query(upsertQuery, [
        siswa_id,
        mapel_id,
        kelas_id,
        tahun_ajar,
        Number(nilai_tugas) || 0,
        Number(nilai_kuis) || 0,
        Number(nilai_uts) || 0,
        Number(nilai_uas) || 0,
        Number(nilai_praktik) || 0,
      ]);

      results.push(r.rows[0]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Nilai berhasil disimpan', data: results });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saveNilaiBulk:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      detail: err.detail || null,
      code: err.code || null,
    });
  } finally {
    client.release();
  }
};

/**
 * PUT /api/academic/nilai/:id
 * Update satu record nilai
 */
exports.updateNilai = async (req, res) => {
  const { id } = req.params;
  const { nilai_tugas, nilai_kuis, nilai_uts, nilai_uas, nilai_praktik } = req.body;

  try {
    const result = await pool.query(
      `UPDATE nilai_siswa 
       SET nilai_tugas=$1, nilai_kuis=$2, nilai_uts=$3, nilai_uas=$4, nilai_praktik=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [nilai_tugas, nilai_kuis, nilai_uts, nilai_uas, nilai_praktik, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Nilai tidak ditemukan' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updateNilai:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/academic/nilai/:id
 */
exports.deleteNilai = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nilai_siswa WHERE id = $1', [id]);
    res.json({ success: true, message: 'Nilai berhasil dihapus' });
  } catch (err) {
    console.error('Error deleteNilai:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};