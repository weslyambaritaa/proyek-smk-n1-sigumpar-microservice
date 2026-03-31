const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");
const learningRoutes = require("./routes/learningRoutes");

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware Keamanan (Tanpa CORS dari Express)
app.use(helmet());

// Logging & Parsing
app.use(morgan("dev"));
app.use(express.json());

// ========================================================
// 🛡️ PENGHANCUR HEADER GANDA
// Mencegah Express mengirim header CORS yang bikin bentrok dengan Nginx
// ========================================================
app.use((req, res, next) => {
  res.removeHeader("Access-Control-Allow-Origin");
  next();
});

// Route Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "learning-service", timestamp: new Date().toISOString() });
});

// Route Utama Learning Service
app.use("/api/learning", learningRoutes);

// Route Not Found (404)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` });
});

// Global Error Handler
app.use(errorHandler);

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Learning Service running on port ${PORT}`);
});