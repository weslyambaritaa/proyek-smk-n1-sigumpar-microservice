import api from "./axiosInstance";

// ---- Absensi Guru ----
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

// ---- Perangkat Pembelajaran / RPP ----
export const learningApi = {
  getAllPerangkat: () => api.get("/api/learning/perangkat"),

  uploadPerangkat: (formData) =>
    api.post("/api/learning/perangkat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

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

  deletePerangkat: (id) => api.delete(`/api/learning/perangkat/${id}`),
};


export const kepsekApi = {
  getEvaluasiGuru: (params) => api.get('/api/learning/evaluasi-guru', { params }),
  saveEvaluasiGuru: (data) => api.post('/api/learning/evaluasi-guru', data),
  getKepsekDashboard: () => api.get('/api/learning/kepsek/dashboard'),
};
