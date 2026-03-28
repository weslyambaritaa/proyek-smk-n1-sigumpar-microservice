import axiosInstance from './axiosInstance';

export const waliKelasApi = {
  // ── Rekap Kehadiran (read-only) ─────────────────────────────────────────────
  getAllRekapKehadiran: (params = {}) =>
    axiosInstance.get('/api/students/rekap-kehadiran', { params }),
  getRekapKehadiranById: (id) =>
    axiosInstance.get(`/api/students/rekap-kehadiran/${id}`),

  // ── Rekap Nilai (read-only) ──────────────────────────────────────────────────
  getAllRekapNilai: (params = {}) =>
    axiosInstance.get('/api/students/rekap-nilai', { params }),
  getRekapNilaiById: (id) =>
    axiosInstance.get(`/api/students/rekap-nilai/${id}`),

  // ── Parenting (CRUD) ─────────────────────────────────────────────────────────
  getAllParenting: (params = {}) =>
    axiosInstance.get('/api/students/parenting', { params }),
  getParentingById: (id) =>
    axiosInstance.get(`/api/students/parenting/${id}`),
  createParenting: (data) =>
    axiosInstance.post('/api/students/parenting', data),
  updateParenting: (id, data) =>
    axiosInstance.put(`/api/students/parenting/${id}`, data),
  deleteParenting: (id) =>
    axiosInstance.delete(`/api/students/parenting/${id}`),

  // ── Kebersihan Kelas (CRUD) ──────────────────────────────────────────────────
  getAllKebersihanKelas: (params = {}) =>
    axiosInstance.get('/api/students/kebersihan-kelas', { params }),
  getKebersihanKelasById: (id) =>
    axiosInstance.get(`/api/students/kebersihan-kelas/${id}`),
  createKebersihanKelas: (data) =>
    axiosInstance.post('/api/students/kebersihan-kelas', data),
  updateKebersihanKelas: (id, data) =>
    axiosInstance.put(`/api/students/kebersihan-kelas/${id}`, data),
  deleteKebersihanKelas: (id) =>
    axiosInstance.delete(`/api/students/kebersihan-kelas/${id}`),

  // ── Refleksi (CRUD) ──────────────────────────────────────────────────────────
  getAllRefleksi: (params = {}) =>
    axiosInstance.get('/api/students/refleksi', { params }),
  getRefleksiById: (id) =>
    axiosInstance.get(`/api/students/refleksi/${id}`),
  createRefleksi: (data) =>
    axiosInstance.post('/api/students/refleksi', data),
  updateRefleksi: (id, data) =>
    axiosInstance.put(`/api/students/refleksi/${id}`, data),
  deleteRefleksi: (id) =>
    axiosInstance.delete(`/api/students/refleksi/${id}`),
};