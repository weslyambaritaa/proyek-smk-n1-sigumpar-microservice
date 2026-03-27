import express from "express";
import { verifikasiToken } from "../middleware/authMiddleware.js";
import {
  getDataNilaiSiswa,
  simpanNilaiSiswa,
} from "../controllers/nilaiSiswaController.js";

const router = express.Router();

router.route("/")
  .get(verifikasiToken, getDataNilaiSiswa)
  .post(verifikasiToken, simpanNilaiSiswa);

export default router;