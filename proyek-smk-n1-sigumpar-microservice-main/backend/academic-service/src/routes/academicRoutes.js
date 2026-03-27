import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Academic base route aktif",
  });
});

router.get("/kelas", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, nama: "X RPL 1" },
      { id: 2, nama: "XI RPL 1" },
      { id: 3, nama: "XII RPL 1" },
    ],
  });
});

router.get("/siswa", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, nama: "Ahmad Fauzi", kelas: "X RPL 1" },
      { id: 2, nama: "Bella Safira", kelas: "XII RPL 1" },
    ],
  });
});

export default router;