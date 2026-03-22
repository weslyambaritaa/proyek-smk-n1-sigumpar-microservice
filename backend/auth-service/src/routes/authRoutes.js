const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Sesuaikan dengan nama file controller Anda (authController.js)
const authController = require('../controllers/authController');

// Gunakan nama variabel yang sama (authController)
router.get('/', verifyToken, authController.getAll); 
router.get('/users/search', verifyToken, authController.searchUsers); // Tambahkan untuk search wali kelas