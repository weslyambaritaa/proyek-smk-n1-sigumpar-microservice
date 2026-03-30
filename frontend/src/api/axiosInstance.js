import axios from 'axios';
import keycloak from '../keycloak';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
});

// Interceptor Request: Cek dan refresh token SEBELUM dikirim
axiosInstance.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      try {
        await keycloak.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        toast.error("Sesi Anda habis. Mengarahkan ke halaman login...");
        setTimeout(() => keycloak.login(), 1500);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Tangani Error dari Backend (Token Expired / Server Mati)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Jika Backend menolak karena Token Invalid/Expired (401 atau 403)
      if (error.response.status === 401 || error.response.status === 403) {
        toast.error("Sesi Anda telah habis. Silakan login kembali.");
        // Beri waktu 2 detik agar notifikasi terbaca sebelum redirect
        setTimeout(() => {
          keycloak.login();
        }, 2000); 
      } 
      // Jika Backend mati (502 Bad Gateway)
      else if (error.response.status === 502) {
        toast.error("Server sedang bermasalah atau tidak dapat dijangkau.");
      }
    } else {
       // Jika tidak ada respon sama sekali (misal jaringan terputus)
       toast.error("Gagal terhubung ke server.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;