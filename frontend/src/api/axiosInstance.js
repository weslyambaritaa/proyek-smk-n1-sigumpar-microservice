import axios from 'axios';
import keycloak from '../keycloak';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
});

// Interceptor untuk menyuntikkan Token JWT otomatis
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

// Interceptor untuk menangani error global (misal: token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      keycloak.login(); // Paksa login ulang jika unauthorized
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;