const express = require("express");
const cors = require("cors");
const vocationalRoutes = require("./routes/vocationalRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3004;

// ── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health Check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "vocational-service", port: PORT });
});

// ── Mount Routes ──────────────────────────────────────────────
app.use("/api/vocational", vocationalRoutes);

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SERVER] Vocational Service running on port ${PORT}`);
});
