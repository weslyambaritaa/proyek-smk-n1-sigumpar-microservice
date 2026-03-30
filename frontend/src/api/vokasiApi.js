import axiosInstance from './axiosInstance';

export const vokasiApi = {
  // ── PKL Lokasi ──────────────────────────────────────────
  getAllLokasi: (params) =>
    axiosInstance.get('/api/vokasi/lokasi', { params }),

  createLokasi: (formData) =>
    axiosInstance.post('/api/vokasi/lokasi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateLokasi: (id, formData) =>
    axiosInstance.put(`/api/vokasi/lokasi/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteLokasi: (id) =>
    axiosInstance.delete(`/api/vokasi/lokasi/${id}`),

  // ── PKL Progres ─────────────────────────────────────────
  getAllProgres: (params) =>
    axiosInstance.get('/api/vokasi/progres', { params }),

  getSiswaList: () =>
    axiosInstance.get('/api/vokasi/progres/siswa-list'),

  createProgres: (formData) =>
    axiosInstance.post('/api/vokasi/progres', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateProgres: (id, formData) =>
    axiosInstance.put(`/api/vokasi/progres/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteProgres: (id) =>
    axiosInstance.delete(`/api/vokasi/progres/${id}`),
};
