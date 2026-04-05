const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

const DATA_FILE = path.join(__dirname, "../data/todos.json");

const readTodos = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeTodos = (todos) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Hanya file PDF, DOCX/DOC, dan gambar (JPG/PNG) yang diperbolehkan"));
  },
});

const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

// ── Helper: cek apakah user adalah kepala sekolah ────────────────────────
const isKepsek = (user) => {
  const roles =
    user?.realm_access?.roles ||
    user?.resource_access?.["smk-sigumpar"]?.roles ||
    [];
  return roles.includes("kepala-sekolah");
};

// ── TODOS ─────────────────────────────────────────────────────────────────
const getAllTodos = (req, res, next) => {
  try {
    let todos = readTodos();
    const { userId, status, priority, search } = req.query;
    if (userId) todos = todos.filter((t) => t.userId === userId);
    if (status) todos = todos.filter((t) => t.status === status);
    if (priority) todos = todos.filter((t) => t.priority === priority);
    if (search) {
      const keyword = search.toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(keyword) ||
          t.description?.toLowerCase().includes(keyword)
      );
    }
    res.json({ success: true, count: todos.length, data: todos });
  } catch (err) {
    next(err);
  }
};

const getTodoById = (req, res, next) => {
  try {
    const todos = readTodos();
    const todo = todos.find((t) => t.id === req.params.id);
    if (!todo) throw createError(404, `Todo dengan ID '${req.params.id}' tidak ditemukan`);
    res.json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

const createTodo = (req, res, next) => {
  try {
    const { userId, title, description = "", priority = "medium" } = req.body;
    if (!userId || !title) throw createError(400, "Field 'userId' dan 'title' wajib diisi");
    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
      throw createError(400, `Priority harus salah satu dari: ${allowedPriorities.join(", ")}`);
    }
    const todos = readTodos();
    const newTodo = {
      id: uuidv4(), userId, title: title.trim(), description: description.trim(),
      status: "pending", priority, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    todos.push(newTodo);
    writeTodos(todos);
    res.status(201).json({ success: true, data: newTodo });
  } catch (err) { next(err); }
};

const updateTodo = (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw createError(404, `Todo dengan ID '${req.params.id}' tidak ditemukan`);
    const allowedStatuses = ["pending", "in-progress", "done"];
    if (status && !allowedStatuses.includes(status)) {
      throw createError(400, `Status harus salah satu dari: ${allowedStatuses.join(", ")}`);
    }
    todos[index] = {
      ...todos[index],
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(status && { status }),
      ...(priority && { priority }),
      updatedAt: new Date().toISOString(),
    };
    writeTodos(todos);
    res.json({ success: true, data: todos[index] });
  } catch (err) { next(err); }
};

const deleteTodo = (req, res, next) => {
  try {
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw createError(404, `Todo dengan ID '${req.params.id}' tidak ditemukan`);
    const deleted = todos.splice(index, 1)[0];
    writeTodos(todos);
    res.json({ success: true, message: "Todo berhasil dihapus", data: deleted });
  } catch (err) { next(err); }
};

// ── PERANGKAT PEMBELAJARAN ────────────────────────────────────────────────

/**
 * GET /api/learning/perangkat
 * - Guru biasa: hanya dokumen milik sendiri
 * - Kepala Sekolah: semua dokumen semua guru (untuk pemeriksaan)
 *   Support filter: ?status_review=menunggu|disetujui|revisi|ditolak
 *                   ?jenis_dokumen=RPP|Silabus|Modul
 *                   ?search=kata
 */
const getAllPerangkat = async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;
  const kepsek = isKepsek(user);

  const { status_review, jenis_dokumen, search } = req.query;

  try {
    let query, params;

    if (kepsek) {
      // Kepala sekolah: lihat semua dokumen + info revisi
      // Tampilkan hanya dokumen "root" (bukan revisi) dengan versi terbaru di kolom terpisah
      query = `
        SELECT
          p.id,
          p.guru_id,
          COALESCE(p.nama_guru, p.guru_id::text)           AS nama_guru,
          p.nama_dokumen,
          p.jenis_dokumen,
          p.file_name,
          p.file_mime,
          COALESCE(p.status_review, 'menunggu')            AS status_review,
          p.catatan_review,
          p.reviewed_by,
          p.reviewed_at,
          COALESCE(p.versi, 1)                             AS versi,
          p.parent_id,
          to_char(p.tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload,
          -- jumlah versi revisi yang sudah diupload guru
          (SELECT COUNT(*) FROM perangkat_pembelajaran r
           WHERE r.parent_id = COALESCE(p.parent_id, p.id) OR r.id = COALESCE(p.parent_id, p.id)
          )::int AS total_versi
        FROM perangkat_pembelajaran p
        WHERE 1=1
      `;
      params = [];
      let idx = 1;

      if (status_review) {
        query += ` AND COALESCE(p.status_review,'menunggu') = $${idx++}`;
        params.push(status_review);
      }
      if (jenis_dokumen) {
        query += ` AND p.jenis_dokumen = $${idx++}`;
        params.push(jenis_dokumen);
      }
      if (search) {
        query += ` AND (p.nama_dokumen ILIKE $${idx} OR COALESCE(p.nama_guru,'') ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
      }

      query += ` ORDER BY p.tanggal_upload DESC, p.id DESC`;
    } else {
      // Guru biasa: hanya milik sendiri
      query = `
        SELECT
          id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
          COALESCE(status_review, 'menunggu') AS status_review,
          catatan_review, reviewed_at,
          COALESCE(versi, 1) AS versi,
          parent_id,
          to_char(tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload
        FROM perangkat_pembelajaran
        WHERE ($1::uuid IS NULL OR guru_id = $1)
        ORDER BY tanggal_upload DESC, id DESC
      `;
      params = [guruId || null];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error("[getAllPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/learning/perangkat
 * Guru upload dokumen baru atau upload revisi (dengan ?parent_id=xxx)
 */
const uploadPerangkat = async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;

  try {
    await runMulter(req, res);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const { nama_dokumen, jenis_dokumen, parent_id, nama_guru } = req.body;

  if (!guruId)       return res.status(401).json({ success: false, message: "Identitas guru tidak ditemukan" });
  if (!nama_dokumen || !jenis_dokumen) return res.status(400).json({ success: false, message: "Nama dokumen dan jenis dokumen wajib diisi" });
  if (!req.file)     return res.status(400).json({ success: false, message: "File wajib diunggah (PDF/DOCX)" });

  try {
    let versi = 1;
    let resolvedParentId = parent_id ? parseInt(parent_id) : null;

    // Jika ini revisi, hitung versi
    if (resolvedParentId) {
      const vRes = await pool.query(
        `SELECT COALESCE(MAX(versi), 1) + 1 AS next_versi
         FROM perangkat_pembelajaran
         WHERE parent_id = $1 OR id = $1`,
        [resolvedParentId]
      );
      versi = vRes.rows[0]?.next_versi || 2;
    }

    const guruNama = nama_guru || user?.name || user?.preferred_username || null;

    const result = await pool.query(
      `INSERT INTO perangkat_pembelajaran
       (guru_id, nama_dokumen, jenis_dokumen, file_name, file_data, file_mime,
        status_review, versi, parent_id, nama_guru)
       VALUES ($1, $2, $3, $4, $5, $6, 'menunggu', $7, $8, $9)
       RETURNING id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
                 status_review, versi, parent_id, nama_guru,
                 to_char(tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload`,
      [
        guruId,
        nama_dokumen.trim(),
        jenis_dokumen,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype,
        versi,
        resolvedParentId,
        guruNama,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[uploadPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/learning/perangkat/:id/download
 * GET /api/learning/perangkat/:id/view
 * Download atau preview file — semua role bisa (guru pemilik + kepsek)
 */
const downloadPerangkat = async (req, res) => {
  const isView = req.path.endsWith("/view");
  try {
    const result = await pool.query(
      "SELECT file_name, file_data, file_mime, guru_id FROM perangkat_pembelajaran WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });

    const doc  = result.rows[0];
    const mime = doc.file_mime || "application/octet-stream";
    res.set("Content-Type", mime);
    res.set(
      "Content-Disposition",
      `${isView ? "inline" : "attachment"}; filename="${doc.file_name}"`
    );
    res.send(doc.file_data);
  } catch (err) {
    console.error("[downloadPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePerangkat = async (req, res) => {
  const user   = req.user;
  const guruId = user?.sub || user?.id || user?.userId;
  const kepsek = isKepsek(user);

  try {
    const check = await pool.query(
      "SELECT guru_id FROM perangkat_pembelajaran WHERE id = $1",
      [req.params.id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });

    // Kepsek boleh hapus semua; guru hanya milik sendiri
    if (!kepsek && guruId && String(check.rows[0].guru_id) !== String(guruId)) {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }

    await pool.query("DELETE FROM perangkat_pembelajaran WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Dokumen berhasil dihapus" });
  } catch (err) {
    console.error("[deletePerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── KEPSEK: REVIEW PERANGKAT ──────────────────────────────────────────────

/**
 * PUT /api/learning/perangkat/:id/review
 * Body: { status: 'disetujui'|'revisi'|'ditolak', catatan: '...' }
 * Hanya kepala sekolah yang bisa memanggil endpoint ini.
 */
const reviewPerangkat = async (req, res) => {
  const user   = req.user;
  const kepsek = isKepsek(user);

  if (!kepsek) {
    return res.status(403).json({ success: false, message: "Hanya kepala sekolah yang dapat mereview dokumen" });
  }

  const { status, catatan } = req.body;
  const allowedStatus = ["disetujui", "revisi", "ditolak"];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status harus salah satu dari: ${allowedStatus.join(", ")}`,
    });
  }

  const kepsekNama = user?.name || user?.preferred_username || "Kepala Sekolah";
  const kepsekId   = user?.sub || user?.id || null;

  try {
    // Update status di tabel perangkat
    const result = await pool.query(
      `UPDATE perangkat_pembelajaran
       SET status_review = $1,
           catatan_review = $2,
           reviewed_by = $3,
           reviewed_at = NOW()
       WHERE id = $4
       RETURNING id, nama_dokumen, jenis_dokumen, status_review, catatan_review,
                 reviewed_by, reviewed_at, guru_id, nama_guru, versi`,
      [status, catatan || null, kepsekNama, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });
    }

    // Simpan riwayat review ke tabel review_kepsek
    await pool.query(
      `INSERT INTO review_kepsek (perangkat_id, status, komentar, kepsek_id, kepsek_nama, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT DO NOTHING`,
      [req.params.id, status, catatan || null, kepsekId, kepsekNama]
    ).catch((e) => console.warn("[review_kepsek insert warn]", e.message));

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[reviewPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/learning/perangkat/:id/riwayat-review
 * Ambil riwayat semua review untuk 1 dokumen (termasuk semua versi revisinya)
 */
const getRiwayatReview = async (req, res) => {
  try {
    const id = req.params.id;

    // Cari root document (kalau ini adalah revisi, cari parentnya)
    const docRes = await pool.query(
      "SELECT id, parent_id FROM perangkat_pembelajaran WHERE id = $1",
      [id]
    );
    if (docRes.rows.length === 0)
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });

    const rootId = docRes.rows[0].parent_id || id;

    // Ambil semua versi dokumen (root + semua revisi)
    const versiRes = await pool.query(
      `SELECT id FROM perangkat_pembelajaran
       WHERE id = $1 OR parent_id = $1
       ORDER BY versi ASC`,
      [rootId]
    );
    const allIds = versiRes.rows.map((r) => r.id);

    // Ambil semua riwayat review untuk semua versi
    const riwayatRes = await pool.query(
      `SELECT r.*, p.nama_dokumen, p.jenis_dokumen, p.versi, p.file_name
       FROM review_kepsek r
       JOIN perangkat_pembelajaran p ON r.perangkat_id = p.id
       WHERE r.perangkat_id = ANY($1)
       ORDER BY r.created_at DESC`,
      [allIds]
    );

    res.json({ success: true, data: riwayatRes.rows });
  } catch (err) {
    console.error("[getRiwayatReview]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/learning/perangkat/:id/versi
 * Ambil semua versi dokumen (dokumen asal + semua revisi yang diupload ulang guru)
 */
const getVersiDokumen = async (req, res) => {
  try {
    const id = req.params.id;

    const docRes = await pool.query(
      "SELECT id, parent_id FROM perangkat_pembelajaran WHERE id = $1",
      [id]
    );
    if (docRes.rows.length === 0)
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });

    const rootId = docRes.rows[0].parent_id || id;

    const result = await pool.query(
      `SELECT id, nama_dokumen, jenis_dokumen, file_name, file_mime,
              COALESCE(status_review,'menunggu') AS status_review,
              catatan_review, reviewed_by, reviewed_at,
              COALESCE(versi,1) AS versi, parent_id, nama_guru,
              to_char(tanggal_upload,'YYYY-MM-DD HH24:MI') AS tanggal_upload
       FROM perangkat_pembelajaran
       WHERE id = $1 OR parent_id = $1
       ORDER BY versi ASC`,
      [rootId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("[getVersiDokumen]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo,
  getAllPerangkat, uploadPerangkat, downloadPerangkat, deletePerangkat,
  reviewPerangkat, getRiwayatReview, getVersiDokumen,
};