const { Pool } = require('pg');

// ✅ FIX: Pakai environment variable, bukan hardcode ke keycloak-db
// auth-service punya database sendiri (auth_db), bukan memakai database Keycloak
const pool = new Pool({
  user:     process.env.DB_USER     || 'auth_user',
  host:     process.env.DB_HOST     || 'postgres',  
  database: process.env.DB_NAME     || 'auth_db',
  password: process.env.DB_PASSWORD || 'password',
  port:     parseInt(process.env.DB_PORT) || 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Koneksi Database auth_db Gagal:', err.stack);
  } else {
    console.log('Koneksi Database auth_db Berhasil pada:', res.rows[0].now);
  }
});

module.exports = pool;