import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import perangkatPembelajaranRoutes from "./routes/perangkatPembelajaranRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

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
    service: "learning-service",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Learning Service Aktif",
  });
});

app.use("/api/learning/perangkat-pembelajaran", perangkatPembelajaranRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Learning Service running on port ${PORT}`);
});