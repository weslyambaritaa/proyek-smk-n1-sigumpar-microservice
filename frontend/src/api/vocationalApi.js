import axiosInstance from './axiosInstance';

export const vocationalApi = {
  // --- Fitur Regu ---
  getAllRegu: () => axiosInstance.get('/api/vocational/regu'),
  createRegu: (data) => axiosInstance.post('/api/vocational/regu', data),
  updateRegu: (id, data) => axiosInstance.put(`/api/vocational/regu/${id}`, data),
  deleteRegu: (id) => axiosInstance.delete(`/api/vocational/regu/${id}`),

  // --- Fitur Plotting Anggota ---
  getSiswaTersedia: () => axiosInstance.get('/api/vocational/regu/siswa-tersedia'),
  assignSiswaToRegu: (data) => axiosInstance.post('/api/vocational/regu/assign', data),

  // --- Fitur Absensi ---
  getAllKelas: () => axiosInstance.get('/api/vocational/kelas'),
  getSiswaByRegu: (reguId) => axiosInstance.get(`/api/vocational/regu/${reguId}/siswa`),
  submitAbsensiPramuka: (data) => axiosInstance.post('/api/vocational/absensi', data),
  uploadFileLaporan: (formData) => axiosInstance.post('/api/vocational/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
