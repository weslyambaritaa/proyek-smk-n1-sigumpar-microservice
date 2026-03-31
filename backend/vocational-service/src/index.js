const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");
const path    = require("path");
const fs      = require("fs");
const { errorHandler } = require("./middleware/errorHandler");

const app  = express();
// const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

const vocationalRoutes = require("./routes/vocationalRoutes"); 

const app = express();
const PORT = process.env.PORT || 3007;
const path = require('path');

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(helmet({ crossOriginResourcePolicy: false }));
// 1. PINDAHKAN CORS KE SINI (Harus di atas sebelum rute!)
// app.use(cors());
app.use(helmet());
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
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "vocational-service", 
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/vocational", vocationalRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` });
});

// Error handler — selalu paling akhir
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vocational Service berjalan di http://localhost:${PORT}`);
});
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan di Vocational Service`,
  });
});

app.use(errorHandler);

// 2. TAMBAHKAN '0.0.0.0' AGAR BISA DIAKSES OLEH NGINX
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Vocational Service berjalan di port ${PORT}`);
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
