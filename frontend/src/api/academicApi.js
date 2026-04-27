import axios from "axios";
import keycloak from "../keycloak";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8001"}/api`,
});

api.interceptors.request.use((config) => {
  if (keycloak?.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

export const academicApi = {
  // Kelas
  getKelas: () => api.get("/academic/kelas"),
  getAllKelas: () => api.get("/academic/kelas"),
  createKelas: (payload) => api.post("/academic/kelas", payload),
  updateKelas: (id, payload) => api.put(`/academic/kelas/${id}`, payload),
  deleteKelas: (id) => api.delete(`/academic/kelas/${id}`),

  getKelasByWali: (waliId) => api.get(`/academic/kelas/wali/${waliId}`),

  getSiswaByKelas: (kelasId) =>
    api.get(`/academic/siswa?kelas_id=${encodeURIComponent(kelasId)}`),

  // Search user general dari auth-service, difilter role wali-kelas
  searchWaliKelas: (query) =>
    api.get(
      `/auth/users/search?q=${encodeURIComponent(query)}&role=wali-kelas`,
    ),

  // Siswa
  getAllSiswa: () => api.get("/academic/siswa"),
  getSiswa: () => api.get("/academic/siswa"),
  createSiswa: (payload) => api.post("/academic/siswa", payload),
  updateSiswa: (id, payload) => api.put(`/academic/siswa/${id}`, payload),
  deleteSiswa: (id) => api.delete(`/academic/siswa/${id}`),

  // Kelas wali
  getKelasByWali: (waliId) => api.get(`/academic/kelas/wali/${waliId}`),

  // Pengumuman
  getAllPengumuman: () => api.get("/academic/pengumuman"),
  getPengumuman: () => api.get("/academic/pengumuman"),
  getPengumumanById: (id) => api.get(`/academic/pengumuman/${id}`),
  createPengumuman: (payload) => api.post("/academic/pengumuman", payload),
  updatePengumuman: (id, payload) =>
    api.put(`/academic/pengumuman/${id}`, payload),
  deletePengumuman: (id) => api.delete(`/academic/pengumuman/${id}`),

  // Arsip Surat
  getAllArsipSurat: () => api.get("/academic/arsip-surat"),
  getArsipSurat: () => api.get("/academic/arsip-surat"),
  createArsipSurat: (payload) => api.post("/academic/arsip-surat", payload),
  updateArsipSurat: (id, payload) =>
    api.put(`/academic/arsip-surat/${id}`, payload),
  deleteArsipSurat: (id) => api.delete(`/academic/arsip-surat/${id}`),
  getArsipSuratPreviewUrl: (filePath) => {
    if (!filePath) return null;

    const filename = filePath.split("/").pop();
    return `${BASE_URL}/uploads/${filename}`;
  },

  downloadFile: (filePath) => {
    if (!filePath) return;

    const filename = filePath.split("/").pop();
    const url = `${BASE_URL}/uploads/${filename}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  },

  // Mapel
  getAllMapel: () => api.get("/academic/mapel"),
  getMapel: () => api.get("/academic/mapel"),
  createMapel: (payload) => api.post("/academic/mapel", payload),
  updateMapel: (id, payload) => api.put(`/academic/mapel/${id}`, payload),
  deleteMapel: (id) => api.delete(`/academic/mapel/${id}`),

  // Search guru mapel dari auth-service general
  searchGuruMapel: (query) =>
    api.get(
      `/auth/users/search?q=${encodeURIComponent(query)}&role=guru-mapel`,
    ),

  // Ambil mapel+kelas yang sudah diassign ke guru mapel
  getMapelByGuru: (guruId) => api.get(`/academic/mapel/guru/${guruId}`),

  // Jadwal Mengajar
  getAllJadwal: () => api.get("/academic/jadwal"),
  getJadwal: () => api.get("/academic/jadwal"),
  createJadwal: (payload) => api.post("/academic/jadwal", payload),
  updateJadwal: (id, payload) => api.put(`/academic/jadwal/${id}`, payload),
  deleteJadwal: (id) => api.delete(`/academic/jadwal/${id}`),

  // Jadwal Piket
  getAllPiket: () => api.get("/academic/piket"),
  getPiket: () => api.get("/academic/piket"),
  createPiket: (payload) => api.post("/academic/piket", payload),
  updatePiket: (id, payload) => api.put(`/academic/piket/${id}`, payload),
  deletePiket: (id) => api.delete(`/academic/piket/${id}`),

  // Search semua user untuk jadwal piket
  searchAllUsers: (query) =>
    api.get(`/auth/users/search?q=${encodeURIComponent(query)}`),

  // Jadwal Upacara
  getAllUpacara: () => api.get("/academic/upacara"),
  getUpacara: () => api.get("/academic/upacara"),
  createUpacara: (payload) => api.post("/academic/upacara", payload),
  updateUpacara: (id, payload) => api.put(`/academic/upacara/${id}`, payload),
  deleteUpacara: (id) => api.delete(`/academic/upacara/${id}`),

  // Search semua user untuk piket/upacara
  searchAllUsers: (query) =>
    api.get(`/auth/users/search?q=${encodeURIComponent(query)}`),

  // Guru
  getAllGuru: () => api.get("/academic/guru"),
  getGuru: () => api.get("/academic/guru"),
  createGuru: (payload) => api.post("/academic/guru", payload),
  updateGuru: (id, payload) => api.put(`/academic/guru/${id}`, payload),
  deleteGuru: (id) => api.delete(`/academic/guru/${id}`),
};

export default academicApi;
