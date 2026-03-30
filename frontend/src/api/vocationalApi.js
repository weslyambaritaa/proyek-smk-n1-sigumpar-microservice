import axiosInstance from "./axiosInstance";

export const vocationalApi = {
  // ── Statistik Dashboard ──────────────────────────────────
  getStatistik: () => axiosInstance.get("/api/vocational/statistik"),

  // ── Program Keahlian ─────────────────────────────────────
  getAllProgramKeahlian: () =>
    axiosInstance.get("/api/vocational/program-keahlian"),

  // ── PKL Submissions ──────────────────────────────────────
  getAllPKL: () => axiosInstance.get("/api/vocational/pkl"),
  getPKLById: (id) => axiosInstance.get(`/api/vocational/pkl/${id}`),
  createPKL: (data) => axiosInstance.post("/api/vocational/pkl", data),
  updatePKL: (id, data) => axiosInstance.put(`/api/vocational/pkl/${id}`, data),
  deletePKL: (id) => axiosInstance.delete(`/api/vocational/pkl/${id}`),

  // ── Validasi / Approve PKL ───────────────────────────────
  approvePKL: (data) => axiosInstance.post("/api/vocational/approve", data),

  // ── Monitoring PKL ───────────────────────────────────────
  getAllMonitoring: (pklId) =>
    axiosInstance.get("/api/vocational/monitoring", {
      params: { pkl_id: pklId },
    }),
  addMonitoring: (data) =>
    axiosInstance.post("/api/vocational/monitoring", data),

  // ── Input Nilai PKL ──────────────────────────────────────
  inputNilai: (data) => axiosInstance.post("/api/vocational/input-nilai", data),

  // ── Proyek Vokasi ────────────────────────────────────────
  getAllProyek: () => axiosInstance.get("/api/vocational/proyek"),
  getProyekById: (id) => axiosInstance.get(`/api/vocational/proyek/${id}`),
  createProyek: (data) => axiosInstance.post("/api/vocational/proyek", data),
  updateProyek: (id, data) =>
    axiosInstance.put(`/api/vocational/proyek/${id}`, data),
  deleteProyek: (id) => axiosInstance.delete(`/api/vocational/proyek/${id}`),

  // Anggota Proyek
  getAnggotaProyek: (proyekId) =>
    axiosInstance.get(`/api/vocational/proyek/${proyekId}/anggota`),
  addAnggotaProyek: (proyekId, data) =>
    axiosInstance.post(`/api/vocational/proyek/${proyekId}/anggota`, data),
  deleteAnggotaProyek: (anggotaId) =>
    axiosInstance.delete(`/api/vocational/proyek/anggota/${anggotaId}`),

  // ── Nilai Kompetensi Kejuruan ────────────────────────────
  getAllNilai: (params) =>
    axiosInstance.get("/api/vocational/nilai", { params }),
  getNilaiById: (id) => axiosInstance.get(`/api/vocational/nilai/${id}`),
  createNilai: (data) => axiosInstance.post("/api/vocational/nilai", data),
  updateNilai: (id, data) =>
    axiosInstance.put(`/api/vocational/nilai/${id}`, data),
  deleteNilai: (id) => axiosInstance.delete(`/api/vocational/nilai/${id}`),
};
