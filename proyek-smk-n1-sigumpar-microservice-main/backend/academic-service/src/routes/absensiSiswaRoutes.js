import express from "express";
import { verifikasiToken } from "../middleware/authMiddleware.js";
import {
  getDataAbsensiSiswa,
  simpanAbsensiSiswa,
} from "../controllers/absensiSiswaController.js";

const router = express.Router();

router.route("/")
  .get(verifikasiToken, getDataAbsensiSiswa)
  .post(verifikasiToken, simpanAbsensiSiswa);

export default router;