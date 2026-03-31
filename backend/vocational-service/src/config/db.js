const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: process.env.DB_USER || "vocational_user",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "vocational_db",
      password: process.env.DB_PASSWORD || "password",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    });

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Koneksi Database Gagal:", err.stack);
  } else {
    console.log("✅ Koneksi Database Berhasil pada:", res.rows[0].now);
  }
});

module.exports = pool;
