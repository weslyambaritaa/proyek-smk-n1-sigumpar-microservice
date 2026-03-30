// Fitur 5.4 — Perangkat Pembelajaran
// Tabel: t_perangkat_pembelajaran
// Fields: id_perangkatPembelajaran (UUID), user_id, namaMapel, kelas,
//         uploadSilabus, uploadRPP, modulAjar

const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

// Helper: hitung status kelengkapan satu guru
// "Lengkap" jika sudah ada uploadSilabus, uploadRPP, DAN modulAjar
const hitungStatus = async (userId) => {
  const result = await pool.query(
    `SELECT "uploadSilabus", "uploadRPP", "modulAjar"
     FROM t_perangkat_pembelajaran
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rowCount === 0) return "Belum Lengkap";

  // Cukup satu baris yang semua file-nya terisi = Lengkap
  const adaLengkap = result.rows.some(
    (r) => r.uploadSilabus && r.uploadRPP && r.modulAjar
  );
  return adaLengkap ? "Lengkap" : "Belum Lengkap";
};

// -------------------------------------------------------
// GET /perangkat/dashboard-wakasek
// Dashboard Wakasek: statistik total guru, lengkap, belum
// -------------------------------------------------------
exports.getDashboardWakasek = async (req, res) => {
  try {
    const guruResult = await pool.query(
      `SELECT DISTINCT user_id FROM t_perangkat_pembelajaran`
    );
    const userIds = guruResult.rows.map((r) => r.user_id);

    let lengkap = 0, belumLengkap = 0;
    for (const uid of userIds) {
      const status = await hitungStatus(uid);
      if (status === "Lengkap") lengkap++;
      else belumLengkap++;
    }

    // 10 upload terbaru
    const recent = await pool.query(
      `SELECT * FROM t_perangkat_pembelajaran ORDER BY created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        total_guru: userIds.length,
        unggahan_lengkap: lengkap,
        unggahan_belum_lengkap: belumLengkap,
        unggahan_terbaru: recent.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------------------------------
// GET /perangkat/daftar-guru
// Daftar semua guru + status kelengkapan (halaman "Daftar Guru" Wakasek)
// -------------------------------------------------------
exports.getDaftarGuruStatus = async (req, res) => {
  try {
    const guruResult = await pool.query(
      `SELECT DISTINCT user_id FROM t_perangkat_pembelajaran ORDER BY user_id`
    );
    const daftar = await Promise.all(
      guruResult.rows.map(async ({ user_id }) => ({
        user_id,
        status_unggahan: await hitungStatus(user_id),
      }))
    );
    res.json({ success: true, count: daftar.length, data: daftar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------------------------------
// GET /perangkat/detail-guru/:userId
// Detail perangkat satu guru (halaman "Detail Pembelajaran" Wakasek)
// -------------------------------------------------------
exports.getDetailGuruById = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT * FROM t_perangkat_pembelajaran WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    const status = await hitungStatus(userId);
    res.json({
      success: true,
      user_id: userId,
      status_kelengkapan: status,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------------------------------
// GET /perangkat/guru-saya — guru lihat perangkat sendiri
// -------------------------------------------------------
exports.getPerangkatSaya = async (req, res) => {
  try {
    const userId = req.user.sub;
    const result = await pool.query(
      `SELECT * FROM t_perangkat_pembelajaran WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    const status = await hitungStatus(userId);
    res.json({
      success: true,
      status_kelengkapan: status,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /perangkat — semua perangkat (monitoring kepsek & wakasek)
exports.getAllPerangkat = async (req, res) => {
  try {
    const { user_id, kelas } = req.query;
    const params = [];
    const conditions = [];
    let query = `SELECT * FROM t_perangkat_pembelajaran`;

    if (user_id) { params.push(user_id); conditions.push(`user_id = $${params.length}`); }
    if (kelas)   { params.push(kelas);   conditions.push(`kelas = $${params.length}`); }
    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /perangkat/:id
exports.getPerangkatById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM t_perangkat_pembelajaran WHERE "id_perangkatPembelajaran" = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------------------------------
// POST /perangkat — guru upload perangkat
// Form fields: namaMapel, kelas
// File fields: silabus, rpp, modulAjar (masing-masing opsional)
// -------------------------------------------------------
exports.createPerangkat = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { namaMapel, kelas } = req.body;
    const files = req.files || {};

    if (!namaMapel || !kelas) {
      return res.status(400).json({
        success: false,
        message: "Field namaMapel dan kelas wajib diisi",
      });
    }

    const uploadSilabus = files.silabus?.[0]
      ? `/api/learning/uploads/${files.silabus[0].filename}` : null;
    const uploadRPP = files.rpp?.[0]
      ? `/api/learning/uploads/${files.rpp[0].filename}` : null;
    const modulAjar = files.modulAjar?.[0]
      ? `/api/learning/uploads/${files.modulAjar[0].filename}` : null;

    const result = await pool.query(
      `INSERT INTO t_perangkat_pembelajaran
        (user_id, "namaMapel", kelas, "uploadSilabus", "uploadRPP", "modulAjar")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, namaMapel, kelas, uploadSilabus, uploadRPP, modulAjar]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------------------------------
// PUT /perangkat/:id — guru update perangkat milik sendiri
// -------------------------------------------------------
exports.updatePerangkat = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const { namaMapel, kelas } = req.body;
    const files = req.files || {};

    const existing = await pool.query(
      `SELECT * FROM t_perangkat_pembelajaran WHERE "id_perangkatPembelajaran" = $1 AND user_id = $2`,
      [id, userId]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan atau bukan milik Anda" });
    }

    const old = existing.rows[0];

    // Hapus file lama jika ada file baru
    const hapusFileLama = (oldUrl) => {
      if (!oldUrl) return;
      const p = path.join(__dirname, "../../uploads", path.basename(oldUrl));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    };

    const uploadSilabus = files.silabus?.[0]
      ? (hapusFileLama(old.uploadSilabus), `/api/learning/uploads/${files.silabus[0].filename}`)
      : old.uploadSilabus;
    const uploadRPP = files.rpp?.[0]
      ? (hapusFileLama(old.uploadRPP), `/api/learning/uploads/${files.rpp[0].filename}`)
      : old.uploadRPP;
    const modulAjar = files.modulAjar?.[0]
      ? (hapusFileLama(old.modulAjar), `/api/learning/uploads/${files.modulAjar[0].filename}`)
      : old.modulAjar;

    const result = await pool.query(
      `UPDATE t_perangkat_pembelajaran
       SET "namaMapel"      = COALESCE($1, "namaMapel"),
           kelas            = COALESCE($2, kelas),
           "uploadSilabus"  = $3,
           "uploadRPP"      = $4,
           "modulAjar"      = $5,
           updated_at       = NOW()
       WHERE "id_perangkatPembelajaran" = $6
       RETURNING *`,
      [namaMapel || null, kelas || null, uploadSilabus, uploadRPP, modulAjar, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /perangkat/:id
exports.deletePerangkat = async (req, res) => {
  try {
    const { id } = req.params;
    const userRoles = (req.user.realm_access && req.user.realm_access.roles) || [];
    const isAdmin = userRoles.includes("kepala-sekolah") || userRoles.includes("waka-sekolah");

    let result;
    if (isAdmin) {
      result = await pool.query(
        `DELETE FROM t_perangkat_pembelajaran WHERE "id_perangkatPembelajaran" = $1 RETURNING *`,
        [id]
      );
    } else {
      result = await pool.query(
        `DELETE FROM t_perangkat_pembelajaran WHERE "id_perangkatPembelajaran" = $1 AND user_id = $2 RETURNING *`,
        [id, req.user.sub]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan atau akses ditolak" });
    }

    // Hapus semua file fisik
    const row = result.rows[0];
    [row.uploadSilabus, row.uploadRPP, row.modulAjar].forEach((url) => {
      if (!url) return;
      const p = path.join(__dirname, "../../uploads", path.basename(url));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    res.json({ success: true, message: "Perangkat berhasil dihapus", data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};