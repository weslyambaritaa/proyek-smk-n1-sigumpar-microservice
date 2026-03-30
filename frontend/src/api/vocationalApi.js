import axiosInstance from "./axiosInstance";

export const vocationalApi = {
  getAllLokasiPKL: (search = "") =>
    axiosInstance.get("/api/vocational/pkl-lokasi", {
      params: { search },
    }),

  createLokasiPKL: (formData) =>
    axiosInstance.post("/api/vocational/pkl-lokasi", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteLokasiPKL: (id) =>
    axiosInstance.delete(`/api/vocational/pkl-lokasi/${id}`),
};