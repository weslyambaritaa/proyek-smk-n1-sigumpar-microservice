import axios from "axios";
import keycloak from "../keycloak";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  if (keycloak?.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

export const academicApi = {
  searchWaliKelas: (query) =>
    api.get(
      `/auth/users/search?q=${encodeURIComponent(query)}&role=wali-kelas`,
    ),
  getKelas: () => api.get("/academic/kelas"),
  createKelas: (payload) => api.post("/academic/kelas", payload),
  updateKelas: (id, payload) => api.put(`/academic/kelas/${id}`, payload),
  deleteKelas: (id) => api.delete(`/academic/kelas/${id}`),

  // auth-service tetap general, tapi dipakai untuk kebutuhan wali kelas
  searchWaliKelas: (query) =>
    api.get(`/auth/search?q=${encodeURIComponent(query)}&role=wali-kelas`),

  // ── SISWA ──────────────────────────────────────────────────────────────
  getAllSiswa: (params) => axiosInstance.get("/api/academic/siswa", { params }),
  createSiswa: (data) => axiosInstance.post("/api/academic/siswa", data),
  updateSiswa: (id, data) =>
    axiosInstance.put(`/api/academic/siswa/${id}`, data),
  deleteSiswa: (id) => axiosInstance.delete(`/api/academic/siswa/${id}`),

  // ── GURU (Tata Usaha) ──────────────────────────────────────────────────
  getAllGuru: () => axiosInstance.get("/api/academic/guru"),
  createGuru: (data) => axiosInstance.post("/api/academic/guru", data),
  updateGuru: (id, data) => axiosInstance.put(`/api/academic/guru/${id}`, data),
  deleteGuru: (id) => axiosInstance.delete(`/api/academic/guru/${id}`),
  searchGuru: (q) =>
    axiosInstance.get("/api/academic/guru/search", { params: { q } }),
  searchWaliKelas: (q) =>
    axiosInstance.get("/api/academic/guru/search", { params: { q } }),

  // ── PENGUMUMAN ─────────────────────────────────────────────────────────
  getAllPengumuman: () => axiosInstance.get("/api/academic/pengumuman"),
  createPengumuman: (data) =>
    axiosInstance.post("/api/academic/pengumuman", data),
  updatePengumuman: (id, data) =>
    axiosInstance.put(`/api/academic/pengumuman/${id}`, data),
  deletePengumuman: (id) =>
    axiosInstance.delete(`/api/academic/pengumuman/${id}`),

  // ── ARSIP SURAT ────────────────────────────────────────────────────────
  getAllArsipSurat: () => axiosInstance.get("/api/academic/arsip-surat"),
  createArsipSurat: (formData) =>
    axiosInstance.post("/api/academic/arsip-surat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateArsipSurat: (id, formData) =>
    axiosInstance.put(`/api/academic/arsip-surat/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteArsipSurat: (id) =>
    axiosInstance.delete(`/api/academic/arsip-surat/${id}`),
  getArsipSuratPreviewUrl: (id) =>
    `${axiosInstance.defaults.baseURL || "http://localhost:8001"}/api/academic/arsip-surat/${id}/preview`,

  // ── MATA PELAJARAN ─────────────────────────────────────────────────────
  getAllMapel: () => axiosInstance.get("/api/academic/mapel"),
  createMapel: (data) => axiosInstance.post("/api/academic/mapel", data),
  updateMapel: (id, data) =>
    axiosInstance.put(`/api/academic/mapel/${id}`, data),
  deleteMapel: (id) => axiosInstance.delete(`/api/academic/mapel/${id}`),

  // ── JADWAL ─────────────────────────────────────────────────────────────
  getAllJadwal: () => axiosInstance.get("/api/academic/jadwal"),
  createJadwal: (data) => axiosInstance.post("/api/academic/jadwal", data),
  updateJadwal: (id, data) =>
    axiosInstance.put(`/api/academic/jadwal/${id}`, data),
  deleteJadwal: (id) => axiosInstance.delete(`/api/academic/jadwal/${id}`),

  // ── PIKET ──────────────────────────────────────────────────────────────
  getAllPiket: () => axiosInstance.get("/api/academic/piket"),
  createPiket: (data) => axiosInstance.post("/api/academic/piket", data),
  updatePiket: (id, data) =>
    axiosInstance.put(`/api/academic/piket/${id}`, data),
  deletePiket: (id) => axiosInstance.delete(`/api/academic/piket/${id}`),

  // ── UPACARA ────────────────────────────────────────────────────────────
  getAllUpacara: () => axiosInstance.get("/api/academic/upacara"),
  createUpacara: (data) => axiosInstance.post("/api/academic/upacara", data),
  updateUpacara: (id, data) =>
    axiosInstance.put(`/api/academic/upacara/${id}`, data),
  deleteUpacara: (id) => axiosInstance.delete(`/api/academic/upacara/${id}`),

  // ── NILAI SISWA (Guru Mapel) ───────────────────────────────────────────
  getSiswaByKelas: (params) =>
    axiosInstance.get("/api/academic/nilai/siswa-by-kelas", { params }),
  saveNilaiBulk: (data) => axiosInstance.post("/api/academic/nilai/bulk", data),
  getNilai: (params) => axiosInstance.get("/api/academic/nilai", { params }),
  updateNilai: (id, data) =>
    axiosInstance.put(`/api/academic/nilai/${id}`, data),
  deleteNilai: (id) => axiosInstance.delete(`/api/academic/nilai/${id}`),
  exportNilaiExcel: async (params) => {
    const response = await axiosInstance.get(
      "/api/academic/nilai/export-excel",
      {
        params,
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const filename = `rekap-nilai-${Date.now()}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // ── FITUR STUDENT SERVICE / WALI KELAS ────────────────────────────────
  getParenting: (params) =>
    axiosInstance.get("/api/student/parenting", { params }),
  createParenting: (formData) =>
    axiosInstance.post("/api/student/parenting", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateParenting: (id, formData) =>
    axiosInstance.put(`/api/student/parenting/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteParenting: (id) => axiosInstance.delete(`/api/student/parenting/${id}`),

  getKebersihan: (params) =>
    axiosInstance.get("/api/student/kebersihan", { params }),
  createKebersihan: (formData) =>
    axiosInstance.post("/api/student/kebersihan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateKebersihan: (id, formData) =>
    axiosInstance.put(`/api/student/kebersihan/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteKebersihan: (id) =>
    axiosInstance.delete(`/api/student/kebersihan/${id}`),

  getRefleksi: (params) =>
    axiosInstance.get("/api/student/refleksi", { params }),
  createRefleksi: (data) => axiosInstance.post("/api/student/refleksi", data),
  updateRefleksi: (id, data) =>
    axiosInstance.put(`/api/student/refleksi/${id}`, data),
  deleteRefleksi: (id) => axiosInstance.delete(`/api/student/refleksi/${id}`),

  getSuratPanggilan: (params) =>
    axiosInstance.get("/api/student/surat-panggilan", { params }),
  createSuratPanggilan: (data) =>
    axiosInstance.post("/api/student/surat-panggilan", data),
  updateSuratPanggilan: (id, data) =>
    axiosInstance.put(`/api/student/surat-panggilan/${id}`, data),
  deleteSuratPanggilan: (id) =>
    axiosInstance.delete(`/api/student/surat-panggilan/${id}`),

  getRekapNilaiWali: (params) =>
    axiosInstance.get("/api/student/rekap-nilai", { params }),
  getRekapAbsensiWali: (params) =>
    axiosInstance.get("/api/student/rekap-kehadiran", { params }),

  // ── ABSENSI SISWA ──────────────────────────────────────────────────────
  getAbsensiSiswa: (params) =>
    axiosInstance.get("/api/academic/absensi-siswa", { params }),
  createAbsensiSiswa: (data) =>
    axiosInstance.post("/api/academic/attendance/bulk", data),

  // ── KEPALA SEKOLAH ─────────────────────────────────────────────────────
  getStatistikUmum: () => axiosInstance.get("/api/academic/kepsek/statistik"),
  getRekapAbsensiSiswa: (params) =>
    axiosInstance.get("/api/academic/kepsek/rekap-absensi-siswa", { params }),
  getRekapNilai: (params) =>
    axiosInstance.get("/api/academic/kepsek/rekap-nilai", { params }),
};
