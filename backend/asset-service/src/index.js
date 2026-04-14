const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware global (identik dengan users-service)
app.use(helmet());
// app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev"));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "asset-service",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
const assetRoutes = require("./routes/assetRoutes");
app.use("/api/asset", assetRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// Error handler (selalu di akhir)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Asset Service running on port ${PORT}`);
});
