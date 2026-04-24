const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "keycloak",
  host: process.env.DB_HOST || "keycloak-db",
  database: process.env.DB_NAME || "keycloak",
  password: process.env.DB_PASSWORD || "keycloakpassword",
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Koneksi database auth-service gagal:", err.stack);
  } else {
    console.log(
      "Koneksi database auth-service berhasil pada:",
      res.rows[0].now,
    );
  }
});

module.exports = pool;
