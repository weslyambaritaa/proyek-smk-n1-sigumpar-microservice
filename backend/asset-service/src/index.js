const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");
const todoRoutes = require("./routes/assetRoutes");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "asset-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/todos", todoRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Asset Service running on port ${PORT}`);
});