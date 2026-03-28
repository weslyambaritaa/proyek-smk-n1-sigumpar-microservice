const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// Ambil dari environment variables (sudah diset di docker-compose)
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://keycloak:8080";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "smk-sigumpar";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "backend-client";

// Build JWKS URI
const jwksUri = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;

// Client untuk mengambil kunci publik
const client = jwksClient({
  jwksUri,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

// Fungsi untuk mendapatkan signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  // Verifikasi token
  jwt.verify(
    token,
    getKey,
    {
      issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
      algorithms: ["RS256"],
      audience: KEYCLOAK_CLIENT_ID, // tambahkan verifikasi audience
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).json({ message: "Token tidak valid" });
      }
      // Simpan data user ke request
      req.user = decoded;
      next();
    },
  );
};

module.exports = verifyToken;
