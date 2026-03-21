const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import file lokal (Sesuaikan dengan nama file route Anda)
const setupKeycloak = require("./middleware/auth");
const studentRoutes = require("./routes/studentRoutes"); 
const { errorHandler } = require("./middleware/errorHandler");

// Inisialisasi aplikasi Express
const app = express();

// Middleware Global
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

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "student-service",
    timestamp: new Date().toISOString(),
  });
});

// Inisialisasi Keycloak & Proteksi Route
const keycloak = setupKeycloak(app);

// Gunakan studentRoutes, BUKAN userRoutes
app.use("/api/students", keycloak.protect(), studentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3005; // Port khusus student-service
app.listen(PORT, () => {
  console.log(`✅ Student Service running on port ${PORT}`);
});