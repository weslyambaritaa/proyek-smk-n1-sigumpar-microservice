const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

module.exports = {
  uploadPerangkat: upload.fields([
    { name: "uploadSilabus", maxCount: 1 },
    { name: "uploadRPP", maxCount: 1 },
    { name: "modulAjar", maxCount: 1 },
  ]),
  uploadFoto: upload.single("foto"),
};