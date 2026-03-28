const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./learningRoutes"); // import aggregator routes
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3003;

// ==========================================
// MIDDLEWARE GLOBAL
// ==========================================
app.use(helmet()); // security headers
app.use(cors()); // enable CORS (allow all origins in dev)
app.use(morgan("dev")); // request logging
app.use(express.json()); // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse form-data (for file uploads)

// ==========================================
// ROUTES
// ==========================================
// Semua endpoint API akan diawali dengan /api
app.use("/api", apiRoutes);

// Health check endpoint (untuk monitoring)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "academic-service",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler untuk route yang tidak ditemukan
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

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Academic service running on port ${PORT}`);
});
