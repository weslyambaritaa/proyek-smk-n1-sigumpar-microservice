import axios from "axios";

const todosClient = axios.create({
  baseURL: "/api/todos",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Interceptor response untuk error handling terpusat
todosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Terjadi kesalahan";
    return Promise.reject(new Error(message));
  }
);

/**
 * Mengambil semua todos dengan filter opsional
 * @param {Object} params - { userId, status, priority, search }
 */
export const fetchTodos = async (params = {}) => {
  const { data } = await todosClient.get("/", { params });
  return data.data;
};

export const fetchTodoById = async (id) => {
  const { data } = await todosClient.get(`/${id}`);
  return data.data;
};

/**
 * Membuat todo baru
 * @param {Object} todoData - { userId, title, description, priority }
 */
export const createTodo = async (todoData) => {
  const { data } = await todosClient.post("/", todoData);
  return data.data;
};

/**
 * Mengupdate todo (termasuk update status)
 * @param {string} id
 * @param {Object} todoData - { title?, description?, status?, priority? }
 */
export const updateTodo = async (id, todoData) => {
  const { data } = await todosClient.put(`/${id}`, todoData);
  return data.data;
};

export const deleteTodo = async (id) => {
  const { data } = await todosClient.delete(`/${id}`);
  return data.data;
};