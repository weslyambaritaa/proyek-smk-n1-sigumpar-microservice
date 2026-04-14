import axios from "axios";

const catatanMengajarClient = axios.create({
  baseURL: "/api/learning/todos",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Interceptor response untuk error handling terpusat
catatanMengajarClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Terjadi kesalahan";
    return Promise.reject(new Error(message));
  },
);

/**
 * Mengambil semua catatan mengajar dengan filter opsional
 * @param {Object} params - { userId, status, priority, search }
 */
export const fetchCatatanMengajar = async (params = {}) => {
  const { data } = await catatanMengajarClient.get("/", { params });
  return data.data;
};

export const fetchCatatanMengajarById = async (id) => {
  const { data } = await catatanMengajarClient.get(`/${id}`);
  return data.data;
};

/**
 * Membuat catatan mengajar baru
 * @param {Object} catatanData - { userId, title, description, priority }
 */
export const createCatatanMengajar = async (catatanData) => {
  const { data } = await catatanMengajarClient.post("/", catatanData);
  return data.data;
};

/**
 * Mengupdate catatan mengajar (termasuk update status)
 * @param {string} id
 * @param {Object} catatanData - { title?, description?, status?, priority? }
 */
export const updateCatatanMengajar = async (id, catatanData) => {
  const { data } = await catatanMengajarClient.put(`/${id}`, catatanData);
  return data.data;
};

export const deleteTodo = async (id) => {
  const { data } = await todosClient.delete(`/${id}`);
  return data.data;
};
