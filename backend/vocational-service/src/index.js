const express  = require("express");
const helmet   = require("helmet");
const morgan   = require("morgan");
const path     = require("path");
const { errorHandler } = require("./middleware/errorHandler");
const vocationalRoutes = require("./routes/vocationalRoutes");

const app  = express();
const PORT = process.env.PORT || 3007;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── Static: sajikan file upload foto PKL ─────────────────────────────────
//
// ✅ FIX: Dua path static diperlukan:
//
// 1. "/uploads" — untuk request yang datang VIA NGINX:
//    nginx mem-proxy /api/vocational/uploads/foo.jpg → :3007/uploads/foo.jpg
//    sehingga Express menerima path /uploads/foo.jpg (prefix sudah di-strip nginx)
//
// 2. "/api/vocational/uploads" — untuk request LANGSUNG ke service (dev/debug):
//    jika frontend/browser hit :3007 langsung tanpa nginx
//
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/vocational/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "vocational-service", timestamp: new Date().toISOString() });
});

app.use("/api/vocational", vocationalRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan di Vocational Service` });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vocational Service berjalan di port ${PORT}`);
});