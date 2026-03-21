const Keycloak = require('keycloak-connect');
const session = require('express-session');

function setupKeycloak(app) {
  const memoryStore = new session.MemoryStore();

  app.use(session({
    secret: 'some_secret_key',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  }));

  const keycloak = new Keycloak({ store: memoryStore }, {
    "realm": process.env.KEYCLOAK_REALM || "smk-sigumpar",
    "auth-server-url": "http://keycloak:8080/", // Internal Docker URL
    "ssl-required": "external",
    "resource": process.env.KEYCLOAK_CLIENT_ID || "backend-client",
    "bearer-only": true
  });

  return keycloak;
}

module.exports = setupKeycloak;