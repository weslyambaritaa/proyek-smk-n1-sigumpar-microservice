import express from "express";
import { verifikasiToken } from "../middleware/authMiddleware.js";
import {
  getAbsensiGuruMandiri,
  tambahAbsensiGuruMandiri,
} from "../controllers/absensiGuruMandiriController.js";

const router = express.Router();

router.route("/")
  .get(verifikasiToken, getAbsensiGuruMandiri)
  .post(verifikasiToken, tambahAbsensiGuruMandiri);

export default router;