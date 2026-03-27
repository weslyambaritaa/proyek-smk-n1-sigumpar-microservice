import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import academicRoutes from "./routes/academicRoutes.js";
import dashboardGuruRoutes from "./routes/dashboardGuruRoutes.js";
import absensiGuruMandiriRoutes from "./routes/absensiGuruMandiriRoutes.js";
import absensiSiswaRoutes from "./routes/absensiSiswaRoutes.js";
import nilaiSiswaRoutes from "./routes/nilaiSiswaRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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
    service: "academic-service",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Academic Service Aktif",
  });
});

app.use("/api/academic", academicRoutes);
app.use("/api/academic/dashboard-guru", dashboardGuruRoutes);
app.use("/api/academic/absensi-guru-mandiri", absensiGuruMandiriRoutes);
app.use("/api/academic/absensi-siswa", absensiSiswaRoutes);
app.use("/api/academic/nilai-siswa", nilaiSiswaRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Academic Service running on port ${PORT}`);
});