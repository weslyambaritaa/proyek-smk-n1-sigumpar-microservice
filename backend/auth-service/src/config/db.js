const { Pool } = require('pg');

// Mengubah koneksi agar langsung menembak ke keycloak-db
const pool = new Pool({
  user: 'keycloak',
  host: 'keycloak-db', // Nama service Keycloak DB di docker-compose
  database: 'keycloak',
  password: 'keycloakpassword',
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Koneksi ke Keycloak DB Gagal:', err.stack);
  } else {
    console.log('Berhasil terhubung ke Keycloak DB pada:', res.rows[0].now);
  }
});

module.exports = pool;