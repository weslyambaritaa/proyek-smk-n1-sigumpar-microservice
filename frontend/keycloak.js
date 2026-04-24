import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "smk-sigumpar",
  clientId: "smk-sigumpar",
});

export const hasRole = (role) => keycloak.hasRealmRole(role);

export default keycloak;
