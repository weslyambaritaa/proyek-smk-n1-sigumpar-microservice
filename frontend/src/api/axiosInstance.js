import axios from "axios";
import keycloak from "../keycloak";
import toast from "react-hot-toast";

// Ambil URL API dari env.
// Gunakan gateway sebagai satu pintu masuk, mis. http://localhost:8001
const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:8001").replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Supaya toast tidak spam berulang
let isRedirectingToLogin = false;

const redirectToLoginOnce = (message = "Sesi Anda habis. Mengarahkan ke halaman login...") => {
  if (isRedirectingToLogin) return;

  isRedirectingToLogin = true;
  toast.error(message);

  setTimeout(() => {
    keycloak.login();
  }, 1500);
};

// Interceptor Request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Pastikan config.headers selalu ada
      config.headers = config.headers || {};

      // Kalau user sudah login via keycloak, refresh token dulu
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);

        if (keycloak.token) {
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
      }

      return config;
    } catch (error) {
      // Kalau refresh token gagal, batalkan request
      redirectToLoginOnce();
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Interceptor Response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        redirectToLoginOnce("Sesi Anda telah habis. Silakan login kembali.");
      } else if (status === 500) {
        toast.error("Server mengalami kesalahan internal.");
      } else if (status === 502) {
        toast.error("Gateway tidak bisa menjangkau service backend.");
      } else if (status === 503) {
        toast.error("Service backend sedang tidak tersedia.");
      } else if (status === 504) {
        toast.error("Server terlalu lama merespons.");
      }
    } else if (error.request) {
      // Request terkirim tapi tidak ada response
      toast.error("Gagal terhubung ke server. Periksa apakah API gateway aktif.");
    } else {
      // Error saat setup request
      toast.error("Terjadi kesalahan saat menyiapkan request.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;