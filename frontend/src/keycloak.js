import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'smk-sigumpar',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'smk-sigumpar'
};

const keycloak = new Keycloak(keycloakConfig);

/**
 * Fungsi untuk mengecek apakah user memiliki role tertentu
 * @param {string} roleName 
 * @returns {boolean}
 */
export const hasRole = (roleName) => {
  return keycloak.hasRealmRole(roleName);
};

export default keycloak;