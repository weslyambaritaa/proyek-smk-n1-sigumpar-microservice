import axios from 'axios';
import keycloak from '../keycloak';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
});

// Interceptor untuk menyisipkan Token otomatis
axiosInstance.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani token kadaluarsa
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Jika token mati, coba refresh otomatis
      await keycloak.updateToken(30);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;