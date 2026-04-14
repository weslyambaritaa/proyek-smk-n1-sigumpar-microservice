const pool = require("../config/db");

// ─── PENGECEKAN PERANGKAT PEMBELAJARAN ───────────────────────────────────────

/**
 * GET /api/learning/wakil/perangkat-guru
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
    console.error("[getDaftarGuruPerangkat]", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/learning/wakil/perangkat-guru/:guruId
 * Detail perangkat pembelajaran satu guru
 */
exports.getPerangkatByGuru = async (req, res) => {
  const { guruId } = req.params;
  try {
    const [guruRes, perangkatRes] = await Promise.all([
      pool.query(
        "SELECT id, nip, nama_lengkap, mata_pelajaran, jabatan FROM guru WHERE id = $1",
        [guruId],
      ),
      pool.query(
        "SELECT * FROM wakil_perangkat_pembelajaran WHERE guru_id = $1 ORDER BY created_at DESC",
        [guruId],
      ),
    ]);
    if (guruRes.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Guru tidak ditemukan" });
    res.json({ success: true, guru: guruRes.rows[0], data: perangkatRes.rows });
  } catch (err) {
    console.error("[getPerangkatByGuru]", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/learning/wakil/perangkat
 * Tambah perangkat pembelajaran untuk guru
 */
exports.createPerangkat = async (req, res) => {
  const { guru_id, nama_perangkat, jenis, status, catatan } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO wakil_perangkat_pembelajaran (guru_id, nama_perangkat, jenis, status, catatan)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        guru_id,
        nama_perangkat,
        jenis || "RPP",
        status || "belum_lengkap",
        catatan || null,
      ],
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[createPerangkat]", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PUT /api/learning/wakil/perangkat/:id
 */
exports.updatePerangkat = async (req, res) => {
  const { id } = req.params;
  const { nama_perangkat, jenis, status, catatan } = req.body;
  try {
    const result = await pool.query(
      `UPDATE wakil_perangkat_pembelajaran SET nama_perangkat=$1, jenis=$2, status=$3, catatan=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [nama_perangkat, jenis, status, catatan || null, id],
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Data tidak ditemukan" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[updatePerangkat]", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/learning/wakil/perangkat/:id
 */
exports.deletePerangkat = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM wakil_perangkat_pembelajaran WHERE id=$1", [
      id,
    ]);
    res.json({ success: true, message: "Perangkat berhasil dihapus" });
  } catch (err) {
    console.error("[deletePerangkat]", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
