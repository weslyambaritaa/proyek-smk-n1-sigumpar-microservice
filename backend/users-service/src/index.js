const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import file lokal
const setupKeycloak = require("./middleware/auth");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/errorHandler");

// Inisialisasi aplikasi Express
const app = express();

// ==========================================
// MIDDLEWARE GLOBAL
// ==========================================
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());

// ==========================================
// HEALTH CHECK (Tidak diproteksi agar bisa dicek oleh Docker)
// ==========================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "users-service",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// AUTHENTICATION & ROUTES
// ==========================================
// Inisialisasi Keycloak
const keycloak = setupKeycloak(app);

// Mount route users dengan proteksi Keycloak
// Endpoint API menjadi: http://localhost:8001/api/users/...
app.use("/api/users", keycloak.protect(), userRoutes);

// ==========================================
// FALLBACK & ERROR HANDLER
// ==========================================
// Handler untuk route yang tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// Error Handler global (harus paling akhir)
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Users Service running on port ${PORT}`);
});