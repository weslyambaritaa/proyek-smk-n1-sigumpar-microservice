import axiosInstance from "./axiosInstance";

// ─── INFORMASI PENGAJUAN ───────────────────────────────────────────────────
export const getInformasiPengajuan = () =>
  axiosInstance.get("/api/asset/informasi-pengajuan");
export const createInformasiPengajuan = (data) =>
  axiosInstance.post("/api/asset/informasi-pengajuan", data);

// ─── PEMINJAMAN BARANG ─────────────────────────────────────────────────────
export const getPeminjamanBarang = () =>
  axiosInstance.get("/api/asset/peminjaman-barang");
export const createPeminjamanBarang = (data) =>
  axiosInstance.post("/api/asset/peminjaman-barang", data);

// ─── PENGAJUAN ALAT/BARANG ─────────────────────────────────────────────────
export const getPengajuanAlatBarang = () =>
  axiosInstance.get("/api/asset/pengajuan-alat-barang");
export const createPengajuanAlatBarang = (data) =>
  axiosInstance.post("/api/asset/pengajuan-alat-barang", data);

// ─── RESPON PEMINJAMAN ─────────────────────────────────────────────────────
export const getResponPeminjaman = () =>
  axiosInstance.get("/api/asset/respon-peminjaman");
export const createResponPeminjaman = (data) =>
  axiosInstance.post("/api/asset/respon-peminjaman", data);

// ─── RESPON PENGAJUAN BENDAHARA ────────────────────────────────────────────
export const getResponPengajuanBendahara = () =>
  axiosInstance.get("/api/asset/respon-pengajuan-bendahara");
export const createResponPengajuanBendahara = (data) =>
  axiosInstance.post("/api/asset/respon-pengajuan-bendahara", data);

// ─── RESPON PENGAJUAN KEPSEK ───────────────────────────────────────────────
export const getResponPengajuanKepsek = () =>
  axiosInstance.get("/api/asset/respon-pengajuan-kepsek");
export const createResponPengajuanKepsek = (data) =>
  axiosInstance.post("/api/asset/respon-pengajuan-kepsek", data);
