const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Tambahkan pengecekan manual untuk debugging jika perlu
if (!authController.searchUsers) {
    console.error("ERROR: Fungsi searchUsers tidak ditemukan di authController!");
}

router.get('/users/search', verifyToken, authController.searchUsers);
router.get('/', verifyToken, authController.getAll);

module.exports = router;