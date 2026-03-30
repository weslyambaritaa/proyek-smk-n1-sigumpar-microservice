const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const authController = require("../controllers/authController");

// ── Keycloak URL dari env (dalam Docker = http://keycloak:8080) ──
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://keycloak:8080";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "smk-sigumpar";

// JWKS client membaca public key dari Keycloak
const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("JWKS getSigningKey error:", err.message);
      return callback(err);
    }
    callback(null, key.getPublicKey());
  });
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  // ── PERBAIKAN UTAMA: issuer harus KEYCLOAK_URL (bukan localhost) ──
  // Token diterbitkan oleh Keycloak dengan issuer = KEYCLOAK_URL,
  // tapi browser membuka http://localhost:8080 → issuer di token = localhost:8080
  // Solusi: nonaktifkan validasi issuer di sini, Nginx sudah menjadi gatekeeper
  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      // issuer sengaja TIDAK diset di sini agar fleksibel di Docker maupun lokal
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        return res
          .status(403)
          .json({ message: "Token tidak valid", detail: err.message });
      }

      req.user = decoded;

      // Sinkronisasi user ke background (tidak blocking)
      if (authController.syncUserFromToken) {
        authController
          .syncUserFromToken(decoded)
          .catch((e) => console.error("Gagal sinkronisasi user:", e.message));
      }

      next();
    },
  );
};

module.exports = verifyToken;
