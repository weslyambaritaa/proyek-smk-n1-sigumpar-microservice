const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const vocationalRoutes = require("./routes/vocationalRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3007;

// ── Middleware Global ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "vocational-service",
    timestamp: new Date().toISOString(),
  });
});

// ── Mount Routes ───────────────────────────────────────────
app.use("/api/vocational", vocationalRoutes);

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan`,
  });
});

// ── Error Handler (selalu di akhir) ───────────────────────
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Vocational Service berjalan di http://0.0.0.0:${PORT}`);
});
