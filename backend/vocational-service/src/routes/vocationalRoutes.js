const express       = require("express");
const router        = express.Router();
const multer        = require("multer");
const path          = require("path");
const extractIdentity = require("../middleware/extractIdentity");
const pklCtrl       = require("../controllers/pklController");
const penempatanCtrl = require("../controllers/pklPenempatanController");

// Konfigurasi multer untuk upload foto penempatan
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Semua route PKL memerlukan autentikasi
router.use(extractIdentity);

// --- Submissions ---
router.get("/submissions",              pklCtrl.getAllPKL);
router.post("/submissions",             pklCtrl.createSubmission);
router.put("/submissions/:id/validate", pklCtrl.validateAndApprovePKL);

// --- Penempatan ---
router.get("/penempatan",  penempatanCtrl.getAll);
router.post("/penempatan", upload.single("foto_lokasi"), penempatanCtrl.create);

module.exports = router;
