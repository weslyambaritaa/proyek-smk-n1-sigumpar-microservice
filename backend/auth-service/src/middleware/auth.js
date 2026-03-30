const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// 1. TAMBAHKAN IMPORT CONTROLLER DI SINI
const authController = require('../controllers/authController');

const client = jwksClient({
  jwksUri: `http://keycloak:8080/realms/smk-sigumpar/protocol/openid-connect/certs`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  jwt.verify(token, getKey, {
    issuer: `http://localhost:8080/realms/smk-sigumpar`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    
    req.user = decoded;

    // 2. TAMBAHKAN LOGIK SINKRONISASI DI SINI
    // Jalankan secara background agar tidak menghambat request
    if (authController.syncUserFromToken) {
      authController.syncUserFromToken(decoded).catch(err => {
        console.error("Gagal sinkronisasi user ke database:", err.message);
      });
    }

    next();
  });
};

module.exports = verifyToken;