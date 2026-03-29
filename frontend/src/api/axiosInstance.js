import axios from "axios";
import keycloak from "../keycloak";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
});

// Interceptor Request: Cek dan refresh token SEBELUM dikirim
axiosInstance.interceptors.request.use(async (config) => {
  console.log("Interceptor: keycloak object =", keycloak);
  if (keycloak && keycloak.token) {
    console.log("Token ada, menambahkan header");
    try {
      await keycloak.updateToken(30);
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (error) {
      console.error("Token refresh gagal:", error);
      toast.error("Sesi Anda habis. Mengarahkan ke halaman login...");
      setTimeout(() => keycloak.login(), 1500);
    }
  } else {
    console.warn("Token tidak ada atau keycloak undefined");
  }
  return config;
});

export default axiosInstance;
