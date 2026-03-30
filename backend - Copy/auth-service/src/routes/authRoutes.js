const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth'); 
const authController = require('../controllers/authController');

// ========================================================
// RUTE SUPER PENTING UNTUK SATPAM NGINX
// ========================================================
router.get('/verify', verifyToken, (req, res) => {
    try {
        const user = req.user || {};
        const userId = user.id || user.sub || 'unknown_id';
        const userRole = user.role || 'user';

        // Sisipkan identitas ke header agar Nginx bisa membacanya
        res.setHeader('X-User-Id', userId);
        res.setHeader('X-User-Role', userRole);
        
        // Wajib balas 200 OK agar Nginx meloloskan request
        res.status(200).send('OK');
    } catch (err) {
        console.error("Error in /verify route:", err);
        res.status(500).json({ message: "Verification Failed" });
    }
});

// Rute lainnya
router.get('/users/search', verifyToken, authController.searchUsers);
router.get('/', verifyToken, authController.getAll);

module.exports = router;