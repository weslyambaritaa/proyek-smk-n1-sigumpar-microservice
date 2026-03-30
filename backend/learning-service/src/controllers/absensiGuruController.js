// Fitur 5.1 — Absensi Guru
// Tabel: t_absensi_guru
// Fields: id_absensiGuru (UUID), user_id, namaGuru, mataPelajaran, jamMasuk, foto, status, keterangan

const pool = require("../config/db");

// GET /absensi — semua absensi (kepsek & wakasek)
exports.getAllAbsensi = async (req, res) => {
  try {
    const { user_id, status, tanggal } = req.query;
    const params = [];
    const conditions = [];

    let query = `SELECT * FROM t_absensi_guru`;

    if (user_id) {
      params.push(user_id);
      conditions.push(`user_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (tanggal) {
      params.push(tanggal);
      conditions.push(`DATE("jamMasuk") = $${params.length}`);
    }
    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += ` ORDER BY "jamMasuk" DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /absensi/guru-saya — guru lihat absensi diri sendiri
exports.getAbsensiSaya = async (req, res) => {
  try {
    const userId = req.user.sub;
    const result = await pool.query(
      `SELECT * FROM t_absensi_guru WHERE user_id = $1 ORDER BY "jamMasuk" DESC`,
      [userId]
    );
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /absensi/rekap — rekap jumlah per status per guru
exports.getRekapAbsensi = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        user_id,
        "namaGuru",
        COUNT(*) FILTER (WHERE status = 'hadir')  AS hadir,
        COUNT(*) FILTER (WHERE status = 'izin')   AS izin,
        COUNT(*) FILTER (WHERE status = 'sakit')  AS sakit,
        COUNT(*) FILTER (WHERE status = 'alpha')  AS alpha,
        COUNT(*) AS total
      FROM t_absensi_guru
      GROUP BY user_id, "namaGuru"
      ORDER BY "namaGuru"
    `);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /absensi/:id
exports.getAbsensiById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM t_absensi_guru WHERE "id_absensiGuru" = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Data absensi tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /absensi — guru input absensi
exports.createAbsensi = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { namaGuru, mataPelajaran, jamMasuk, status, keterangan } = req.body;
    const foto = req.file ? `/api/learning/uploads/${req.file.filename}` : null;

    const allowedStatus = ["hadir", "izin", "sakit", "alpha"];
    if (!namaGuru || !mataPelajaran || !jamMasuk || !status) {
      return res.status(400).json({
        success: false,
        message: "Field namaGuru, mataPelajaran, jamMasuk, dan status wajib diisi",
      });
    }
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status harus salah satu dari: ${allowedStatus.join(", ")}`,
      });
    }

    const result = await pool.query(
      `INSERT INTO t_absensi_guru
        (user_id, "namaGuru", "mataPelajaran", "jamMasuk", foto, status, keterangan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, namaGuru, mataPelajaran, jamMasuk, foto, status, keterangan || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /absensi/:id — update absensi milik sendiri
exports.updateAbsensi = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const { namaGuru, mataPelajaran, jamMasuk, status, keterangan } = req.body;
    const foto = req.file ? `/api/learning/uploads/${req.file.filename}` : null;

    const allowedStatus = ["hadir", "izin", "sakit", "alpha"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status harus salah satu dari: ${allowedStatus.join(", ")}`,
      });
    }

    const existing = await pool.query(
      `SELECT * FROM t_absensi_guru WHERE "id_absensiGuru" = $1 AND user_id = $2`,
      [id, userId]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Absensi tidak ditemukan atau bukan milik Anda" });
    }

    const result = await pool.query(
      `UPDATE t_absensi_guru
       SET "namaGuru"      = COALESCE($1, "namaGuru"),
           "mataPelajaran" = COALESCE($2, "mataPelajaran"),
           "jamMasuk"      = COALESCE($3, "jamMasuk"),
           foto            = COALESCE($4, foto),
           status          = COALESCE($5, status),
           keterangan      = COALESCE($6, keterangan),
           updated_at      = NOW()
       WHERE "id_absensiGuru" = $7
       RETURNING *`,
      [
        namaGuru || null, mataPelajaran || null, jamMasuk || null,
        foto, status || null, keterangan || null, id
      ]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /absensi/:id — guru hapus milik sendiri
exports.deleteAbsensi = async (req, res) => {
  try {
    const userId = req.user.sub;
    const result = await pool.query(
      `DELETE FROM t_absensi_guru WHERE "id_absensiGuru" = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Absensi tidak ditemukan atau bukan milik Anda" });
    }
    res.json({ success: true, message: "Absensi berhasil dihapus", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};