import { useEffect, useState } from "react";
import useTodos from "../hooks/useTodos";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

/**
 * Halaman manajemen Todos.
 * Mendukung filter status dan prioritas, serta update status langsung dari card.
 */
const TodosPage = () => {
  const { todos, loading, error, loadTodos, addTodo, editTodo, removeTodo } =
    useTodos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    userId: "u-001", // Default userId (biasanya dari auth context)
    title: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleOpenCreate = () => {
    setSelectedTodo(null);
    setFormData({ userId: "u-001", title: "", description: "", priority: "medium" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (todo) => {
    setSelectedTodo(todo);
    setFormData({
      userId: todo.userId,
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTodo(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      if (selectedTodo) {
        await editTodo(selectedTodo.id, formData);
      } else {
        await addTodo(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err.message);
    }
  };

  /**
   * Update status todo secara langsung dari tombol di card
   * tanpa perlu membuka modal edit
   */
  const handleStatusChange = async (todo, newStatus) => {
    try {
      await editTodo(todo.id, { status: newStatus });
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (todo) => {
    if (!window.confirm(`Hapus todo "${todo.title}"?`)) return;
    try {
      await removeTodo(todo.id);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleFilter = () => {
    loadTodos({ status: statusFilter, priority: priorityFilter, search });
  };

  const handleReset = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setSearch("");
    loadTodos();
  };

  // Helper: mapping status ke Badge variant dan label
  const statusConfig = {
    pending: { variant: "warning", label: "Pending" },
    "in-progress": { variant: "info", label: "In Progress" },
    done: { variant: "success", label: "Done" },
  };

  const priorityConfig = {
    low: { variant: "default", label: "Low" },
    medium: { variant: "warning", label: "Medium" },
    high: { variant: "danger", label: "High" },
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Todos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: {todos.length} todo
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary">
          + Tambah Todo
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari judul todo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Prioritas</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button onClick={handleFilter} variant="primary" size="sm">Cari</Button>
        <Button onClick={handleReset} variant="ghost" size="sm">Reset</Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      )}

      {/* Empty state */}
      {!loading && todos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">✅</p>
          <p className="font-medium">Belum ada todo</p>
          <p className="text-sm mt-1">Klik "Tambah Todo" untuk memulai</p>
        </div>
      )}

      {/* Grid card todos */}
      {!loading && todos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 flex-1 pr-2 leading-snug">
                  {todo.title}
                </h3>
                <Badge variant={priorityConfig[todo.priority]?.variant}>
                  {priorityConfig[todo.priority]?.label}
                </Badge>
              </div>

              {/* Deskripsi */}
              {todo.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {todo.description}
                </p>
              )}

              {/* Status badge */}
              <div className="mb-3">
                <Badge variant={statusConfig[todo.status]?.variant}>
                  {statusConfig[todo.status]?.label}
                </Badge>
              </div>

              {/* Status workflow buttons */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {todo.status !== "in-progress" && todo.status !== "done" && (
                  <button
                    onClick={() => handleStatusChange(todo, "in-progress")}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    → Mulai
                  </button>
                )}
                {todo.status !== "done" && (
                  <button
                    onClick={() => handleStatusChange(todo, "done")}
                    className="text-xs text-green-600 hover:underline"
                  >
                    ✓ Selesai
                  </button>
                )}
                {todo.status === "done" && (
                  <button
                    onClick={() => handleStatusChange(todo, "pending")}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    ↺ Reset
                  </button>
                )}
              </div>

              {/* Card footer */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {new Date(todo.createdAt).toLocaleDateString("id-ID")}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(todo)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(todo)}>
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedTodo ? "Edit Todo" : "Tambah Todo Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Masukkan judul todo"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Deskripsi opsional..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioritas
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Menyimpan..." : selectedTodo ? "Simpan" : "Buat Todo"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TodosPage;