const multer = require("multer");
const path = require("path");

// Konfigurasi penyimpanan di memory (buffer) agar bisa dikonversi ke base64
const storage = multer.memoryStorage();

// Filter file: hanya gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif)"));
  }
};

// Batas ukuran file (5MB)
const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({
  storage,
  limits,
  fileFilter,
});

module.exports = upload;
