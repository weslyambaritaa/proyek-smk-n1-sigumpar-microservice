import axiosInstance from "./axiosInstance";

// ─── WALI KELAS ──────────────────────────────────────────────────────────────
export const getParenting = () =>
  axiosInstance.get("/api/students/wali/parenting");
export const createParenting = (data) =>
  axiosInstance.post("/api/students/wali/parenting", data);

export const getRekapKebersihan = () =>
  axiosInstance.get("/api/students/wali/kebersihan");
export const createRekapKebersihan = (data) =>
  axiosInstance.post("/api/students/wali/kebersihan", data);

export const getRefleksi = () =>
  axiosInstance.get("/api/students/wali/refleksi");
export const createRefleksi = (data) =>
  axiosInstance.post("/api/students/wali/refleksi", data);

export const getSuratPanggilan = () =>
  axiosInstance.get("/api/students/wali/surat-panggilan");
export const createSuratPanggilan = (data) =>
  axiosInstance.post("/api/students/wali/surat-panggilan", data);

export const getRekapKehadiran = () =>
  axiosInstance.get("/api/students/wali/rekap-kehadiran");
export const getRekapNilai = () =>
  axiosInstance.get("/api/students/wali/rekap-nilai");

// ─── ABSENSI SISWA ───────────────────────────────────────────────────────────
export const getAllAbsensiSiswa = () =>
  axiosInstance.get("/api/students/absensi-siswa");
export const createAbsensiSiswa = (data) =>
  axiosInstance.post("/api/students/absensi-siswa", data);
export const getAbsensiSiswaById = (id) =>
  axiosInstance.get(`/api/students/absensi-siswa/${id}`);
export const updateAbsensiSiswa = (id, data) =>
  axiosInstance.put(`/api/students/absensi-siswa/${id}`, data);
export const deleteAbsensiSiswa = (id) =>
  axiosInstance.delete(`/api/students/absensi-siswa/${id}`);

// ─── NILAI ───────────────────────────────────────────────────────────────────
export const getNilai = (params) =>
  axiosInstance.get("/api/students/nilai", { params });
export const getSiswaByKelas = (kelasId) =>
  axiosInstance.get(`/api/students/nilai/siswa-by-kelas?kelas_id=${kelasId}`);
export const saveNilaiBulk = (data) =>
  axiosInstance.post("/api/students/nilai/bulk", data);
export const updateNilai = (id, data) =>
  axiosInstance.put(`/api/students/nilai/${id}`, data);
export const deleteNilai = (id) =>
  axiosInstance.delete(`/api/students/nilai/${id}`);
export const exportNilaiExcel = (params) =>
  axiosInstance.get("/api/students/nilai/export-excel", {
    params,
    responseType: "blob",
  });
