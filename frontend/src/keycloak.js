import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "smk-sigumpar",
  clientId: "smk-sigumpar",
  redirectUri: "http://localhost:5173", // Selalu redirect ke root domain
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

/**
 * Fungsi untuk mendapatkan role utama user seperti di login awal
 * Mengambil role dari realm_access (standar Keycloak), bukan user.role
 * @returns {string} role utama atau 'user' jika tidak ada
 */
export const getUserRole = () => {
  const SYSTEM_ROLES = [
    "tata-usaha",
    "guru-mapel",
    "kepala-sekolah",
    'waka-sekolah',
    'wali-kelas',
    'pramuka',
    'vokasi',
  ];
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  return realmRoles.find((r) => SYSTEM_ROLES.includes(r)) || "user";
};

/**
 * Fungsi untuk mendapatkan user ID
 * @returns {string} user ID
 */
export const getUserId = () => {
  return keycloak.tokenParsed?.sub || keycloak.tokenParsed?.userId;
};

export default keycloak;
