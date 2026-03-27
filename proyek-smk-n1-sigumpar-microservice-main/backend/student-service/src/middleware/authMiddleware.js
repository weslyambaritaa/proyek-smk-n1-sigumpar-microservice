const { createRemoteJWKSet, jwtVerify } = require("jose");

const keycloakUrl = process.env.KEYCLOAK_URL;
const realm = process.env.KEYCLOAK_REALM;
const audience = process.env.KEYCLOAK_CLIENT_ID;

// issuer dibentuk dari KEYCLOAK_URL + KEYCLOAK_REALM
const issuer = `${keycloakUrl}/realms/${realm}`;

if (!keycloakUrl || !realm || !audience) {
  throw new Error(
    "KEYCLOAK_URL, KEYCLOAK_REALM, atau KEYCLOAK_CLIENT_ID belum diisi di .env"
  );
}

const JWKS = createRemoteJWKSet(
  new URL(`${issuer}/protocol/openid-connect/certs`)
);

const verifikasiToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience
    });

    req.user = {
      id: payload.sub,
      nama: payload.name || payload.preferred_username || "Tanpa Nama",
      roles: payload.realm_access?.roles || []
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid",
      detail: error.message
    });
  }
};

module.exports = {
  verifikasiToken
};