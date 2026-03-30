import axiosInstance from './axiosInstance';

export const academicApi = {
  // --- Kelas ---
  getAllKelas: () => axiosInstance.get('/api/academic/kelas'),
  createKelas: (data) => axiosInstance.post('/api/academic/kelas', data),
  updateKelas: (id, data) => axiosInstance.put(`/api/academic/kelas/${id}`, data),
  deleteKelas: (id) => axiosInstance.delete(`/api/academic/kelas/${id}`),

  // Pencarian wali kelas ke auth-service melalui gateway
  searchWaliKelas: (query) => axiosInstance.get(`/api/auth/users/search?role=wali_kelas&q=${query}`),

  // --- Siswa ---
  getAllSiswa: () => axiosInstance.get('/api/academic/siswa'),
  getSiswaByKelas: (kelas_id) => axiosInstance.get(`/api/academic/siswa?kelas_id=${kelas_id}`),
  createSiswa: (data) => axiosInstance.post('/api/academic/siswa', data),
  deleteSiswa: (id) => axiosInstance.delete(`/api/academic/siswa/${id}`),
};
