const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");
const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

const DATA_FILE = path.join(__dirname, "../data/todos.json");

const readTodos = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeTodos = (todos) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
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

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file PDF, DOCX/DOC, dan gambar yang diperbolehkan"));
    }
  },
});

const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const getUserId = (req) =>
  req.user?.sub || req.user?.id || req.user?.userId || null;

const getUserName = (req) =>
  req.user?.name ||
  req.user?.preferred_username ||
  req.user?.username ||
  "Unknown";

const getRoles = (req) => {
  const realmRoles = req.user?.realm_access?.roles || [];
  const resourceRoles = Object.values(req.user?.resource_access || {}).flatMap(
    (client) => client.roles || [],
  );

  return [...new Set([...realmRoles, ...resourceRoles])];
};

const hasRole = (req, allowedRoles) =>
  getRoles(req).some((role) => allowedRoles.includes(role));

// ─── TODOS ─────────────────────────────────────────────────────

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
          t.description?.toLowerCase().includes(keyword),
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

    if (!todo) {
      throw createError(
        404,
        `Todo dengan ID '${req.params.id}' tidak ditemukan`,
      );
    }

    res.json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

const createTodo = (req, res, next) => {
  try {
    const { userId, title, description = "", priority = "medium" } = req.body;

    if (!userId || !title) {
      throw createError(400, "Field 'userId' dan 'title' wajib diisi");
    }

    const allowedPriorities = ["low", "medium", "high"];

    if (!allowedPriorities.includes(priority)) {
      throw createError(
        400,
        `Priority harus salah satu dari: ${allowedPriorities.join(", ")}`,
      );
    }

    const todos = readTodos();

    const newTodo = {
      id: randomUUID(),
      userId,
      title: title.trim(),
      description: description.trim(),
      status: "pending",
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    todos.push(newTodo);
    writeTodos(todos);

    res.status(201).json({ success: true, data: newTodo });
  } catch (err) {
    next(err);
  }
};

const updateTodo = (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);

    if (index === -1) {
      throw createError(
        404,
        `Todo dengan ID '${req.params.id}' tidak ditemukan`,
      );
    }

    const allowedStatuses = ["pending", "in-progress", "done"];

    if (status && !allowedStatuses.includes(status)) {
      throw createError(
        400,
        `Status harus salah satu dari: ${allowedStatuses.join(", ")}`,
      );
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
  } catch (err) {
    next(err);
  }
};

