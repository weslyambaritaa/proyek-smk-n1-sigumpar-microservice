const session = require("express-session");
const Keycloak = require("keycloak-connect");

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || "smk-sigumpar",
  "auth-server-url": process.env.KEYCLOAK_URL || "http://keycloak:8080",
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT_ID || "smk-sigumpar",
  "confidential-port": 0,
  bearerOnly: true,
};

module.exports = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "keyboard cat",
      resave: false,
      saveUninitialized: true,
      store: memoryStore,
    }),
  );

  const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
  app.use(keycloak.middleware());
  return keycloak;
};
