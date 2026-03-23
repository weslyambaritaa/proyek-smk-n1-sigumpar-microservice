import axios from 'axios';
import keycloak from '../keycloak';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
});

// Interceptor Request: Cek dan refresh token SEBELUM dikirim
axiosInstance.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      try {
        // Update token jika sisa waktunya kurang dari 30 detik
        await keycloak.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error("Sesi habis, mengarahkan ke halaman login...");
        keycloak.login(); // Paksa login ulang jika token benar-benar mati
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hapus bagian interceptors.response karena sudah di-handle di request

export default axiosInstance;