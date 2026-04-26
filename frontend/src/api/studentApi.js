import axiosInstance from "./axiosInstance";

export const studentApi = {
  // Rekap Kebersihan Kelas
  getKebersihan: (params) =>
    axiosInstance.get("/api/student/kebersihan", { params }),
  createKebersihan: (data) =>
    axiosInstance.post("/api/student/kebersihan", data),
  updateKebersihan: (id, data) =>
    axiosInstance.put(`/api/student/kebersihan/${id}`, data),
  deleteKebersihan: (id) =>
    axiosInstance.delete(`/api/student/kebersihan/${id}`),

  // Catatan Parenting
  getParenting: (params) =>
    axiosInstance.get("/api/student/parenting", { params }),
  createParenting: (data) => axiosInstance.post("/api/student/parenting", data),
  updateParenting: (id, data) =>
    axiosInstance.put(`/api/student/parenting/${id}`, data),
  deleteParenting: (id) => axiosInstance.delete(`/api/student/parenting/${id}`),

  // Refleksi Wali Kelas
  getRefleksi: (params) =>
    axiosInstance.get("/api/student/refleksi", { params }),
  createRefleksi: (data) => axiosInstance.post("/api/student/refleksi", data),
  updateRefleksi: (id, data) =>
    axiosInstance.put(`/api/student/refleksi/${id}`, data),
  deleteRefleksi: (id) => axiosInstance.delete(`/api/student/refleksi/${id}`),

  // Surat Panggilan Siswa
  getSuratPanggilan: (params) =>
    axiosInstance.get("/api/student/surat-panggilan", { params }),
  createSuratPanggilan: (data) =>
    axiosInstance.post("/api/student/surat-panggilan", data),
  updateSuratPanggilan: (id, data) =>
    axiosInstance.put(`/api/student/surat-panggilan/${id}`, data),
  deleteSuratPanggilan: (id) =>
    axiosInstance.delete(`/api/student/surat-panggilan/${id}`),

  // Rekap Kehadiran Siswa
  getRekapKehadiran: (params) =>
    axiosInstance.get("/api/student/rekap-kehadiran", { params }),

  createRekapKehadiran: (data) =>
    axiosInstance.post("/api/student/rekap-kehadiran", data),

  // Rekap Nilai Siswa
  getRekapNilai: (params) =>
    axiosInstance.get("/api/student/rekap-nilai", { params }),
};

export default studentApi;
