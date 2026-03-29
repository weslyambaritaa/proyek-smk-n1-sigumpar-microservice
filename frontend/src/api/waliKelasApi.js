import axiosInstance from './axiosInstance';

export const waliKelasApi = {
  // ── BERANDA ──────────────────────────────────────────────────
  getBeranda: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/beranda?kelas_id=${kelas_id}`),

  // ── PARENTING ────────────────────────────────────────────────
  getAllParenting: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/parenting${kelas_id ? `?kelas_id=${kelas_id}` : ''}`),
  getParentingById: (id) =>
    axiosInstance.get(`/api/academic/walas/parenting/${id}`),
  createParenting: (data) =>
    axiosInstance.post('/api/academic/walas/parenting', data),
  updateParenting: (id, data) =>
    axiosInstance.put(`/api/academic/walas/parenting/${id}`, data),
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
  createKebersihan: (data) =>
    axiosInstance.post('/api/academic/walas/kebersihan', data),
  updateKebersihan: (id, data) =>
    axiosInstance.put(`/api/academic/walas/kebersihan/${id}`, data),
  deleteKebersihan: (id) =>
    axiosInstance.delete(`/api/academic/walas/kebersihan/${id}`),

  // ── REFLEKSI ─────────────────────────────────────────────────
  getAllRefleksi: (kelas_id) =>
    axiosInstance.get(`/api/academic/walas/refleksi${kelas_id ? `?kelas_id=${kelas_id}` : ''}`),
  getRefleksiById: (id) =>
    axiosInstance.get(`/api/academic/walas/refleksi/${id}`),
  createRefleksi: (data) =>
    axiosInstance.post('/api/academic/walas/refleksi', data),
  updateRefleksi: (id, data) =>
    axiosInstance.put(`/api/academic/walas/refleksi/${id}`, data),
  deleteRefleksi: (id) =>
    axiosInstance.delete(`/api/academic/walas/refleksi/${id}`),
};