const deleteTodo = (req, res, next) => {
  try {
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);

    if (index === -1) {
      throw createError(
        404,
        `Todo dengan ID '${req.params.id}' tidak ditemukan`,
      );
    }

    const deleted = todos.splice(index, 1)[0];
    writeTodos(todos);

    res.json({
      success: true,
      message: "Todo berhasil dihapus",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

// ─── HELPER ABSENSI GURU ───────────────────────────────────────

const getAbsensiGuruColumns = async () => {
  const result = await pool.query(`
    SELECT lower(column_name) AS col
    FROM information_schema.columns
    WHERE table_name = 'absensi_guru'
  `);

  return new Set(result.rows.map((row) => row.col));
};

const buildAbsensiGuruSelect = (cols) => {
  const idCol = cols.has("id_absensiguru")
    ? `id_absensiguru AS "id_absensiGuru"`
    : `id AS "id_absensiGuru"`;

  const namaCol = cols.has("nama_guru")
    ? `nama_guru AS "namaGuru"`
    : cols.has("namaguru")
      ? `namaguru AS "namaGuru"`
      : `'Unknown' AS "namaGuru"`;

  const mapelCol = cols.has("mata_pelajaran")
    ? `mata_pelajaran AS "mataPelajaran"`
    : cols.has("matapelajaran")
      ? `matapelajaran AS "mataPelajaran"`
      : `'-' AS "mataPelajaran"`;

  const jamCol = cols.has("jam_masuk")
    ? `jam_masuk AS "jamMasuk"`
    : cols.has("jammasuk")
      ? `jammasuk AS "jamMasuk"`
      : `NULL AS "jamMasuk"`;

  return `
    ${idCol},
    user_id,
    ${namaCol},
    ${mapelCol},
    ${jamCol},
    tanggal,
    foto,
    status,
    keterangan,
    created_at,
    updated_at
  `;
};

const buildAbsensiGuruInsertCols = (cols) => {
  const namaCol = cols.has("nama_guru") ? "nama_guru" : "namaguru";
  const mapelCol = cols.has("mata_pelajaran")
    ? "mata_pelajaran"
    : "matapelajaran";
  const jamCol = cols.has("jam_masuk") ? "jam_masuk" : "jammasuk";
  const idColPart = cols.has("id_absensiguru") ? ", id_absensiguru" : "";
  const idValPart = cols.has("id_absensiguru") ? ", gen_random_uuid()" : "";

  return { namaCol, mapelCol, jamCol, idColPart, idValPart };
};

// ─── 5.1 ABSENSI GURU ──────────────────────────────────────────

const getAllAbsensiGuru = async (req, res, next) => {
  try {
    if (!hasRole(req, ["guru-mapel", "kepala-sekolah"])) {
      throw createError(403, "Tidak memiliki akses ke absensi guru");
    }

    const cols = await getAbsensiGuruColumns();
    const selectClause = buildAbsensiGuruSelect(cols);

    const params = [];
    const filters = [];

    if (hasRole(req, ["guru-mapel"]) && !hasRole(req, ["kepala-sekolah"])) {
      params.push(getUserId(req));
      filters.push(`user_id = $${params.length}`);
    }

    if (req.query.tanggal) {
      params.push(req.query.tanggal);
      filters.push(`tanggal = $${params.length}`);
    }

    if (req.query.status) {
      params.push(req.query.status);
      filters.push(`status = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const orderBy = cols.has("jam_masuk")
      ? "jam_masuk"
      : cols.has("jammasuk")
        ? "jammasuk"
        : "created_at";

    const result = await pool.query(
      `
      SELECT ${selectClause}
      FROM absensi_guru
      ${where}
      ORDER BY tanggal DESC, ${orderBy} DESC NULLS LAST
      `,
      params,
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

const getAbsensiGuruById = async (req, res, next) => {
  try {
    const cols = await getAbsensiGuruColumns();
    const selectClause = buildAbsensiGuruSelect(cols);

    const idWhere = cols.has("id_absensiguru")
      ? `id_absensiguru::text = $1`
      : `id::text = $1`;

    const result = await pool.query(
      `
      SELECT ${selectClause}
      FROM absensi_guru
      WHERE ${idWhere}
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      throw createError(404, "Absensi guru tidak ditemukan");
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const createAbsensiGuru = async (req, res, next) => {
  try {
    if (!hasRole(req, ["guru-mapel", "kepala-sekolah"])) {
      throw createError(
        403,
        "Hanya guru-mapel atau kepala-sekolah yang dapat mengisi absensi",
      );
    }

    const foto =
      req.body.foto ||
      req.body.fotoBase64 ||
      req.body.image ||
      req.body.photo ||
      null;

    const keterangan = req.body.keterangan || "";

    const userId = getUserId(req);

    if (!userId) {
      throw createError(401, "Identitas user tidak ditemukan dari token");
    }

    if (!foto) {
      throw createError(
        400,
        "Foto absensi wajib dikirim. Pastikan frontend mengirim field 'foto'.",
      );
    }

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );

    const hari = now.getDay();

    if (hari === 0 || hari === 6) {
      throw createError(400, "Absensi hanya dibuka Senin sampai Jumat");
    }

    const jam = now.getHours();
    const menit = now.getMinutes();

    if (jam > 20 || (jam === 20 && menit > 30)) {
      throw createError(
        400,
        "Absensi sudah ditutup. Batas absensi pukul 20.30 WIB",
      );
    }

    const tanggal = now.toISOString().slice(0, 10);

    const existing = await pool.query(
      "SELECT 1 FROM absensi_guru WHERE user_id = $1 AND tanggal = $2",
      [userId, tanggal],
    );

    if (existing.rowCount > 0) {
      throw createError(409, "Anda sudah melakukan absensi pada tanggal ini");
    }

    const cols = await getAbsensiGuruColumns();
    const { namaCol, mapelCol, jamCol, idColPart, idValPart } =
      buildAbsensiGuruInsertCols(cols);
    const selectClause = buildAbsensiGuruSelect(cols);

    const result = await pool.query(
      `
      INSERT INTO absensi_guru (
        user_id,
        ${namaCol},
        ${mapelCol},
        ${jamCol},
        tanggal,
        foto,
        status,
        keterangan
        ${idColPart}
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8${idValPart})
      RETURNING ${selectClause}
      `,
      [userId, getUserName(req), "-", now, tanggal, foto, "hadir", keterangan],
    );

    return res.status(201).json({
      success: true,
      message: "Absensi guru berhasil dicatat",
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

const updateAbsensiGuru = async (req, res, next) => {
  try {
    if (!hasRole(req, ["kepala-sekolah"])) {
      throw createError(
        403,
        "Hanya kepala-sekolah yang dapat mengubah absensi guru",
      );
    }

    const { status, keterangan, foto } = req.body;

    const updates = [];
    const params = [];

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    if (keterangan !== undefined) {
      params.push(keterangan);
      updates.push(`keterangan = $${params.length}`);
    }

    if (foto !== undefined) {
      params.push(foto);
      updates.push(`foto = $${params.length}`);
    }

    if (updates.length === 0) {
      throw createError(400, "Tidak ada field yang diubah");
    }

    updates.push("updated_at = NOW()");

    const cols = await getAbsensiGuruColumns();
    const selectClause = buildAbsensiGuruSelect(cols);

    params.push(req.params.id);

    const idWhere = cols.has("id_absensiguru")
      ? `id_absensiguru::text = $${params.length}`
      : `id::text = $${params.length}`;

    const result = await pool.query(
      `
      UPDATE absensi_guru
      SET ${updates.join(", ")}
      WHERE ${idWhere}
      RETURNING ${selectClause}
      `,
      params,
    );

    if (result.rowCount === 0) {
      throw createError(404, "Absensi guru tidak ditemukan");
    }

    res.json({
      success: true,
      message: "Absensi guru berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

const deleteAbsensiGuru = async (req, res, next) => {
  try {
    if (!hasRole(req, ["kepala-sekolah"])) {
      throw createError(
        403,
        "Hanya kepala-sekolah yang dapat menghapus absensi guru",
      );
    }

    const cols = await getAbsensiGuruColumns();

    const idWhere = cols.has("id_absensiguru")
      ? `id_absensiguru::text = $1`
      : `id::text = $1`;

    const result = await pool.query(
      `
      DELETE FROM absensi_guru
      WHERE ${idWhere}
      RETURNING *
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      throw createError(404, "Absensi guru tidak ditemukan");
    }

    res.json({
      success: true,
      message: "Absensi guru berhasil dihapus",
    });
  } catch (err) {
    next(err);
  }
};

// ─── 5.2 CATATAN MENGAJAR ──────────────────────────────────────

const getCatatanMengajar = async (req, res) => {
  try {
    const params = [];
    const filters = [];

    if (
      hasRole(req, ["guru-mapel"]) &&
      !hasRole(req, ["kepala-sekolah", "waka-sekolah"])
    ) {
      params.push(getUserId(req));
      filters.push(`guru_id = $${params.length}`);
    }

    if (req.query.guru_id) {
      params.push(req.query.guru_id);
      filters.push(`guru_id = $${params.length}`);
    }

    if (req.query.kelas_id) {
      params.push(req.query.kelas_id);
      filters.push(`kelas_id = $${params.length}`);
    }

    if (req.query.tanggal) {
      params.push(req.query.tanggal);
      filters.push(`tanggal = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(
      `
      SELECT *
      FROM catatan_mengajar
      ${where}
      ORDER BY tanggal DESC, id DESC
      `,
      params,
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("[getCatatanMengajar]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCatatanMengajarById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM catatan_mengajar WHERE id = $1",
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Catatan mengajar tidak ditemukan",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[getCatatanMengajarById]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCatatanMengajar = async (req, res) => {
  try {
    if (!hasRole(req, ["guru-mapel"])) {
      return res.status(403).json({
        success: false,
        message: "Hanya guru-mapel yang dapat membuat catatan mengajar",
      });
    }

    const {
      kelas_id,
      mapel_id,
      mata_pelajaran,
      tanggal,
      jam_mulai,
      jam_selesai,
      materi,
      metode,
      kendala,
      tindak_lanjut,
    } = req.body;

    if (!materi) {
      return res.status(400).json({
        success: false,
        message: "materi wajib diisi",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO catatan_mengajar (
        guru_id,
        nama_guru,
        kelas_id,
        mapel_id,
        mata_pelajaran,
        tanggal,
        jam_mulai,
        jam_selesai,
        materi,
        metode,
        kendala,
        tindak_lanjut
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        getUserId(req),
        getUserName(req),
        kelas_id || null,
        mapel_id || null,
        mata_pelajaran || null,
        tanggal || new Date(),
        jam_mulai || null,
        jam_selesai || null,
        materi,
        metode || null,
        kendala || null,
        tindak_lanjut || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Catatan mengajar berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[createCatatanMengajar]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCatatanMengajar = async (req, res) => {
  try {
    if (!hasRole(req, ["guru-mapel"])) {
      return res.status(403).json({
        success: false,
        message: "Hanya guru-mapel yang dapat mengubah catatan mengajar",
      });
    }

    const result = await pool.query(
      `
      UPDATE catatan_mengajar
      SET
        kelas_id = $1,
        mapel_id = $2,
        mata_pelajaran = $3,
        tanggal = $4,
        jam_mulai = $5,
        jam_selesai = $6,
        materi = $7,
        metode = $8,
        kendala = $9,
        tindak_lanjut = $10,
        updated_at = NOW()
      WHERE id = $11
        AND guru_id = $12
      RETURNING *
      `,
      [
        req.body.kelas_id || null,
        req.body.mapel_id || null,
        req.body.mata_pelajaran || null,
        req.body.tanggal || new Date(),
        req.body.jam_mulai || null,
        req.body.jam_selesai || null,
        req.body.materi,
        req.body.metode || null,
        req.body.kendala || null,
        req.body.tindak_lanjut || null,
        req.params.id,
        getUserId(req),
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Catatan tidak ditemukan atau bukan milik guru ini",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[updateCatatanMengajar]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCatatanMengajar = async (req, res) => {
  try {
    if (!hasRole(req, ["guru-mapel"])) {
      return res.status(403).json({
        success: false,
        message: "Hanya guru-mapel yang dapat menghapus catatan mengajar",
      });
    }

    const result = await pool.query(
      "DELETE FROM catatan_mengajar WHERE id = $1 AND guru_id = $2 RETURNING *",
      [req.params.id, getUserId(req)],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Catatan tidak ditemukan atau bukan milik guru ini",
      });
    }

    res.json({
      success: true,
      message: "Catatan mengajar berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteCatatanMengajar]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 5.3 EVALUASI GURU ─────────────────────────────────────────

const getEvaluasiGuru = async (req, res) => {
  try {
    if (!hasRole(req, ["kepala-sekolah", "waka-sekolah"])) {
      return res.status(403).json({
        success: false,
        message:
          "Hanya kepala-sekolah atau waka-sekolah yang dapat melihat evaluasi guru",
      });
    }

    const result = await pool.query(
      "SELECT * FROM evaluasi_guru ORDER BY created_at DESC, id DESC",
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("[getEvaluasiGuru]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getEvaluasiGuruById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM evaluasi_guru WHERE id = $1",
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Evaluasi guru tidak ditemukan",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[getEvaluasiGuruById]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const createEvaluasiGuru = async (req, res) => {
  try {
    if (!hasRole(req, ["kepala-sekolah", "waka-sekolah"])) {
      return res.status(403).json({
        success: false,
        message:
          "Hanya kepala-sekolah atau waka-sekolah yang dapat membuat evaluasi guru",
      });
    }

    const { guru_id, nama_guru, mapel, semester, status, skor, catatan } =
      req.body;

    if (!nama_guru) {
      return res.status(400).json({
        success: false,
        message: "nama_guru wajib diisi",
      });
    }

    const roles = getRoles(req);
    const evaluatorRole = roles.includes("kepala-sekolah")
      ? "kepala-sekolah"
      : "waka-sekolah";

    const result = await pool.query(
      `
      INSERT INTO evaluasi_guru (
        guru_id,
        nama_guru,
        mapel,
        semester,
        evaluator_id,
        evaluator_nama,
        evaluator_role,
        status,
        skor,
        catatan
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        guru_id || null,
        nama_guru,
        mapel || null,
        semester || null,
        getUserId(req),
        getUserName(req),
        evaluatorRole,
        status || "selesai",
        skor || null,
        catatan || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Evaluasi guru berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[createEvaluasiGuru]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateEvaluasiGuru = async (req, res) => {
  try {
    if (!hasRole(req, ["kepala-sekolah", "waka-sekolah"])) {
      return res.status(403).json({
        success: false,
        message:
          "Hanya kepala-sekolah atau waka-sekolah yang dapat mengubah evaluasi guru",
      });
    }

    const result = await pool.query(
      `
      UPDATE evaluasi_guru
      SET
        nama_guru = $1,
        mapel = $2,
        semester = $3,
        status = $4,
        skor = $5,
        catatan = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        req.body.nama_guru,
        req.body.mapel || null,
        req.body.semester || null,
        req.body.status || "selesai",
        req.body.skor || null,
        req.body.catatan || null,
        req.params.id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Evaluasi guru tidak ditemukan",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[updateEvaluasiGuru]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteEvaluasiGuru = async (req, res) => {
  try {
    if (!hasRole(req, ["kepala-sekolah", "waka-sekolah"])) {
      return res.status(403).json({
        success: false,
        message:
          "Hanya kepala-sekolah atau waka-sekolah yang dapat menghapus evaluasi guru",
      });
    }

    const result = await pool.query(
      "DELETE FROM evaluasi_guru WHERE id = $1 RETURNING *",
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Evaluasi guru tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Evaluasi guru berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteEvaluasiGuru]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 5.4 PERANGKAT PEMBELAJARAN ───────────────────────────────

const getAllPerangkat = async (req, res) => {
  const guruId = getUserId(req);
  const canReview = hasRole(req, ["kepala-sekolah", "waka-sekolah"]);
  const { status_review, jenis_dokumen, search } = req.query;

  try {
    const params = [];
    let query = `
      SELECT
        id,
        guru_id,
        nama_guru,
        nama_dokumen,
        jenis_dokumen,
        file_name,
        file_mime,
        COALESCE(status_review, 'menunggu') AS status_review,
        catatan_review,
        reviewed_by,
        reviewed_at,
        COALESCE(versi, 1) AS versi,
        parent_id,
        to_char(tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload
      FROM perangkat_pembelajaran
      WHERE 1=1
    `;

    if (!canReview) {
      params.push(guruId);
      query += ` AND guru_id = $${params.length}`;
    }

    if (status_review) {
      params.push(status_review);
      query += ` AND COALESCE(status_review, 'menunggu') = $${params.length}`;
    }

    if (jenis_dokumen) {
      params.push(jenis_dokumen);
      query += ` AND jenis_dokumen = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (nama_dokumen ILIKE $${params.length} OR COALESCE(nama_guru, '') ILIKE $${params.length})`;
    }

    query += ` ORDER BY tanggal_upload DESC, id DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getAllPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const uploadPerangkat = async (req, res) => {
  const guruId = getUserId(req);

  if (!hasRole(req, ["guru-mapel"])) {
    return res.status(403).json({
      success: false,
      message: "Hanya guru-mapel yang dapat upload perangkat pembelajaran",
    });
  }

  try {
    await runMulter(req, res);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const { nama_dokumen, jenis_dokumen, parent_id, nama_guru } = req.body;

  if (!guruId) {
    return res.status(401).json({
      success: false,
      message: "Identitas guru tidak ditemukan",
    });
  }

  if (!nama_dokumen || !jenis_dokumen) {
    return res.status(400).json({
      success: false,
      message: "Nama dokumen dan jenis dokumen wajib diisi",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File wajib diunggah",
    });
  }

  try {
    let versi = 1;
    const resolvedParentId = parent_id ? parseInt(parent_id, 10) : null;

    if (resolvedParentId) {
      const vRes = await pool.query(
        `
        SELECT COALESCE(MAX(versi), 1) + 1 AS next_versi
        FROM perangkat_pembelajaran
        WHERE parent_id = $1 OR id = $1
        `,
        [resolvedParentId],
      );

      versi = vRes.rows[0]?.next_versi || 2;
    }

    const result = await pool.query(
      `
      INSERT INTO perangkat_pembelajaran (
        guru_id,
        nama_guru,
        nama_dokumen,
        jenis_dokumen,
        file_name,
        file_data,
        file_mime,
        status_review,
        versi,
        parent_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'menunggu',$8,$9)
      RETURNING
        id,
        guru_id,
        nama_guru,
        nama_dokumen,
        jenis_dokumen,
        file_name,
        file_mime,
        status_review,
        versi,
        parent_id,
        to_char(tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload
      `,
      [
        guruId,
        nama_guru || getUserName(req),
        nama_dokumen.trim(),
        jenis_dokumen,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype,
        versi,
        resolvedParentId,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Perangkat pembelajaran berhasil diupload",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[uploadPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const downloadPerangkat = async (req, res) => {
  const isView = req.path.endsWith("/view");

  try {
    const result = await pool.query(
      `
      SELECT file_name, file_data, file_mime
      FROM perangkat_pembelajaran
      WHERE id = $1
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan",
      });
    }

    const doc = result.rows[0];
    const mime = doc.file_mime || "application/octet-stream";

    res.set("Content-Type", mime);
    res.set(
      "Content-Disposition",
      `${isView ? "inline" : "attachment"}; filename="${doc.file_name}"`,
    );

    res.send(doc.file_data);
  } catch (err) {
    console.error("[downloadPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePerangkat = async (req, res) => {
  const guruId = getUserId(req);
  const canDeleteAll = hasRole(req, ["kepala-sekolah", "waka-sekolah"]);

  try {
    const check = await pool.query(
      "SELECT guru_id FROM perangkat_pembelajaran WHERE id = $1",
      [req.params.id],
    );

    if (check.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan",
      });
    }

    if (!canDeleteAll && String(check.rows[0].guru_id) !== String(guruId)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    await pool.query("DELETE FROM perangkat_pembelajaran WHERE id = $1", [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Dokumen berhasil dihapus",
    });
  } catch (err) {
    console.error("[deletePerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 5.5 REVIEW KEPALA SEKOLAH ─────────────────────────────────

const reviewPerangkatKepsek = async (req, res) => {
  if (!hasRole(req, ["kepala-sekolah"])) {
    return res.status(403).json({
      success: false,
      message: "Hanya kepala-sekolah yang dapat mereview dokumen",
    });
  }

  const { status, catatan } = req.body;
  const allowedStatus = ["disetujui", "revisi", "ditolak"];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status harus salah satu dari: ${allowedStatus.join(", ")}`,
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE perangkat_pembelajaran
      SET
        status_review = $1,
        catatan_review = $2,
        reviewed_by = $3,
        reviewed_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [status, catatan || null, getUserName(req), req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan",
      });
    }

    await pool.query(
      `
      INSERT INTO review_kepsek (
        perangkat_id,
        status,
        komentar,
        kepsek_id,
        kepsek_nama,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,NOW())
      `,
      [
        req.params.id,
        status,
        catatan || null,
        getUserId(req),
        getUserName(req),
      ],
    );

    res.json({
      success: true,
      message: "Review kepala sekolah berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[reviewPerangkatKepsek]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Alias supaya route lama / kode lama tetap aman
const reviewPerangkat = reviewPerangkatKepsek;

// ─── 5.6 REVIEW WAKA SEKOLAH ───────────────────────────────────

const reviewPerangkatWakasek = async (req, res) => {
  if (!hasRole(req, ["waka-sekolah"])) {
    return res.status(403).json({
      success: false,
      message: "Hanya waka-sekolah yang dapat mereview dokumen",
    });
  }

  const { status, catatan } = req.body;
  const allowedStatus = ["disetujui", "revisi", "ditolak"];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status harus salah satu dari: ${allowedStatus.join(", ")}`,
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE perangkat_pembelajaran
      SET
        status_review = $1,
        catatan_review = $2,
        reviewed_by = $3,
        reviewed_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [status, catatan || null, getUserName(req), req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan",
      });
    }

    await pool.query(
      `
      INSERT INTO review_wakasek (
        perangkat_id,
        status,
        komentar,
        wakasek_id,
        wakasek_nama,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,NOW())
      `,
      [
        req.params.id,
        status,
        catatan || null,
        getUserId(req),
        getUserName(req),
      ],
    );

    res.json({
      success: true,
      message: "Review waka sekolah berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[reviewPerangkatWakasek]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RIWAYAT REVIEW & VERSI ────────────────────────────────────

const getRiwayatReview = async (req, res) => {
  try {
    const id = req.params.id;

    const kepsekRes = await pool.query(
      `
      SELECT
        'kepala-sekolah' AS reviewer_role,
        r.id,
        r.perangkat_id,
        r.status,
        r.komentar,
        r.kepsek_id AS reviewer_id,
        r.kepsek_nama AS reviewer_nama,
        r.created_at
      FROM review_kepsek r
      WHERE r.perangkat_id = $1
      `,
      [id],
    );

    const wakasekRes = await pool.query(
      `
      SELECT
        'waka-sekolah' AS reviewer_role,
        r.id,
        r.perangkat_id,
        r.status,
        r.komentar,
        r.wakasek_id AS reviewer_id,
        r.wakasek_nama AS reviewer_nama,
        r.created_at
      FROM review_wakasek r
      WHERE r.perangkat_id = $1
      `,
      [id],
    );

    const data = [...kepsekRes.rows, ...wakasekRes.rows].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("[getRiwayatReview]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getVersiDokumen = async (req, res) => {
  try {
    const id = req.params.id;

    const docRes = await pool.query(
      "SELECT id, parent_id FROM perangkat_pembelajaran WHERE id = $1",
      [id],
    );

    if (docRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan",
      });
    }

    const rootId = docRes.rows[0].parent_id || id;

    const result = await pool.query(
      `
      SELECT
        id,
        nama_dokumen,
        jenis_dokumen,
        file_name,
        file_mime,
        COALESCE(status_review, 'menunggu') AS status_review,
        catatan_review,
        reviewed_by,
        reviewed_at,
        COALESCE(versi, 1) AS versi,
        parent_id,
        nama_guru,
        to_char(tanggal_upload, 'YYYY-MM-DD HH24:MI') AS tanggal_upload
      FROM perangkat_pembelajaran
      WHERE id = $1 OR parent_id = $1
      ORDER BY versi ASC
      `,
      [rootId],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getVersiDokumen]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,

  getAllAbsensiGuru,
  getAbsensiGuruById,
  createAbsensiGuru,
  updateAbsensiGuru,
  deleteAbsensiGuru,

  getCatatanMengajar,
  getCatatanMengajarById,
  createCatatanMengajar,
  updateCatatanMengajar,
  deleteCatatanMengajar,

  getEvaluasiGuru,
  getEvaluasiGuruById,
  createEvaluasiGuru,
  updateEvaluasiGuru,
  deleteEvaluasiGuru,

  getAllPerangkat,
  uploadPerangkat,
  downloadPerangkat,
  deletePerangkat,

  reviewPerangkat,
  reviewPerangkatKepsek,
  reviewPerangkatWakasek,
  getRiwayatReview,
  getVersiDokumen,
};
