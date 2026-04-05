const pool = require('../config/db');

// ─── MONITORING JADWAL ────────────────────────────────────────────────────────

/**
 * GET /api/academic/wakil/jadwal
 * Semua jadwal mengajar + nama kelas, diurutkan hari & jam
 * Wakakur hanya bisa lihat, tidak bisa edit (editing tetap via Tata Usaha)
 */
exports.getJadwalMonitoring = async (req, res) => {
  try {
    const { hari, kelas_id, guru_id, mapel } = req.query;

    let query = `
      SELECT
        j.id,
        j.guru_id,
        j.kelas_id,
        j.mata_pelajaran,
        j.hari,
        j.waktu_mulai,
        j.waktu_berakhir,
        k.nama_kelas
      FROM jadwal_mengajar j
      LEFT JOIN kelas k ON j.kelas_id = k.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (hari)     { query += ` AND j.hari = $${idx++}`;          params.push(hari); }
    if (kelas_id) { query += ` AND j.kelas_id = $${idx++}`;      params.push(kelas_id); }
    if (guru_id)  { query += ` AND j.guru_id = $${idx++}`;       params.push(guru_id); }
    if (mapel)    { query += ` AND j.mata_pelajaran ILIKE $${idx++}`; params.push(`%${mapel}%`); }

    query += `
      ORDER BY
        CASE j.hari
          WHEN 'Senin'   THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu'    THEN 3
          WHEN 'Kamis'   THEN 4 WHEN 'Jumat'  THEN 5 WHEN 'Sabtu'   THEN 6
          ELSE 7
        END, j.waktu_mulai ASC
    `;

    const result = await pool.query(query, params);
    const rows   = result.rows;

    // ── Deteksi Bentrok (server-side) ────────────────────────────────────
    const bentrokIds = new Set();
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i], b = rows[j];
        if (!a.guru_id || a.guru_id !== b.guru_id) continue;
        if (a.hari !== b.hari) continue;
        if (a.waktu_mulai < b.waktu_berakhir && b.waktu_mulai < a.waktu_berakhir) {
          bentrokIds.add(a.id); bentrokIds.add(b.id);
        }
      }
    }

    const enriched = rows.map(r => ({
      ...r,
      is_bentrok: bentrokIds.has(r.id),
    }));

    res.json({
      success: true,
      total:   enriched.length,
      bentrok: bentrokIds.size,
      data:    enriched,
    });
  } catch (err) {
    console.error('[getJadwalMonitoring]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/academic/wakil/jadwal/rekap-hari
 * Rekap jumlah jam mengajar per hari
 */
exports.getRekapJadwalPerHari = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        hari,
        COUNT(*) AS total_jam,
        COUNT(DISTINCT guru_id) AS total_guru,
        COUNT(DISTINCT kelas_id) AS total_kelas
      FROM jadwal_mengajar
      GROUP BY hari
      ORDER BY CASE hari
        WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3
        WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 WHEN 'Sabtu' THEN 6
        ELSE 7
      END
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getRekapJadwalPerHari]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── MONITORING PARENTING (view-only) ────────────────────────────────────────

/**
 * GET /api/academic/wakil/parenting
 * Semua data parenting — Wakakur hanya lihat, tidak bisa tambah/edit
 */
exports.getParentingMonitoring = async (req, res) => {
  try {
    const { kelas_id } = req.query;
    let query = `
      SELECT p.*, k.nama_kelas
      FROM parenting_log p
      LEFT JOIN kelas k ON p.kelas_id = k.id
      WHERE 1=1
    `;
    const params = [];
    if (kelas_id) { query += ' AND p.kelas_id = $1'; params.push(kelas_id); }
    query += ' ORDER BY p.tanggal DESC, p.id DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getParentingMonitoring]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── LAPORAN RINGKAS AKADEMIK ─────────────────────────────────────────────────

/**
 * GET /api/academic/wakil/laporan-ringkas
 * Statistik ringkas: jadwal, kelas, guru, perangkat
 */
exports.getLaporanRingkas = async (req, res) => {
  try {
    // Query-query utama yang pasti ada tabelnya
    const [jadwalRes, kelasRes, guruRes, parentingRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total, COUNT(DISTINCT guru_id) AS guru, COUNT(DISTINCT kelas_id) AS kelas FROM jadwal_mengajar'),
      pool.query('SELECT COUNT(*) AS total FROM kelas'),
      pool.query("SELECT COUNT(*) AS total FROM guru"),
      pool.query('SELECT COUNT(*) AS total FROM parenting_log'),
    ]);

    // Query ke tabel wakil yang mungkin belum ada — fallback ke 0 jika error
    let perangkatTotal = 0;
    let perangkatLengkap = 0;
    try {
      const perangkatRes = await pool.query(
        "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='lengkap') AS lengkap FROM wakil_perangkat_pembelajaran"
      );
      perangkatTotal  = Number(perangkatRes.rows[0].total);
      perangkatLengkap = Number(perangkatRes.rows[0].lengkap);
    } catch {
      // Tabel belum ada (migration belum dijalankan) — kembalikan 0
    }

    res.json({
      success: true,
      data: {
        jadwal: {
          total_jam:   Number(jadwalRes.rows[0].total),
          total_guru:  Number(jadwalRes.rows[0].guru),
          total_kelas: Number(jadwalRes.rows[0].kelas),
        },
        kelas:     { total: Number(kelasRes.rows[0].total) },
        guru:      { total: Number(guruRes.rows[0].total) },
        perangkat: { total: perangkatTotal, lengkap: perangkatLengkap },
        parenting: { total: Number(parentingRes.rows[0].total) },
      },
    });
  } catch (err) {
    console.error('[getLaporanRingkas]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};