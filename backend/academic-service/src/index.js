const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");
const path    = require("path");
const fs      = require("fs");
const mime    = require("mime-types");
const academicRoutes = require("./routes/academicRoutes");
const { errorHandler } = require("./middleware/errorHandler");

// Inisialisasi koneksi Sequelize + semua model saat app pertama kali start
require("./models");

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Serve upload files dengan MIME type yang benar (mencegah file corrupt)
app.get("/uploads/:filename", (req, res) => {
  const safeName = path.basename(req.params.filename);
  const filePath = path.join(__dirname, "../uploads", safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File tidak ditemukan" });
  }

  const mimeType = mime.lookup(safeName) || "application/octet-stream";
  const inlineTypes = [
    "image/jpeg", "image/jpg", "image/png",
    "image/gif", "image/webp", "application/pdf",
  ];
  const disposition = inlineTypes.includes(mimeType) ? "inline" : "attachment";

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `${disposition}; filename="${safeName}"`);
  res.sendFile(filePath);
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "academic-service", timestamp: new Date().toISOString() });
});

app.use("/api/academic", academicRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Academic Service running on port ${PORT}`);
});