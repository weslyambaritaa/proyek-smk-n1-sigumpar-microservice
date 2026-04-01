import axiosInstance from './axiosInstance';

export const vocationalApi = {
  // --- Fitur Regu ---
  getAllRegu: () => axiosInstance.get('/api/vocational/regu'),
  createRegu: (data) => axiosInstance.post('/api/vocational/regu', data),
  
  // --- Fitur Plotting Anggota ---
  getSiswaTersedia: () => axiosInstance.get('/api/vocational/regu/siswa-tersedia'),
  assignSiswaToRegu: (data) => axiosInstance.post('/api/vocational/regu/assign', data),
  
  getAllLaporanPKL: () => axiosInstance.get('/vocational/laporan-pkl'),
    createLaporanPKL: (data) => axiosInstance.post('/vocational/laporan-pkl', data),
    updateLaporanPKL: (id, data) => axiosInstance.put(`/vocational/laporan-pkl/${id}`, data),
    deleteLaporanPKL: (id) => axiosInstance.delete(`/vocational/laporan-pkl/${id}`),
    
    // Helper untuk cari siswa (panggil gateway yang arahkan ke student-service)
    searchSiswa: (query) => axiosInstance.get(`/student?search=${query}`),
};