const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const authController = require('../controllers/authController');

const client = jwksClient({
  jwksUri: `http://keycloak:8080/realms/smk-sigumpar/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
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
    algorithms: ['RS256'],
    // TIDAK pakai issuer check karena token dari browser ber-issuer localhost:8080
    // tapi JWKS diambil dari keycloak:8080 (nama container Docker)
    // Validasi signature RS256 sudah cukup aman
  }, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: 'Token tidak valid', detail: err.message });
    }

    req.user = decoded;

    if (authController.syncUserFromToken) {
      authController.syncUserFromToken(decoded).catch(err => {
        console.error("Gagal sinkronisasi user:", err.message);
      });
    }

    next();
  });
};

module.exports = verifyToken;