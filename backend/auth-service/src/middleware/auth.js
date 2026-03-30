const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const authController = require("../controllers/authController");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://localhost:8080";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "smk-sigumpar";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "smk-sigumpar";
const KEYCLOAK_ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

const allowedIssuers = [KEYCLOAK_ISSUER];

if (
  !KEYCLOAK_URL.includes("localhost") &&
  !KEYCLOAK_URL.includes("127.0.0.1")
) {
  allowedIssuers.push(`http://localhost:8080/realms/${KEYCLOAK_REALM}`);
}

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

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      issuer: allowedIssuers,
      audience: KEYCLOAK_CLIENT_ID,
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        return res
          .status(403)
          .json({ message: "Token tidak valid", detail: err.message });
      }

      req.user = decoded;

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
