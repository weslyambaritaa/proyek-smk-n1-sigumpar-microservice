import axiosInstance from './axiosInstance';

export const wakilKepsekApi = {
  // ── STATISTIK ──────────────────────────────────────────────────────────
  getStatistik: () => axiosInstance.get('/api/academic/wakil/statistik'),

  // ── PERANGKAT PEMBELAJARAN ─────────────────────────────────────────────
  getDaftarGuruPerangkat: () => axiosInstance.get('/api/academic/wakil/perangkat-guru'),
  getPerangkatByGuru: (guruId) => axiosInstance.get(`/api/academic/wakil/perangkat-guru/${guruId}`),
  getAllPerangkat: () => axiosInstance.get('/api/academic/wakil/perangkat'),
  createPerangkat: (data) => axiosInstance.post('/api/academic/wakil/perangkat', data),
  updatePerangkat: (id, data) => axiosInstance.put(`/api/academic/wakil/perangkat/${id}`, data),
  deletePerangkat: (id) => axiosInstance.delete(`/api/academic/wakil/perangkat/${id}`),

  // ── SUPERVISI GURU ─────────────────────────────────────────────────────
  getAllSupervisi: (params) => axiosInstance.get('/api/academic/wakil/supervisi', { params }),
  getSupervisiById: (id) => axiosInstance.get(`/api/academic/wakil/supervisi/${id}`),
  createSupervisi: (data) => axiosInstance.post('/api/academic/wakil/supervisi', data),
  updateSupervisi: (id, data) => axiosInstance.put(`/api/academic/wakil/supervisi/${id}`, data),
  deleteSupervisi: (id) => axiosInstance.delete(`/api/academic/wakil/supervisi/${id}`),

  // ── PROGRAM KERJA ──────────────────────────────────────────────────────
  getAllProgramKerja: (params) => axiosInstance.get('/api/academic/wakil/program-kerja', { params }),
  getProgramKerjaById: (id) => axiosInstance.get(`/api/academic/wakil/program-kerja/${id}`),
  createProgramKerja: (data) => axiosInstance.post('/api/academic/wakil/program-kerja', data),
  updateProgramKerja: (id, data) => axiosInstance.put(`/api/academic/wakil/program-kerja/${id}`, data),
  deleteProgramKerja: (id) => axiosInstance.delete(`/api/academic/wakil/program-kerja/${id}`),

  // ── LAPORAN REKAP ──────────────────────────────────────────────────────
  getLaporanRekap: (params) => axiosInstance.get('/api/academic/wakil/laporan-rekap', { params }),
  createLaporanRekap: (data) => axiosInstance.post('/api/academic/wakil/laporan-rekap', data),
  deleteLaporanRekap: (id) => axiosInstance.delete(`/api/academic/wakil/laporan-rekap/${id}`),
};

// ─── Tambahkan ke academicApi (di academicApi.js) ──────────────────────────
// Salin fungsi-fungsi berikut ke dalam objek academicApi yang sudah ada:
//
//   // ── WAKIL KEPALA SEKOLAH ───────────────────────────────────────────────
//   getStatistikWakil:      () => axiosInstance.get('/api/academic/wakil/statistik'),
//   getDaftarGuruPerangkat: () => axiosInstance.get('/api/academic/wakil/perangkat-guru'),
//   getPerangkatByGuru:     (guruId) => axiosInstance.get(`/api/academic/wakil/perangkat-guru/${guruId}`),
//   getAllPerangkat:         () => axiosInstance.get('/api/academic/wakil/perangkat'),
//   createPerangkat:        (data) => axiosInstance.post('/api/academic/wakil/perangkat', data),
//   updatePerangkat:        (id, data) => axiosInstance.put(`/api/academic/wakil/perangkat/${id}`, data),
//   deletePerangkat:        (id) => axiosInstance.delete(`/api/academic/wakil/perangkat/${id}`),
//   getAllSupervisi:         (params) => axiosInstance.get('/api/academic/wakil/supervisi', { params }),
//   getSupervisiById:       (id) => axiosInstance.get(`/api/academic/wakil/supervisi/${id}`),
//   createSupervisi:        (data) => axiosInstance.post('/api/academic/wakil/supervisi', data),
//   updateSupervisi:        (id, data) => axiosInstance.put(`/api/academic/wakil/supervisi/${id}`, data),
//   deleteSupervisi:        (id) => axiosInstance.delete(`/api/academic/wakil/supervisi/${id}`),
//   getAllProgramKerja:      (params) => axiosInstance.get('/api/academic/wakil/program-kerja', { params }),
//   getProgramKerjaById:    (id) => axiosInstance.get(`/api/academic/wakil/program-kerja/${id}`),
//   createProgramKerja:     (data) => axiosInstance.post('/api/academic/wakil/program-kerja', data),
//   updateProgramKerja:     (id, data) => axiosInstance.put(`/api/academic/wakil/program-kerja/${id}`, data),
//   deleteProgramKerja:     (id) => axiosInstance.delete(`/api/academic/wakil/program-kerja/${id}`),
//   getLaporanRekap:        (params) => axiosInstance.get('/api/academic/wakil/laporan-rekap', { params }),
//   createLaporanRekap:     (data) => axiosInstance.post('/api/academic/wakil/laporan-rekap', data),
//   deleteLaporanRekap:     (id) => axiosInstance.delete(`/api/academic/wakil/laporan-rekap/${id}`),
