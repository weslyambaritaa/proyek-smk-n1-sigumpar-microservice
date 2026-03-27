import axiosInstance from './axiosInstance';

export const academicApi = {
  getAllKelas: () => axiosInstance.get('/api/academic/kelas'),
  createKelas: (data) => axiosInstance.post('/api/academic/kelas', data),
  updateKelas: (id, data) => axiosInstance.put(`/api/academic/kelas/${id}`, data),
  deleteKelas: (id) => axiosInstance.delete(`/api/academic/kelas/${id}`),

  // Pencarian wali kelas ke auth-service melalui gateway
  searchWaliKelas: (query) => axiosInstance.get(`/api/auth/users/search?role=wali_kelas&q=${query}`),
};