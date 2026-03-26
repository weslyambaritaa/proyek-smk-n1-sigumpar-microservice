import axios from "axios";

const API = axios.create({ baseURL: "/api/auth" });

// Interceptor untuk menyertakan token jika ada
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (userData) => API.post("/register", userData);
export const login = (userData) => API.post("/login", userData);
export const getMe = () => API.get("/me");
export const logout = () => {
  localStorage.removeItem("token");
  // bisa juga panggil API logout jika ada
};
