import express from "express";
import { verifikasiToken } from "../middleware/authMiddleware.js";
import { uploadFile } from "../middleware/uploadMiddleware.js";
import { uploadAset } from "../controllers/assetController.js";

const router = express.Router();

router.post("/upload", verifikasiToken, uploadFile.single("file"), uploadAset);

export default router;