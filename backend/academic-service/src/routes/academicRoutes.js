const express = require("express");
const {
  createAbsensiSiswa,
  getAllAbsensiSiswa,
  getAbsensiSiswaById,
  updateAbsensiSiswa,
  deleteAbsensiSiswa,
} = require("../controllers/absensiSiswaController");

const router = express.Router();

router.post("/", createAbsensiSiswa);
router.get("/", getAllAbsensiSiswa);
router.get("/:id", getAbsensiSiswaById);
router.put("/:id", updateAbsensiSiswa);
router.delete("/:id", deleteAbsensiSiswa);

module.exports = router;
