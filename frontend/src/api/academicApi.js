import axiosInstance from "./axiosInstance";

export const academicApi = {
  getAllKelas: () => axiosInstance.get("/api/academic/kelas"),
  createKelas: (data) => axiosInstance.post("/api/academic/kelas", data),
  updateKelas: (id, data) =>
    axiosInstance.put(`/api/academic/kelas/${id}`, data),
  deleteKelas: (id) => axiosInstance.delete(`/api/academic/kelas/${id}`),

  // Pencarian wali kelas ke auth-service melalui gateway
  searchWaliKelas: (query) =>
    axiosInstance.get(`/api/auth/users/search?role=wali_kelas&q=${query}`),

  getAllSiswa: () => axiosInstance.get("/api/academic/siswa"),
  createSiswa: (data) => axiosInstance.post("/api/academic/siswa", data),
  updateSiswa: (id, data) =>
    axiosInstance.put(`/api/academic/siswa/${id}`, data),
  deleteSiswa: (id) => axiosInstance.delete(`/api/academic/siswa/${id}`),

  // --- PENGUMUMAN ---
  getAllPengumuman: () => axiosInstance.get("/api/academic/pengumuman"),
  createPengumuman: (data) =>
    axiosInstance.post("/api/academic/pengumuman", data),
  updatePengumuman: (id, data) =>
    axiosInstance.put(`/api/academic/pengumuman/${id}`, data),
  deletePengumuman: (id) =>
    axiosInstance.delete(`/api/academic/pengumuman/${id}`),

  // --- ARSIP SURAT ---
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
  downloadFile: (fileUrl) =>
    axiosInstance.get(fileUrl, { responseType: "blob" }),

  // Pencarian guru mapel ke auth-service (Asumsi Anda menggunakan role=guru)
  searchGuru: (query) =>
    axiosInstance.get(`/api/auth/users/search?role=guru&q=${query}`),

  // --- MATA PELAJARAN ---
  getAllMapel: () => axiosInstance.get("/api/academic/mapel"),
  createMapel: (data) => axiosInstance.post("/api/academic/mapel", data),
  updateMapel: (id, data) =>
    axiosInstance.put(`/api/academic/mapel/${id}`, data),
  deleteMapel: (id) => axiosInstance.delete(`/api/academic/mapel/${id}`),

  // --- JADWAL MENGAJAR ---
  getAllJadwal: () => axiosInstance.get("/api/academic/jadwal"),
  createJadwal: (data) => axiosInstance.post("/api/academic/jadwal", data),
  updateJadwal: (id, data) =>
    axiosInstance.put(`/api/academic/jadwal/${id}`, data),
  deleteJadwal: (id) => axiosInstance.delete(`/api/academic/jadwal/${id}`),

  // --- JADWAL PIKET ---
  getAllPiket: () => axiosInstance.get("/api/academic/piket"),
  createPiket: (data) => axiosInstance.post("/api/academic/piket", data),
  updatePiket: (id, data) =>
    axiosInstance.put(`/api/academic/piket/${id}`, data),
  deletePiket: (id) => axiosInstance.delete(`/api/academic/piket/${id}`),

  // --- JADWAL UPACARA ---
  getAllUpacara: () => axiosInstance.get("/api/academic/upacara"),
  createUpacara: (data) => axiosInstance.post("/api/academic/upacara", data),
  updateUpacara: (id, data) =>
    axiosInstance.put(`/api/academic/upacara/${id}`, data),
  deleteUpacara: (id) => axiosInstance.delete(`/api/academic/upacara/${id}`),
};
