import axiosInstance from './axiosInstance';

export const vocationalApi = {
  // --- Fitur Regu ---
  getAllRegu: () => axiosInstance.get('/api/vocational/regu'),
  createRegu: (data) => axiosInstance.post('/api/vocational/regu', data),

  // --- Fitur Plotting Anggota ---
  getSiswaTersedia: () => axiosInstance.get('/api/vocational/regu/siswa-tersedia'),
  assignSiswaToRegu: (data) => axiosInstance.post('/api/vocational/regu/assign', data),

  // --- Fitur Absensi Pramuka ---
  getSiswaByRegu: (reguId) => axiosInstance.get(`/api/vocational/regu/${reguId}/siswa`),
  submitAbsensiPramuka: (data) => axiosInstance.post('/api/vocational/absensi', data),
  uploadFileLaporan: (formData) => axiosInstance.post('/api/vocational/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // --- Vokasi / PKL ---
  getLokasiPkl: () => axiosInstance.get('/api/vocational/pkl/lokasi'),
  createLokasiPkl: (formData) => axiosInstance.post('/api/vocational/pkl/lokasi', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getProgresPkl: () => axiosInstance.get('/api/vocational/pkl/progres'),
  createProgresPkl: (formData) => axiosInstance.post('/api/vocational/pkl/progres', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboardVokasi: () => axiosInstance.get('/api/vocational/pkl/dashboard')
};
