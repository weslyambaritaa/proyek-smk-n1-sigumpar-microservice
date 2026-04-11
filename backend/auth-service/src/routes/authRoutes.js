const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth'); 
const authController = require('../controllers/authController');

// Role-role yang dikenali sistem (sesuai realm Keycloak)
const SYSTEM_ROLES = [
  'tata-usaha',
  'guru-mapel',
  'kepala-sekolah',
  'wakil-kepsek',
  'wali-kelas',
  'pramuka',
];

// ========================================================
// RUTE SUPER PENTING UNTUK SATPAM NGINX
// ========================================================
router.get('/verify', verifyToken, (req, res) => {
    try {
        const user = req.user || {};
        const userId = user.sub || user.id || 'unknown_id';

        // Ambil role dari realm_access (standar Keycloak), bukan user.role
        const realmRoles = user.realm_access?.roles || [];
        const userRole = realmRoles.find(r => SYSTEM_ROLES.includes(r)) || 'user';

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