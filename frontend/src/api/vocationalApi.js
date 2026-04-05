import axiosInstance from "./axiosInstance";

// Helper: fetch blob dari endpoint dan trigger download atau preview
const fetchBlob = async (url) => {
  const res = await axiosInstance.get(url, { responseType: "blob" });
  const mime = res.headers["content-type"] || "application/octet-stream";
  const blob = new Blob([res.data], { type: mime });
  return { blob, mime, url: URL.createObjectURL(blob) };
};

export const vocationalApi = {
  // ── Regu ────────────────────────────────────────────────────────────────
  getAllRegu: () => axiosInstance.get("/api/vocational/regu"),
  createRegu: (data) => axiosInstance.post("/api/vocational/regu", data),
  deleteRegu: (id) => axiosInstance.delete(`/api/vocational/regu/${id}`),

  // ── Anggota Regu ─────────────────────────────────────────────────────────
  getSiswaTersedia: () =>
    axiosInstance.get("/api/vocational/regu/siswa-tersedia"),
  assignSiswaToRegu: (data) =>
    axiosInstance.post("/api/vocational/regu/assign", data),
  getSiswaByRegu: (reguId) =>
    axiosInstance.get(`/api/vocational/regu/${reguId}/siswa`),

  // ── Absensi Pramuka ───────────────────────────────────────────────────────
  getAbsensiPramuka: (params) =>
    axiosInstance.get("/api/vocational/absensi", { params }),
  submitAbsensiPramuka: (data) =>
    axiosInstance.post("/api/vocational/absensi", data),
  getRekapAbsensiPramuka: (params) =>
    axiosInstance.get("/api/vocational/absensi/rekap", { params }),

  // ── Silabus Pramuka ───────────────────────────────────────────────────────
  getAllSilabus: () => axiosInstance.get("/api/vocational/silabus"),
  createSilabus: (formData) =>
    axiosInstance.post("/api/vocational/silabus", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteSilabus: (id) => axiosInstance.delete(`/api/vocational/silabus/${id}`),

  // Preview silabus: gambar/PDF → inline, DOCX → download otomatis
  viewSilabus: async (id, fileName) => {
    const { blob, mime, url } = await fetchBlob(
      `/api/vocational/silabus/${id}/view`,
    );
    const inlineTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (inlineTypes.includes(mime)) {
      return { url, mime, inline: true };
    }
    // DOCX dan lainnya — langsung download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "file";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return { url: null, mime, inline: false };
  },

  // Download silabus (force attachment)
  downloadSilabus: async (id, fileName) => {
    const { url } = await fetchBlob(`/api/vocational/silabus/${id}/download`);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "silabus";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },

  // ── Laporan Kegiatan Pramuka ──────────────────────────────────────────────
  getAllLaporanKegiatan: () =>
    axiosInstance.get("/api/vocational/laporan-kegiatan"),
  createLaporanKegiatan: (formData) =>
    axiosInstance.post("/api/vocational/laporan-kegiatan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteLaporanKegiatan: (id) =>
    axiosInstance.delete(`/api/vocational/laporan-kegiatan/${id}`),

  viewLaporanKegiatan: async (id, fileName) => {
    const { blob, mime, url } = await fetchBlob(
      `/api/vocational/laporan-kegiatan/${id}/view`,
    );
    const inlineTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (inlineTypes.includes(mime)) {
      return { url, mime, inline: true };
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "file";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return { url: null, mime, inline: false };
  },

  downloadLaporanKegiatan: async (id, fileName) => {
    const { url } = await fetchBlob(
      `/api/vocational/laporan-kegiatan/${id}/download`,
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "laporan";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },

  // ── Siswa & Kelas ─────────────────────────────────────────────────────────
  getSiswaVokasi: (params) =>
    axiosInstance.get("/api/vocational/siswa", { params }),
  getKelasVokasi: () => axiosInstance.get("/api/vocational/kelas"),

  // ── PKL: Lokasi ───────────────────────────────────────────────────────────
  getAllLokasiPKL: () => axiosInstance.get("/api/vocational/pkl/lokasi"),
  createLokasiPKL: (formData) =>
    axiosInstance.post("/api/vocational/pkl/lokasi", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateLokasiPKL: (id, formData) =>
    axiosInstance.put(`/api/vocational/pkl/lokasi/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteLokasiPKL: (id) =>
    axiosInstance.delete(`/api/vocational/pkl/lokasi/${id}`),

  // ── PKL: Progres ──────────────────────────────────────────────────────────
  getAllProgresPKL: () => axiosInstance.get("/api/vocational/pkl/progres"),
  createProgresPKL: (data) =>
    axiosInstance.post("/api/vocational/pkl/progres", data),
  updateProgresPKL: (id, data) =>
    axiosInstance.put(`/api/vocational/pkl/progres/${id}`, data),
  deleteProgresPKL: (id) =>
    axiosInstance.delete(`/api/vocational/pkl/progres/${id}`),

  // ── PKL: Nilai ────────────────────────────────────────────────────────────
  getNilaiPKL: (params) =>
    axiosInstance.get("/api/vocational/pkl/nilai", { params }),
  saveNilaiPKLBulk: (data) =>
    axiosInstance.post("/api/vocational/pkl/nilai", data),
  deleteNilaiPKL: (id) =>
    axiosInstance.delete(`/api/vocational/pkl/nilai/${id}`),
};
