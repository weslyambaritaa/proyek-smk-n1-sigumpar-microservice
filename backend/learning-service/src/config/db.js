const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const poolConfig = connectionString
  ? { connectionString }
  : {
      user: process.env.DB_USER || "learning_user",
      host: process.env.DB_HOST || "keycloak-db",
      database: process.env.DB_NAME || "learning_db",
      password: process.env.DB_PASSWORD || "password",
      port: Number(process.env.DB_PORT || 5432),
    };

const pool = new Pool(poolConfig);
module.exports = pool;

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Koneksi Database Gagal:", err.stack);
  } else {
    console.log("Koneksi Database Berhasil pada:", res.rows[0].now);
  }
});
