const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");
const path    = require("path");
const fs      = require("fs");
const { errorHandler } = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 3007;

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static: serve foto upload
app.use("/api/pkl/uploads", express.static(uploadsDir));
//dslfklajfldkasjflkajsfk
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "vocational-service", timestamp: new Date().toISOString() });
});

// Mount routes
app.use("/api/pkl", require("./routes/vocationalRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` });
});

// Error handler — selalu paling akhir
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vocational Service berjalan di http://localhost:${PORT}`);
});
