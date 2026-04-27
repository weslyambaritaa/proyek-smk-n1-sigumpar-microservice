import axiosInstance from './axiosInstance';

export const waliKelasApi = {
  // ── BERANDA ──────────────────────────────────────────────────
  getBeranda: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/beranda?kelas_id=${kelas_id}`),

  // ── PARENTING KELAS MASSAL ───────────────────────────────────
  getAllParenting: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/parenting${kelas_id ? `?kelas_id=${kelas_id}` : ''}`),
  getParentingById: (id) =>
    axiosInstance.get(`/api/academic/walas/parenting/${id}`),
  
  createParenting: (formData) =>
    axiosInstance.post('/api/academic/walas/parenting', formData),
  
  updateParenting: (id, formData) =>
    axiosInstance.put(`/api/academic/walas/parenting/${id}`, formData),
  
  deleteParenting: (id) =>
    axiosInstance.delete(`/api/academic/walas/parenting/${id}`),

  // ── KEBERSIHAN KELAS ─────────────────────────────────────────
  getAllKebersihan: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return axiosInstance.get(`/api/academic/walas/kebersihan${query ? `?${query}` : ''}`);
  },
  getRekapKebersihan: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/kebersihan/rekap/${kelas_id}`),
  getKebersihanById: (id) =>
    axiosInstance.get(`/api/academic/walas/kebersihan/${id}`),
  
  createKebersihan: (formData) =>
    axiosInstance.post('/api/academic/walas/kebersihan', formData),
  
  updateKebersihan: (id, formData) =>
    axiosInstance.put(`/api/academic/walas/kebersihan/${id}`, formData),
  
  deleteKebersihan: (id) =>
    axiosInstance.delete(`/api/academic/walas/kebersihan/${id}`),

  // ── REFLEKSI ─────────────────────────────────────────────────
  getAllRefleksi: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/refleksi${kelas_id ? `?kelas_id=${kelas_id}` : ''}`),
  getRefleksiById: (id) =>
    axiosInstance.get(`/api/academic/walas/refleksi/${id}`),
  
  createRefleksi: (formData) =>
    axiosInstance.post('/api/academic/walas/refleksi', formData),
  
  updateRefleksi: (id, formData) =>
    axiosInstance.put(`/api/academic/walas/refleksi/${id}`, formData),
  
  deleteRefleksi: (id) =>
    axiosInstance.delete(`/api/academic/walas/refleksi/${id}`),

  // ── REKAP NILAI & KEHADIRAN ──────────────────────────────────
  getRekapNilai: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/rekap-nilai/${kelas_id}`),

  getRekapKehadiran: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/rekap-kehadiran/${kelas_id}`),

  // ── FILE VIEWER ──────────────────────────────────────────────
  viewFile: (foto_url) =>
    axiosInstance.get(foto_url, { responseType: 'blob' }),
};