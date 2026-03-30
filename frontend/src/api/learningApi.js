import axiosInstance from './axiosInstance';

export const learningApi = {
  // ── DASHBOARD WAKASEK ──────────────────────────────────────
  getDashboardWakasek: () =>
    axiosInstance.get('/api/learning/perangkat/dashboard-wakasek'),

  // ── DAFTAR GURU + STATUS ───────────────────────────────────
  getDaftarGuru: () =>
    axiosInstance.get('/api/learning/perangkat/daftar-guru'),

  // ── DETAIL PERANGKAT SATU GURU ─────────────────────────────
  getDetailGuru: (userId) =>
    axiosInstance.get(`/api/learning/perangkat/detail-guru/${userId}`),

  // ── HAPUS PERANGKAT ────────────────────────────────────────
  deletePerangkat: (id) =>
    axiosInstance.delete(`/api/learning/perangkat/${id}`),

  // ── REVIEW / INSTRUKSI WAKASEK ─────────────────────────────
  getAllReviewWakasek: () =>
    axiosInstance.get('/api/learning/review-wakasek'),

  createReviewWakasek: (data) =>
    axiosInstance.post('/api/learning/review-wakasek', data),

  // ── ABSENSI (monitoring) ───────────────────────────────────
  getRekapAbsensi: () =>
    axiosInstance.get('/api/learning/absensi/rekap'),

  getAllAbsensi: (params) =>
    axiosInstance.get('/api/learning/absensi', { params }),

  // ── EVALUASI GURU ──────────────────────────────────────────
  getAllEvaluasi: (params) =>
    axiosInstance.get('/api/learning/evaluasi', { params }),

  createEvaluasi: (data) =>
    axiosInstance.post('/api/learning/evaluasi', data),

  updateEvaluasi: (id, data) =>
    axiosInstance.put(`/api/learning/evaluasi/${id}`, data),

  deleteEvaluasi: (id) =>
    axiosInstance.delete(`/api/learning/evaluasi/${id}`),
};