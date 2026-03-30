const pool = require('../config/db');

exports.getNilai = async (req, res, next) => {
  try {
    const { kelas_id, mapel_id, tahun_ajar, search } = req.query;

    if (!kelas_id || !mapel_id || !tahun_ajar) {
      return res.status(400).json({ error: 'kelas_id, mapel_id, dan tahun_ajar harus diisi' });
    }

    const values = [kelas_id, mapel_id, tahun_ajar];
    let searchClause = '';

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      searchClause = 'AND LOWER(s.nama_lengkap) LIKE $4';
    }

    const query = `
      SELECT
        s.id AS siswa_id,
        s.nisn,
        s.nama_lengkap,
        k.id AS kelas_id,
        k.nama_kelas,
        n.id AS nilai_id,
        n.tugas,
        n.kuis,
        n.uts,
        n.uas,
        n.praktik,
        COALESCE(n.nilai_akhir, ROUND((COALESCE(n.tugas,0)+COALESCE(n.kuis,0)+COALESCE(n.uts,0)+COALESCE(n.uas,0)+COALESCE(n.praktik,0))/5.0,2)) AS nilai_akhir,
        n.tahun_ajar
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN nilai n
        ON n.siswa_id = s.id
        AND n.mapel_id = $2
        AND n.tahun_ajar = $3
      WHERE s.kelas_id = $1
      ${searchClause}
      ORDER BY s.nama_lengkap ASC
    `;

    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.upsertNilaiBatch = async (req, res, next) => {
  const { mapel_id, tahun_ajar, data } = req.body;

  if (!mapel_id || !tahun_ajar || !Array.isArray(data)) {
    return res.status(400).json({ error: 'mapel_id, tahun_ajar, dan data harus array' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const promises = data.map((row) => {
      const { siswa_id, tugas = 0, kuis = 0, uts = 0, uas = 0, praktik = 0 } = row;

      const t = Number(tugas) || 0;
      const k = Number(kuis) || 0;
      const u = Number(uts) || 0;
      const ua = Number(uas) || 0;
      const p = Number(praktik) || 0;
      const nilaiAkhir = Number(((t + k + u + ua + p) / 5).toFixed(2));

      return client.query(
        `INSERT INTO nilai (siswa_id, mapel_id, tahun_ajar, tugas, kuis, uts, uas, praktik, nilai_akhir)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (siswa_id, mapel_id, tahun_ajar)
         DO UPDATE SET tugas = EXCLUDED.tugas, kuis = EXCLUDED.kuis, uts = EXCLUDED.uts, uas = EXCLUDED.uas, praktik = EXCLUDED.praktik, nilai_akhir = EXCLUDED.nilai_akhir`,
        [siswa_id, mapel_id, tahun_ajar, t, k, u, ua, p, nilaiAkhir]
      );
    });

    await Promise.all(promises);
    await client.query('COMMIT');

    res.status(200).json({ message: 'Nilai berhasil disimpan' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
