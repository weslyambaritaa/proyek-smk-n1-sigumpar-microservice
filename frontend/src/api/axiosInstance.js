import axios from 'axios';
import keycloak from '../keycloak';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      try {
        await keycloak.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        toast.error('Sesi Anda habis. Mengarahkan ke halaman login...');
        setTimeout(() => keycloak.login(), 1500);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        toast.error('Sesi Anda telah habis. Silakan login kembali.');
        setTimeout(() => {
          keycloak.login();
        }, 2000);
      } else if (error.response.status === 502) {
        toast.error('Server sedang bermasalah atau tidak dapat dijangkau.');
      }
    } else {
      toast.error('Gagal terhubung ke server.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;