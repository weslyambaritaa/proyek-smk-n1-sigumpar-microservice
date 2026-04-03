import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const keycloakUrl = process.env.KEYCLOAK_URL || "http://localhost:8080";
const realm = process.env.KEYCLOAK_REALM || "smk-sigumpar";

const client = jwksClient({
  jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan",
    });
  }

  jwt.verify(
    token,
    getKey,
    {
      issuer: `${keycloakUrl}/realms/${realm}`,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(403).json({
          success: false,
          message: "Token tidak valid",
        });
      }

      req.user = decoded;
      next();
    }
  );
};