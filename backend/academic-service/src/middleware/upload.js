const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Ambil ekstensi dari mimetype, bukan dari nama file asli
        const mimeToExt = {
            'image/jpeg'      : '.jpg',
            'image/png'       : '.png',
            'image/jpg'       : '.jpg',
            'image/webp'      : '.webp',
            'application/pdf' : '.pdf',
        };
        const ext = mimeToExt[file.mimetype] || path.extname(file.originalname) || '';
        cb(null, 'upload-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipe file tidak didukung: ${file.mimetype}`), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});