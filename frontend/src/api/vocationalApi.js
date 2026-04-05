import axiosInstance from './axiosInstance';

export const vocationalApi = {
  // ── Regu (tetap ada untuk keperluan internal) ──────────────────────────
  getAllRegu:   () => axiosInstance.get('/api/vocational/regu'),
  createRegu:  (data) => axiosInstance.post('/api/vocational/regu', data),
  deleteRegu:  (id) => axiosInstance.delete(`/api/vocational/regu/${id}`),

  // ── Anggota Regu ────────────────────────────────────────────────────────
  getSiswaTersedia:  () => axiosInstance.get('/api/vocational/regu/siswa-tersedia'),
  assignSiswaToRegu: (data) => axiosInstance.post('/api/vocational/regu/assign', data),
  getSiswaByRegu:    (reguId) => axiosInstance.get(`/api/vocational/regu/${reguId}/siswa`),

  // ── Absensi Pramuka (per-kelas dari academic service) ──────────────────
  getAbsensiPramuka:    (params) => axiosInstance.get('/api/vocational/absensi', { params }),
  submitAbsensiPramuka: (data)   => axiosInstance.post('/api/vocational/absensi', data),
  getRekapAbsensiPramuka: (params) => axiosInstance.get('/api/vocational/absensi/rekap', { params }),

  uploadFileLaporan: (formData) => axiosInstance.post('/api/vocational/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // ── Laporan Kegiatan Pramuka ────────────────────────────────────────────
  getAllLaporanKegiatan:  () => axiosInstance.get('/api/vocational/laporan-kegiatan'),
  createLaporanKegiatan: (formData) => axiosInstance.post('/api/vocational/laporan-kegiatan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteLaporanKegiatan: (id) => axiosInstance.delete(`/api/vocational/laporan-kegiatan/${id}`),

  // ── Silabus Pramuka ─────────────────────────────────────────────────────
  getAllSilabus:  () => axiosInstance.get('/api/vocational/silabus'),
  createSilabus: (formData) => axiosInstance.post('/api/vocational/silabus', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteSilabus: (id) => axiosInstance.delete(`/api/vocational/silabus/${id}`),

  // ── Siswa & Kelas (proxy dari academic service via vocational) ──────────
  getSiswaVokasi: (params) => axiosInstance.get('/api/vocational/siswa', { params }),
  getKelasVokasi: () => axiosInstance.get('/api/vocational/kelas'),

  // ── PKL: Lokasi ─────────────────────────────────────────────────────────
  getAllLokasiPKL:  () => axiosInstance.get('/api/vocational/pkl/lokasi'),
  createLokasiPKL: (formData) => axiosInstance.post('/api/vocational/pkl/lokasi', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateLokasiPKL: (id, formData) => axiosInstance.put(`/api/vocational/pkl/lokasi/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteLokasiPKL: (id) => axiosInstance.delete(`/api/vocational/pkl/lokasi/${id}`),

  // ── PKL: Progres ────────────────────────────────────────────────────────
  getAllProgresPKL:  () => axiosInstance.get('/api/vocational/pkl/progres'),
  createProgresPKL: (data) => axiosInstance.post('/api/vocational/pkl/progres', data),
  updateProgresPKL: (id, data) => axiosInstance.put(`/api/vocational/pkl/progres/${id}`, data),
  deleteProgresPKL: (id) => axiosInstance.delete(`/api/vocational/pkl/progres/${id}`),

  // ── PKL: Nilai ──────────────────────────────────────────────────────────
  getNilaiPKL:      (params) => axiosInstance.get('/api/vocational/pkl/nilai', { params }),
  saveNilaiPKLBulk: (data)   => axiosInstance.post('/api/vocational/pkl/nilai', data),
  deleteNilaiPKL:   (id)     => axiosInstance.delete(`/api/vocational/pkl/nilai/${id}`),
};
