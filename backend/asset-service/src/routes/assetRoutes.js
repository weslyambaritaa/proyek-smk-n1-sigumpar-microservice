const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const extractIdentity = require("../middleware/extractIdentity");

// ─── INFORMASI PENGAJUAN ───────────────────────────────────────────────────
router.get(
  "/informasi-pengajuan",
  extractIdentity,
  assetController.getInformasiPengajuan,
);
router.post(
  "/informasi-pengajuan",
  extractIdentity,
  assetController.createInformasiPengajuan,
);

// ─── PEMINJAMAN BARANG ─────────────────────────────────────────────────────
router.get(
  "/peminjaman-barang",
  extractIdentity,
  assetController.getPeminjamanBarang,
);
router.post(
  "/peminjaman-barang",
  extractIdentity,
  assetController.createPeminjamanBarang,
);

// ─── PENGAJUAN ALAT/BARANG ─────────────────────────────────────────────────
router.get(
  "/pengajuan-alat-barang",
  extractIdentity,
  assetController.getPengajuanAlatBarang,
);
router.post(
  "/pengajuan-alat-barang",
  extractIdentity,
  assetController.createPengajuanAlatBarang,
);

// ─── RESPON PEMINJAMAN ─────────────────────────────────────────────────────
router.get(
  "/respon-peminjaman",
  extractIdentity,
  assetController.getResponPeminjaman,
);
router.post(
  "/respon-peminjaman",
  extractIdentity,
  assetController.createResponPeminjaman,
);

// ─── RESPON PENGAJUAN BENDAHARA ────────────────────────────────────────────
router.get(
  "/respon-pengajuan-bendahara",
  extractIdentity,
  assetController.getResponPengajuanBendahara,
);
router.post(
  "/respon-pengajuan-bendahara",
  extractIdentity,
  assetController.createResponPengajuanBendahara,
);

// ─── RESPON PENGAJUAN KEPSEK ───────────────────────────────────────────────
router.get(
  "/respon-pengajuan-kepsek",
  extractIdentity,
  assetController.getResponPengajuanKepsek,
);
router.post(
  "/respon-pengajuan-kepsek",
  extractIdentity,
  assetController.createResponPengajuanKepsek,
);

// ─── INVENTORY ─────────────────────────────────────────────────────────────
router.get(
  "/inventory",
  extractIdentity,
  assetController.getInventory,
);
router.post(
  "/inventory",
  extractIdentity,
  assetController.createInventory,
);
router.put(
  "/inventory/:id",
  extractIdentity,
  assetController.updateInventory,
);
router.delete(
  "/inventory/:id",
  extractIdentity,
  assetController.deleteInventory,
);

module.exports = router;
