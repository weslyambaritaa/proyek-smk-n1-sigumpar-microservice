const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController'); // Sesuaikan nama

// Tambahkan rute pencarian untuk Wali Kelas
router.get('/users/search', verifyToken, authController.searchUsers);
router.get('/', verifyToken, authController.getAll);

module.exports = router;