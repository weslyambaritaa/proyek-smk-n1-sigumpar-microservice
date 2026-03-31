const { Pool } = require("pg");

// Mengubah koneksi agar langsung menembak ke keycloak-db
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: process.env.DB_USER || "keycloak",
      host: process.env.DB_HOST || "keycloak-db",
      database: process.env.DB_NAME || "keycloak",
      password: process.env.DB_PASSWORD || "keycloakpassword",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    });

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Koneksi ke Keycloak DB Gagal:", err.stack);
  } else {
    console.log("Berhasil terhubung ke Keycloak DB pada:", res.rows[0].now);
  }
});

module.exports = pool;
