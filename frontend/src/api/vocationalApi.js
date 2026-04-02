import axiosInstance from './axiosInstance';

export const vocationalApi = {
  // --- Fitur Regu ---
  getAllRegu:   () => axiosInstance.get('/api/vocational/regu'),
  createRegu:  (data) => axiosInstance.post('/api/vocational/regu', data),

  // --- Fitur Plotting Anggota ---
  getSiswaTersedia:  () => axiosInstance.get('/api/vocational/regu/siswa-tersedia'),
  assignSiswaToRegu: (data) => axiosInstance.post('/api/vocational/regu/assign', data),

  // --- Fitur Absensi Pramuka ---
  getAllKelas:       () => axiosInstance.get('/api/vocational/kelas'),
  getSiswaByRegu:   (reguId) => axiosInstance.get(`/api/vocational/regu/${reguId}/siswa`),
  submitAbsensiPramuka: (data) => axiosInstance.post('/api/vocational/absensi', data),
  uploadFileLaporan: (formData) => axiosInstance.post('/api/vocational/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // --- PKL: Lokasi ---
  getAllLokasiPKL:  ()       => axiosInstance.get('/api/vocational/pkl/lokasi'),
  createLokasiPKL: (data)   => axiosInstance.post('/api/vocational/pkl/lokasi', data),
  updateLokasiPKL: (id, data) => axiosInstance.put(`/api/vocational/pkl/lokasi/${id}`, data),
  deleteLokasiPKL: (id)     => axiosInstance.delete(`/api/vocational/pkl/lokasi/${id}`),

  // --- PKL: Progres ---
  getAllProgresPKL:  ()       => axiosInstance.get('/api/vocational/pkl/progres'),
  createProgresPKL: (data)   => axiosInstance.post('/api/vocational/pkl/progres', data),
  updateProgresPKL: (id, data) => axiosInstance.put(`/api/vocational/pkl/progres/${id}`, data),
  deleteProgresPKL: (id)     => axiosInstance.delete(`/api/vocational/pkl/progres/${id}`),

  // --- PKL: Nilai ---
  getNilaiPKL:      (params) => axiosInstance.get('/api/vocational/pkl/nilai', { params }),
  saveNilaiPKLBulk: (data)   => axiosInstance.post('/api/vocational/pkl/nilai', data),
  deleteNilaiPKL:   (id)     => axiosInstance.delete(`/api/vocational/pkl/nilai/${id}`),
};

// --- PKL Vokasi ---
export const vokasiApi = {
  getLokasiPKL: () => axiosInstance.get('/api/vocational/lokasi-pkl'),
  createLokasiPKL: (data) => axiosInstance.post('/api/vocational/lokasi-pkl', data),
  createProgresPKL: (data) => axiosInstance.post('/api/vocational/progres-pkl', data),
};
