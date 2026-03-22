import axiosInstance from './axiosInstance';

export const academicApi = {
  // Ambil semua kelas
  getAllKelas: () => axiosInstance.get('/api/academic/kelas'),
  
  // Tambah kelas baru
  createKelas: (data) => axiosInstance.post('/api/academic/kelas', data),
  
  // Update kelas
  updateKelas: (id, data) => axiosInstance.put(`/api/academic/kelas/${id}`, data),
  
  // Hapus kelas
  deleteKelas: (id) => axiosInstance.delete(`/api/academic/kelas/${id}`),

  // Mencari user dengan role wali_kelas (untuk dropdown)
  searchWaliKelas: (query) => axiosInstance.get(`/api/auth/users/search?role=wali_kelas&q=${query}`),
};