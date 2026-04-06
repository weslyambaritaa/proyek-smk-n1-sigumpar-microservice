const axios = require("axios");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://keycloak:8080";
const REALM = process.env.KEYCLOAK_REALM || "smk-sigumpar";
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "admin-cli";
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || ""; // bisa kosong jika public

let adminToken = null;
let tokenExpiry = 0;

// Mendapatkan token admin menggunakan Client Credentials
async function getAdminToken() {
  if (adminToken && Date.now() < tokenExpiry) return adminToken;

  const tokenUrl = `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  if (CLIENT_SECRET) params.append("client_secret", CLIENT_SECRET);

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    adminToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000 - 5000;
    return adminToken;
  } catch (error) {
    console.error(
      "Gagal mendapatkan token admin Keycloak:",
      error.response?.data || error.message,
    );
    throw new Error("Keycloak admin authentication failed");
  }
}

// Ambil daftar user dengan role tertentu (misal 'guru-mapel')
async function getUsersByRole(roleName) {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_URL}/admin/realms/${REALM}/users`;
  // Keycloak tidak support filter by role langsung di endpoint /users, jadi ambil semua user lalu filter
  // Atau gunakan endpoint /roles/{role-name}/users (lebih efisien)
  const roleUsersUrl = `${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${roleName}/users`;
  try {
    const response = await axios.get(roleUsersUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // array of user objects
  } catch (error) {
    console.error(
      `Gagal mengambil user dengan role ${roleName}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Format data guru sesuai kebutuhan frontend
async function getAllGuru() {
  const users = await getUsersByRole("guru-mapel");
  return users.map((user) => ({
    id_guru: user.id,
    nama:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || user.email,
    nip: user.attributes?.nip?.[0] || null,
    mapel_diampu: user.attributes?.mapel_diampu?.[0] || null,
    email: user.email,
    username: user.username,
  }));
}

module.exports = { getAllGuru };
