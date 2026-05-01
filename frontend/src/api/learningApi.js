import api from "./axiosInstance";

// 5.1 Absensi Guru
export const getAbsensiGuru = (params = {}) =>
  api.get("/api/learning/absensi-guru", { params });

export const createAbsensiGuru = (data) =>
  api.post("/api/learning/absensi-guru", data);

export const updateAbsensiGuru = (id, data) =>
  api.put(`/api/learning/absensi-guru/${id}`, data);

export const deleteAbsensiGuru = (id) =>
  api.delete(`/api/learning/absensi-guru/${id}`);

// 5.2 Catatan Mengajar
export const getCatatanMengajar = (params = {}) =>
  api.get("/api/learning/catatan-mengajar", { params });

export const createCatatanMengajar = (data) =>
  api.post("/api/learning/catatan-mengajar", data);

export const updateCatatanMengajar = (id, data) =>
  api.put(`/api/learning/catatan-mengajar/${id}`, data);

export const deleteCatatanMengajar = (id) =>
  api.delete(`/api/learning/catatan-mengajar/${id}`);

// 5.3 Evaluasi Guru
export const getEvaluasiGuru = (params = {}) =>
  api.get("/api/learning/evaluasi-guru", { params });

export const getGuruMapelForEvaluasi = () =>
  api.get("/api/learning/evaluasi-guru/guru-mapel");

export const createEvaluasiGuru = (data) =>
  api.post("/api/learning/evaluasi-guru", data);

// 5.4 Perangkat Pembelajaran
export const getAllPerangkat = (params = {}) =>
  api.get("/api/learning/perangkat", { params });

export const uploadPerangkat = (formData) =>
  api.post("/api/learning/perangkat", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePerangkat = (id) =>
  api.delete(`/api/learning/perangkat/${id}`);

// 5.5 & 5.6 Review
export const reviewPerangkatKepsek = (id, data) =>
  api.put(`/api/learning/perangkat/${id}/review-kepsek`, data);

export const reviewPerangkatWakasek = (id, data) =>
  api.put(`/api/learning/perangkat/${id}/review-wakasek`, data);

export const learningApi = {
  getAbsensiGuru,
  createAbsensiGuru,
  updateAbsensiGuru,
  deleteAbsensiGuru,

  getCatatanMengajar,
  createCatatanMengajar,
  updateCatatanMengajar,
  deleteCatatanMengajar,

  getEvaluasiGuru,
  getGuruMapelForEvaluasi,
  createEvaluasiGuru,

  getAllPerangkat,
  uploadPerangkat,
  deletePerangkat,

  reviewPerangkatKepsek,
  reviewPerangkatWakasek,
};
