const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { createError } = require("../middleware/errorHandler");

const DATA_FILE = path.join(__dirname, "../data/todos.json");

// Helper untuk baca dan tulis file JSON
const readTodos = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeTodos = (todos) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");

/**
 * GET /todos
 * Mengambil semua todo dengan filter opsional:
 * - ?userId=xxx     => filter milik user tertentu
 * - ?status=pending => filter berdasarkan status
 * - ?priority=high  => filter berdasarkan prioritas
 * - ?search=keyword => cari di title atau description
 */
const getAllTodos = (req, res, next) => {
  try {
    let todos = readTodos();
    const { userId, status, priority, search } = req.query;

    // Terapkan semua filter secara berantai
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

/**
 * GET /todos/:id
 * Mengambil satu todo berdasarkan ID.
 */
const getTodoById = (req, res, next) => {
  try {
    const todos = readTodos();
    const todo = todos.find((t) => t.id === req.params.id);

    if (!todo) {
      throw createError(404, `Todo dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /todos
 * Membuat todo baru.
 *
 * Body yang diharapkan:
 * {
 *   "userId": "string (wajib)",
 *   "title": "string (wajib)",
 *   "description": "string (opsional)",
 *   "priority": "low | medium | high (default: medium)"
 * }
 */
const createTodo = (req, res, next) => {
  try {
    const { userId, title, description = "", priority = "medium" } = req.body;

    // Validasi field wajib
    if (!userId || !title) {
      throw createError(400, "Field 'userId' dan 'title' wajib diisi");
    }

    // Validasi nilai priority
    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
      throw createError(400, `Priority harus salah satu dari: ${allowedPriorities.join(", ")}`);
    }

    const todos = readTodos();

    const newTodo = {
      id: uuidv4(),
      userId,
      title: title.trim(),
      description: description.trim(),
      status: "pending",      // Status default selalu 'pending' saat dibuat
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

/**
 * PUT /todos/:id
 * Mengupdate todo. Mendukung update status workflow:
 * pending => in-progress => done
 */
const updateTodo = (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;
    const todos = readTodos();

    const index = todos.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      throw createError(404, `Todo dengan ID '${req.params.id}' tidak ditemukan`);
    }

    // Validasi status jika dikirim
    const allowedStatuses = ["pending", "in-progress", "done"];
    if (status && !allowedStatuses.includes(status)) {
      throw createError(400, `Status harus salah satu dari: ${allowedStatuses.join(", ")}`);
    }

    // Update hanya field yang dikirim
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

/**
 * DELETE /todos/:id
 * Menghapus todo berdasarkan ID.
 */
const deleteTodo = (req, res, next) => {
  try {
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);

    if (index === -1) {
      throw createError(404, `Todo dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const deleted = todos.splice(index, 1)[0];
    writeTodos(todos);

    res.json({ success: true, message: "Todo berhasil dihapus", data: deleted });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
};