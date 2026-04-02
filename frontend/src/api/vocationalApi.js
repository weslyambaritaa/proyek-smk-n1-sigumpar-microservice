import axiosInstance from './axiosInstance';

export const vocationalApi = {
  // --- Regu ---
  getAllRegu:   () => axiosInstance.get('/api/vocational/regu'),
  createRegu:  (data) => axiosInstance.post('/api/vocational/regu', data),

  // --- Anggota Regu ---
  getSiswaTersedia:  () => axiosInstance.get('/api/vocational/regu/siswa-tersedia'),
  assignSiswaToRegu: (data) => axiosInstance.post('/api/vocational/regu/assign', data),
  getSiswaByRegu:   (reguId) => axiosInstance.get(`/api/vocational/regu/${reguId}/siswa`),

  // --- Absensi Pramuka ---
  getAbsensiPramuka: (params) => axiosInstance.get('/api/vocational/absensi', { params }),
  submitAbsensiPramuka: (data) => axiosInstance.post('/api/vocational/absensi', data),
  uploadFileLaporan: (formData) => axiosInstance.post('/api/vocational/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // --- Silabus Pramuka ---
  getAllSilabus: () => axiosInstance.get('/api/vocational/silabus'),
  createSilabus: (formData) => axiosInstance.post('/api/vocational/silabus', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteSilabus: (id) => axiosInstance.delete(`/api/vocational/silabus/${id}`),

  // --- PKL: Lokasi ---
  getAllLokasiPKL:  () => axiosInstance.get('/api/vocational/pkl/lokasi'),
  createLokasiPKL: (formData) => axiosInstance.post('/api/vocational/pkl/lokasi', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateLokasiPKL: (id, formData) => axiosInstance.put(`/api/vocational/pkl/lokasi/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteLokasiPKL: (id) => axiosInstance.delete(`/api/vocational/pkl/lokasi/${id}`),

  // --- PKL: Progres ---
  getAllProgresPKL:  () => axiosInstance.get('/api/vocational/pkl/progres'),
  createProgresPKL: (data) => axiosInstance.post('/api/vocational/pkl/progres', data),
  updateProgresPKL: (id, data) => axiosInstance.put(`/api/vocational/pkl/progres/${id}`, data),
  deleteProgresPKL: (id) => axiosInstance.delete(`/api/vocational/pkl/progres/${id}`),

  // --- PKL: Nilai ---
  getNilaiPKL:      (params) => axiosInstance.get('/api/vocational/pkl/nilai', { params }),
  saveNilaiPKLBulk: (data)   => axiosInstance.post('/api/vocational/pkl/nilai', data),
  deleteNilaiPKL:   (id)     => axiosInstance.delete(`/api/vocational/pkl/nilai/${id}`),

  // --- PKL: Kelas ---
  getAllKelas: () => axiosInstance.get('/api/academic/kelas'),
};
