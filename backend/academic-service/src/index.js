const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path"); // Posisikan import di atas
const academicRoutes = require("./routes/academicRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(extractIdentity);

const PORT = process.env.PORT || 3003;

// Middleware global
app.use(helmet());
// app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev"));
app.use(express.json());

// =======================================================
// POSISI YANG BENAR UNTUK FOLDER UPLOADS
// Harus di atas 404 handler!
// =======================================================
app.use(
  "/api/academic/uploads",
  express.static(path.join(__dirname, "../uploads")),
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "academic-service",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use("/api/academic", academicRoutes);

// 404 handler (Akan dieksekusi JIKA tidak ada route atau file static yang cocok)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// Error handler (selalu di akhir)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Academic Service running on port ${PORT}`);
});
