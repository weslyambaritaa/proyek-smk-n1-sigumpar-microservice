import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import assetRoutes from "./routes/assetRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "asset-service",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Asset Service Aktif",
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/assets", assetRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Asset Service running on port ${PORT}`);
});