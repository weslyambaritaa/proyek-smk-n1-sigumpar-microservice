const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const authController = require('../controllers/authController');

// Ambil public key dari Keycloak pakai nama container Docker
const client = jwksClient({
  jwksUri: `http://keycloak:8080/realms/smk-sigumpar/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      console.error("JWKS Error:", err.message);
      return callback(err);
    }
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
    // TIDAK pakai issuer — token dari browser ber-issuer http://localhost:8080
    // tapi JWKS diambil dari http://keycloak:8080 (nama container)
    // Kalau issuer divalidasi akan SELALU GAGAL di environment Docker
  }, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ message: 'Token tidak valid', detail: err.message });
    }

    req.user = decoded;

    if (authController.syncUserFromToken) {
      authController.syncUserFromToken(decoded).catch(syncErr => {
        console.error("Gagal sinkronisasi user:", syncErr.message);
      });
    }

    next();
  });
};

module.exports = verifyToken;