const express  = require("express");
const helmet   = require("helmet");
const morgan   = require("morgan");
const path     = require("path");
const fs       = require("fs");
const mime     = require("mime-types");
const { errorHandler } = require("./middleware/errorHandler");
const vocationalRoutes = require("./routes/vocationalRoutes");

const app  = express();
const PORT = process.env.PORT || 3007;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// FIX #4: Endpoint download file dengan MIME type yang tepat
// Menggantikan express.static yang tidak selalu mengirim Content-Type benar untuk .docx
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  // Sanitasi nama file untuk mencegah path traversal
  const safeName = path.basename(filename);
  const filePath = path.join(__dirname, "../uploads", safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File tidak ditemukan" });
  }

  // Tentukan MIME type berdasarkan ekstensi file asli
  const mimeType = mime.lookup(safeName) || "application/octet-stream";

  // Tentukan apakah file bisa ditampilkan inline (gambar/PDF) atau harus didownload
  const inlineTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf"];
  const disposition = inlineTypes.includes(mimeType) ? "inline" : "attachment";

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `${disposition}; filename="${safeName}"`);
  res.sendFile(filePath);
});

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
