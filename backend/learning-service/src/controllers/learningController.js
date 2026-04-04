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

const getAllPerangkat = async (req, res) => {
  const guruId = req.user?.sub || req.user?.id || req.user?.userId;
  try {
    const result = await pool.query(
      `SELECT id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
              to_char(tanggal_upload, 'YYYY-MM-DD') AS tanggal_upload
       FROM perangkat_pembelajaran
       WHERE ($1::uuid IS NULL OR guru_id = $1)
       ORDER BY tanggal_upload DESC, id DESC`,
      [guruId || null]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error("[getAllPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const uploadPerangkat = async (req, res) => {
  const guruId = req.user?.sub || req.user?.id || req.user?.userId;
  try {
    await runMulter(req, res);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  const { nama_dokumen, jenis_dokumen } = req.body;
  if (!guruId) return res.status(401).json({ success: false, message: "Identitas guru tidak ditemukan" });
  if (!nama_dokumen || !jenis_dokumen) {
    return res.status(400).json({ success: false, message: "Nama dokumen dan jenis dokumen wajib diisi" });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: "File wajib diunggah (PDF/DOCX)" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO perangkat_pembelajaran
       (guru_id, nama_dokumen, jenis_dokumen, file_name, file_data, file_mime)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
                 to_char(tanggal_upload, 'YYYY-MM-DD') AS tanggal_upload`,
      [guruId, nama_dokumen.trim(), jenis_dokumen, req.file.originalname, req.file.buffer, req.file.mimetype]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[uploadPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const downloadPerangkat = async (req, res) => {
  const guruId = req.user?.sub || req.user?.id || req.user?.userId;
  const isView = req.path.endsWith('/view');
  try {
    const result = await pool.query(
      "SELECT file_name, file_data, file_mime, guru_id FROM perangkat_pembelajaran WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });
    const doc = result.rows[0];
    const mime = doc.file_mime || "application/octet-stream";
    res.set("Content-Type", mime);
    // Inline untuk preview, attachment untuk download
    if (isView) {
      res.set("Content-Disposition", `inline; filename="${doc.file_name}"`);
    } else {
      res.set("Content-Disposition", `attachment; filename="${doc.file_name}"`);
    }
    res.send(doc.file_data);
  } catch (err) {
    console.error("[downloadPerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePerangkat = async (req, res) => {
  const guruId = req.user?.sub || req.user?.id || req.user?.userId;
  try {
    const check = await pool.query("SELECT guru_id FROM perangkat_pembelajaran WHERE id = $1", [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan" });
    if (guruId && String(check.rows[0].guru_id) !== String(guruId)) {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }
    await pool.query("DELETE FROM perangkat_pembelajaran WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Dokumen berhasil dihapus" });
  } catch (err) {
    console.error("[deletePerangkat]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo,
  getAllPerangkat, uploadPerangkat, downloadPerangkat, deletePerangkat,
};
