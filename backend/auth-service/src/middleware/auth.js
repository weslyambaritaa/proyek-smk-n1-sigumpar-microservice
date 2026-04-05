const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const authController = require('../controllers/authController');

// Support dua kemungkinan URL Keycloak (internal docker dan external)
const KEYCLOAK_INTERNAL = 'http://keycloak:8080';
const KEYCLOAK_EXTERNAL = 'http://localhost:8080';
const REALM = 'smk-sigumpar';

const client = jwksClient({
  jwksUri: `${KEYCLOAK_INTERNAL}/realms/${REALM}/protocol/openid-connect/certs`,
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

  // Coba verifikasi dengan issuer internal dulu, lalu external
  const issuers = [
    `${KEYCLOAK_INTERNAL}/realms/${REALM}`,
    `${KEYCLOAK_EXTERNAL}/realms/${REALM}`,
  ];

  const tryVerify = (issuerList, index = 0) => {
    if (index >= issuerList.length) {
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    jwt.verify(token, getKey, {
      issuer: issuerList[index],
      algorithms: ['RS256'],
    }, (err, decoded) => {
      if (err) {
        // Coba issuer berikutnya
        return tryVerify(issuerList, index + 1);
      }
      req.user = decoded;
      if (authController.syncUserFromToken) {
        authController.syncUserFromToken(decoded).catch(e => {
          console.error('Gagal sinkronisasi user:', e.message);
        });
      }
      next();
    });
  };

  tryVerify(issuers);
};

module.exports = verifyToken;
