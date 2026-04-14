const { Kelas } = require("../models");
const { createError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");
const serviceClient = require("../utils/serviceClient");

exports.getAllKelas = asyncHandler(async (req, res) => {
  const data = await Kelas.findAll({
    order: [
      ["tingkat", "ASC"],
      ["nama_kelas", "ASC"],
    ],
  });
  res.json({ success: true, data });
});

exports.createKelas = asyncHandler(async (req, res) => {
  const { nama_kelas, tingkat, wali_kelas_id } = req.body;
  const authToken = req.headers.authorization;

  if (!nama_kelas) throw createError(400, "Field nama_kelas wajib diisi");

  // Validasi wali kelas jika disediakan
  if (wali_kelas_id) {
    try {
      console.log("Validating wali_kelas_id:", wali_kelas_id);
      const waliKelasResponse = await serviceClient.getUsersByRole(
        "wali-kelas",
        authToken,
      );
      console.log("Wali kelas response:", waliKelasResponse);
      const waliKelasList = Array.isArray(waliKelasResponse)
        ? waliKelasResponse
        : waliKelasResponse?.data || [];
      console.log("Wali kelas list:", waliKelasList);
      const isValidWali = waliKelasList.some(
        (user) => String(user.id) === String(wali_kelas_id),
      );
      console.log("Is valid wali:", isValidWali);
      if (!isValidWali) {
        throw createError(
          400,
          "Wali kelas tidak valid atau tidak memiliki role wali-kelas",
        );
      }
    } catch (error) {
      console.error("Error validating wali kelas:", error.message);
      throw createError(500, "Gagal memvalidasi wali kelas");
    }
  }

  const kelas = await Kelas.create({
    nama_kelas,
    tingkat,
    wali_kelas_id: wali_kelas_id || null,
  });
  res.status(201).json({ success: true, data: kelas });
});

exports.updateKelas = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama_kelas, tingkat, wali_kelas_id } = req.body;
  const authToken = req.headers.authorization;

  if (!nama_kelas) throw createError(400, "Field nama_kelas wajib diisi");

  const kelas = await Kelas.findByPk(id);
  if (!kelas) throw createError(404, "Kelas tidak ditemukan");

  // Validasi wali kelas jika disediakan
  if (wali_kelas_id) {
    try {
      const waliKelasResponse = await serviceClient.getUsersByRole(
        "wali-kelas",
        authToken,
      );
      const waliKelasList = Array.isArray(waliKelasResponse)
        ? waliKelasResponse
        : waliKelasResponse?.data || [];
      const isValidWali = waliKelasList.some(
        (user) => String(user.id) === String(wali_kelas_id),
      );
      if (!isValidWali) {
        throw createError(
          400,
          "Wali kelas tidak valid atau tidak memiliki role wali-kelas",
        );
      }
    } catch (error) {
      console.error("Error validating wali kelas:", error.message);
      throw createError(500, "Gagal memvalidasi wali kelas");
    }
  }

  await kelas.update({
    nama_kelas,
    tingkat,
    wali_kelas_id: wali_kelas_id || null,
  });
  res.json({ success: true, data: kelas });
});

exports.deleteKelas = asyncHandler(async (req, res) => {
  const kelas = await Kelas.findByPk(req.params.id);
  if (!kelas) throw createError(404, "Kelas tidak ditemukan");
  await kelas.destroy();
  res.json({ success: true, message: "Kelas berhasil dihapus" });
});
