const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/errorHandler");

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// MIDDLEWARE GLOBAL
// ==========================================

// Helmet: Menambahkan berbagai HTTP security headers secara otomatis
app.use(helmet());

// CORS: Mengizinkan request dari frontend dan service lain
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Di production, isi dengan domain spesifik
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Morgan: Logger untuk setiap HTTP request (format 'dev' = berwarna di terminal)
app.use(morgan("dev"));

// Body Parser: Mengizinkan Express membaca JSON dari request body
app.use(express.json());

// ==========================================
// ROUTES
// ==========================================

// Health check endpoint — digunakan Docker dan load balancer untuk cek status service
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "users-service",
    timestamp: new Date().toISOString(),
  });
});

// Mount semua route users di prefix /users
app.use("/users", userRoutes);

// Handler untuk route yang tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// ==========================================
// ERROR HANDLER (harus paling akhir)
// ==========================================
app.use(errorHandler);

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Users Service berjalan di http://localhost:${PORT}`);
});