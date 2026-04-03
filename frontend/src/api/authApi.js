// frontend/src/api/authApi.js
import axiosInstance from "./axiosInstance";

export const authApi = {
  // Ambil daftar user
  fetchUsers: async () => {
    const response = await axiosInstance.get("/api/auth");
    return response.data;
  },

  // Buat user baru
  createUser: async (userData) => {
    const response = await axiosInstance.post("/api/auth", userData);
    return response.data;
  },

  // Hapus user
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/api/auth/${id}`);
    return response.data;
  },

  // Verifikasi token / sesi login
  verifyToken: async () => {
    const response = await axiosInstance.get("/api/auth/verify");
    return response.data;
  },
};

// Optional: tetap support export lama kalau di komponen masih pakai named export
export const fetchUsers = authApi.fetchUsers;
export const createUser = authApi.createUser;
export const deleteUser = authApi.deleteUser;
export const verifyToken = authApi.verifyToken;

export default authApi;