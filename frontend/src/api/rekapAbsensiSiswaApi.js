import api from "./axiosInstance";

export const getRekapAbsensiSiswa = (params) => {
  return api.get("/api/student/rekap/absensi", { params });
};
