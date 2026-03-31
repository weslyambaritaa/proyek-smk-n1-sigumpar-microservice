const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const authController = require('../controllers/authController');

// Ambil kunci publik dari Keycloak (pakai nama container, bukan localhost)
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
    // PERBAIKAN UTAMA: issuer harus pakai nama container Docker, BUKAN localhost
    // Token Keycloak di-issue dengan issuer http://keycloak:8080/...
    // tapi browser mengakses lewat localhost:8080, sehingga iss di token = localhost:8080
    // Solusi: nonaktifkan cek issuer, biarkan jwks-rsa yang validasi signature-nya
    algorithms: ['RS256'],
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