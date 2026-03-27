import express from "express";
import {
  getSemuaPerangkatPembelajaran,
  tambahPerangkatPembelajaran,
  hapusPerangkatPembelajaran,
} from "../controllers/perangkatPembelajaranController.js";

const router = express.Router();

router.get("/", getSemuaPerangkatPembelajaran);
router.post("/", tambahPerangkatPembelajaran);
router.delete("/:id", hapusPerangkatPembelajaran);

export default router;