const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

// 1. PASTIKAN IMPORT FILE ROUTES YANG BENAR
const vocationalRoutes = require("./routes/vocationalRoutes"); 

const app = express();
const PORT = process.env.PORT || 3007;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "vocational-service", // Update nama service agar sesuai
    timestamp: new Date().toISOString(),
  });
});

// 2. MOUNT ROUTES DENGAN PREFIX /api/vocational
// Ini agar match dengan request dari Nginx: http://localhost:8001/api/vocational/...
app.use("/api/vocational", vocationalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan di Vocational Service`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Vocational Service berjalan di http://localhost:${PORT}`);
});
app.use(cors());