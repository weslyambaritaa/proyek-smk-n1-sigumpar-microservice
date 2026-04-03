const express = require("express");
const router = express.Router();
const extractIdentity = require("../middleware/extractIdentity");
const {
  getAllPeminjaman,
  createPeminjaman,
  updatePeminjaman,
  deletePeminjaman,
  getAllPengajuan,
  createPengajuan,
  updatePengajuan,
  deletePengajuan,
} = require("../controllers/assetController");

// ── PEMINJAMAN BARANG ────────────────────────────────────────────────────
router.get("/peminjaman", extractIdentity, getAllPeminjaman);
router.post("/peminjaman", extractIdentity, createPeminjaman);
router.put("/peminjaman/:id", extractIdentity, updatePeminjaman);
router.delete("/peminjaman/:id", extractIdentity, deletePeminjaman);

// ── PENGAJUAN ALAT/BARANG ────────────────────────────────────────────────
router.get("/pengajuan", extractIdentity, getAllPengajuan);
router.post("/pengajuan", extractIdentity, createPengajuan);
router.put("/pengajuan/:id", extractIdentity, updatePengajuan);
router.delete("/pengajuan/:id", extractIdentity, deletePengajuan);

module.exports = router;
