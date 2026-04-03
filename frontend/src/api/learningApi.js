import api from "./axiosInstance";

const BASE = api.defaults.baseURL || 'http://localhost:8001';

// ── Absensi Guru ─────────────────────────────────────────────────────────
export const getAbsensiGuru = (params) =>
  api.get("/api/learning/absensi-guru", { params });

export const getAbsensiGuruById = (id) =>
  api.get(`/api/learning/absensi-guru/${id}`);

export const createAbsensiGuru = (data) =>
  api.post("/api/learning/absensi-guru", data);

export const updateAbsensiGuru = (id, data) =>
  api.put(`/api/learning/absensi-guru/${id}`, data);

export const deleteAbsensiGuru = (id) =>
  api.delete(`/api/learning/absensi-guru/${id}`);

// ── Perangkat Pembelajaran / RPP ─────────────────────────────────────────
export const learningApi = {
  getAllPerangkat: () => api.get("/api/learning/perangkat"),

  uploadPerangkat: (formData) =>
    api.post("/api/learning/perangkat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Download file (paksa download)
  downloadPerangkat: (id, fileName) =>
    api
      .get(`/api/learning/perangkat/${id}/download`, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }),

  // Preview / buka file di tab baru (inline di browser)
  previewPerangkat: async (id, fileName) => {
    try {
      const res = await api.get(`/api/learning/perangkat/${id}/download`, {
        responseType: "blob",
      });
      const mimeType = res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Bersihkan URL setelah jeda
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      throw err;
    }
  },

  deletePerangkat: (id) => api.delete(`/api/learning/perangkat/${id}`),
};
