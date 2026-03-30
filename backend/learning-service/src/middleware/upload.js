// upload.js — support 3 file field sekaligus: silabus, rpp, modulAjar
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "video/mp4",
    "video/mpeg",
  ];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Format file tidak didukung. Gunakan PDF, DOC, DOCX, PPT, PPTX, atau MP4."), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// Untuk perangkat pembelajaran: 3 file sekaligus
// field name: silabus, rpp, modulAjar
const uploadPerangkat = upload.fields([
  { name: "silabus",   maxCount: 1 },
  { name: "rpp",       maxCount: 1 },
  { name: "modulAjar", maxCount: 1 },
]);

// Untuk absensi: 1 foto
const uploadFoto = upload.single("foto");

module.exports = { uploadPerangkat, uploadFoto };