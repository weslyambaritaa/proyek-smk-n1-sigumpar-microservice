const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { errorHandler } = require("./middleware/errorHandler");
const assetRoutes = require("./routes/assetRoutes");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "asset-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/asset", assetRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Asset Service running on port ${PORT}`);
});
