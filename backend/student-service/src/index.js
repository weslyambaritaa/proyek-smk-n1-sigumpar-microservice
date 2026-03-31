// File: backend/academic-service/src/index.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const academicRoutes = require("./routes/academicRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3003;

// ============================================
// 🛡️ MIDDLEWARE GLOBAL
// ============================================
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 📁 SERVE STATIC FILES - UPLOADS
// ============================================
// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Folder uploads dibuat: ${uploadsDir}`);
}

// Serve folder uploads di path '/uploads'
// Agar match dengan data foto_url: "/uploads/nama-file.png"
app.use("/uploads", express.static(uploadsDir));

// ✅ Optional: Logging untuk request ke static files
// app.use("/uploads", (req, res, next) => {
//   console.log(`🖼️  Static file request: ${req.path}`);
//   next();
// }, express.static(uploadsDir));

// ============================================
// 🏥 HEALTH CHECK
// ============================================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "academic-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// 🗂️ MOUNT ROUTES
// ============================================
app.use("/api/academic", academicRoutes);

// ============================================
// ❌ 404 HANDLER (Harus setelah semua routes)
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
    path: req.path,
    method: req.method,
  });
});

// ============================================
// ⚠️ GLOBAL ERROR HANDLER (Selalu di paling akhir)
// ============================================
app.use(errorHandler);

// ============================================
// 🚀 START SERVER
// ============================================
const startServer = async () => {
  try {
    // Test database connection
    await pool.query("SELECT 1");
    console.log("✅ Koneksi Database Berhasil");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🎓 Academic Service running on port ${PORT}`);
      console.log(`📁 Uploads served at: http://localhost:${PORT}/uploads/`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/academic`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 SIGTERM received, shutting down gracefully");
  pool.end();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🔄 SIGINT received, shutting down gracefully");
  pool.end();
  process.exit(0);
});