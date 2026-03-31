import axios from "axios";
import keycloak from "../keycloak";
import toast from "react-hot-toast";

// PENTING: Jangan set baseURL di sini!
// Saat dev (docker): Vite proxy otomatis forward /api → http://api-gateway:80
// Saat production: VITE_API_URL bisa diset via env
const baseURL = import.meta.env.VITE_API_URL || "";

const axiosInstance = axios.create({
  baseURL,
});

// Mencegah spam notifikasi toast yang sama
let isRedirecting = false;
const shownErrors = new Set();

// Interceptor Request: Refresh token SEBELUM dikirim
axiosInstance.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated && keycloak.token) {
      try {
        await keycloak.updateToken(60);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error("Gagal refresh token:", error);
        if (!isRedirecting) {
          isRedirecting = true;
          toast.error("Sesi habis. Mengarahkan ke halaman login...");
          setTimeout(() => keycloak.login(), 1500);
        }
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor Response: Tangani Error dari Backend
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const errorKey = `${status}-${url}`;

    if (status === 401 || status === 403) {
      if (!isRedirecting) {
        isRedirecting = true;
        toast.error("Sesi Anda telah habis. Silakan login kembali.");
        setTimeout(() => {
          isRedirecting = false;
          keycloak.login();
        }, 2000);
      }
    } else if (status === 502 || status === 503) {
      if (!shownErrors.has(errorKey)) {
        shownErrors.add(errorKey);
        toast.error("Server sedang bermasalah. Coba lagi nanti.");
        setTimeout(() => shownErrors.delete(errorKey), 5000);
      }
    } else if (!error.response) {
      // ERR_CONNECTION_REFUSED / network error
      if (!shownErrors.has("network")) {
        shownErrors.add("network");
        toast.error(
          "Gagal terhubung ke API Gateway. Pastikan Docker sudah berjalan.",
        );
        setTimeout(() => shownErrors.delete("network"), 5000);
      }
    } else if (status !== 404) {
      if (!shownErrors.has(errorKey)) {
        shownErrors.add(errorKey);
        const msg =
          error.response?.data?.message || "Terjadi kesalahan pada server.";
        toast.error(msg);
        setTimeout(() => shownErrors.delete(errorKey), 5000);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
