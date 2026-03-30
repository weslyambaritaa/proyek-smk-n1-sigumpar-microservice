import axiosInstance from './axiosInstance';

export const vocationalApi = {
  // --- Fitur Regu ---
  getAllRegu: () => axiosInstance.get('/api/vocational/regu'),
  createRegu: (data) => axiosInstance.post('/api/vocational/regu', data),
  
  // --- Fitur Plotting Anggota ---
  getSiswaTersedia: () => axiosInstance.get('/api/vocational/regu/siswa-tersedia'),
  assignSiswaToRegu: (data) => axiosInstance.post('/api/vocational/regu/assign', data),
  
  // --- Fitur Absensi ---
  getAllKelas: () => axiosInstance.get('/api/vocational/kelas'), 
  getSiswaPramukaByKelas: (kelasId) => axiosInstance.get(`/api/vocational/absensi/kelas/${kelasId}`),
  submitAbsensiPramuka: (data) => axiosInstance.post('/api/vocational/absensi', data),
};