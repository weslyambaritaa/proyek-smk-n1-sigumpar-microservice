import api from "./axiosInstance";

export const getAbsensiSiswa = (params) =>
  api.get("/api/academic/absensi-siswa", { params });
export const getAbsensiSiswaById = (id) =>
  api.get(`/api/academic/absensi-siswa/${id}`);
export const createAbsensiSiswa = (data) =>
  api.post("/api/academic/absensi-siswa", data);
export const updateAbsensiSiswa = (id, data) =>
  api.put(`/api/academic/absensi-siswa/${id}`, data);
export const deleteAbsensiSiswa = (id) =>
  api.delete(`/api/academic/absensi-siswa/${id}`);
