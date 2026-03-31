const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const authController = require("../controllers/authController");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://keycloak:8080";
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
  cacheMaxEntries: 50,
  cacheMaxAge: 24 * 60 * 60 * 1000, // cache selama 1 hari
  rateLimit: true,
  jwksRequestsPerMinute: 1000,
  timeout: 30000,
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

  const decodedToken = jwt.decode(token, { complete: true });
  const tokenAud = decodedToken?.payload?.aud;
  const verifyOptions = {
    algorithms: ["RS256"],
    issuer: allowedIssuers,
  };

  if (tokenAud) {
    const audienceMatches = Array.isArray(tokenAud)
      ? tokenAud.includes(KEYCLOAK_CLIENT_ID)
      : tokenAud === KEYCLOAK_CLIENT_ID;

    if (audienceMatches) {
      verifyOptions.audience = KEYCLOAK_CLIENT_ID;
    } else {
      console.warn(
        "Token aud tidak cocok dengan client ID; memverifikasi tanpa audience agar token Keycloak yang valid tetap diterima.",
      );
    }
  }

  jwt.verify(token, getKey, verifyOptions, (err, decoded) => {
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
  });
};

module.exports = verifyToken;
