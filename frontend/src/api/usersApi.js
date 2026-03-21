import axios from "axios";

/**
 * Instance Axios untuk Users Service
 *
 * Menggunakan baseURL relatif (/api/users) sehingga:
 * - Di development: Vite proxy meneruskan ke http://localhost:80/api/users
 * - Di production: request langsung ke /api/users (same origin)
 */
const usersClient = axios.create({
  baseURL: "/api/users",
  timeout: 10000, // Timeout 10 detik — tidak akan hang selamanya
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor Request: Dijalankan SEBELUM setiap request dikirim
 * Berguna untuk menambahkan token auth, logging, dll.
 */
usersClient.interceptors.request.use(
  (config) => {
    // Contoh: tambahkan auth token jika ada
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor Response: Dijalankan SETELAH setiap response diterima
 * Berguna untuk handling error global, refresh token, dll.
 */
usersClient.interceptors.response.use(
  (response) => response, // Response sukses: langsung diteruskan
  (error) => {
    // Transformasi error message agar lebih user-friendly
    const message =
      error.response?.data?.message || error.message || "Terjadi kesalahan";
    return Promise.reject(new Error(message));
  }
);

// ── API Functions ────────────────────────────────────────────────

/**
 * Mengambil semua users dengan filter opsional
 * @param {Object} params - Query params: { search, role }
 * @returns {Promise<Array>} Array of users
 */
export const fetchUsers = async (params = {}) => {
  const { data } = await usersClient.get("/", { params });
  return data.data; // Ambil hanya array data dari response
};

/**
 * Mengambil satu user berdasarkan ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const fetchUserById = async (id) => {
  const { data } = await usersClient.get(`/${id}`);
  return data.data;
};

/**
 * Membuat user baru
 * @param {Object} userData - { name, email, role }
 * @returns {Promise<Object>} User yang baru dibuat
 */
export const createUser = async (userData) => {
  const { data } = await usersClient.post("/", userData);
  return data.data;
};

/**
 * Mengupdate user
 * @param {string} id
 * @param {Object} userData - Field yang akan diupdate
 * @returns {Promise<Object>}
 */
export const updateUser = async (id, userData) => {
  const { data } = await usersClient.put(`/${id}`, userData);
  return data.data;
};

/**
 * Menghapus user
 * @param {string} id
 * @returns {Promise<Object>} Data user yang dihapus
 */
export const deleteUser = async (id) => {
  const { data } = await usersClient.delete(`/${id}`);
  return data.data;
};