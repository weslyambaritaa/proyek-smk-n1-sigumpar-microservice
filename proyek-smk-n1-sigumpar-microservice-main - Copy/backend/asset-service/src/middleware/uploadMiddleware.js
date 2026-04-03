import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createError } from "./errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootUploadPath = path.join(__dirname, "../uploads");

const pastikanFolderAda = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

pastikanFolderAda(rootUploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const kategori = req.body.kategori;

    if (!kategori) {
      return cb(new Error("Kategori upload wajib diisi"), null);
    }

    const allowedFolders = ["absensi-guru", "perangkat-pembelajaran"];

    if (!allowedFolders.includes(kategori)) {
      return cb(new Error("Kategori upload tidak valid"), null);
    }

    const tujuan = path.join(rootUploadPath, kategori);
    pastikanFolderAda(tujuan);

    cb(null, tujuan);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const namaAman = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${namaAman}`);
  },
});

const fileFilter = (req, file, cb) => {
  const kategori = req.body.kategori;

  if (kategori === "absensi-guru") {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File absensi guru harus berupa gambar"), false);
    }
  }

  if (kategori === "perangkat-pembelajaran") {
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("File perangkat pembelajaran harus PDF atau DOC/DOCX"), false);
    }
  }

  cb(null, true);
};

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
});