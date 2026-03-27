import express from "express";
import { verifikasiToken } from "../middleware/authMiddleware.js";
import { getDashboardGuru } from "../controllers/dashboardGuruController.js";

const router = express.Router();

router.get("/", verifikasiToken, getDashboardGuru);

export default router;