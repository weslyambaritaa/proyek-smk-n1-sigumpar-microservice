const { Pool } = require('pg');
const { execSync } = require('child_process');

// Pastikan PostgreSQL jalan
try {
  execSync('service postgresql start', { stdio: 'inherit' });
  console.log('PostgreSQL berhasil distart dari Node.js');
} catch (e) {
  console.log('PostgreSQL sudah jalan atau gagal start:', e.message);
}

// Tunggu sebentar agar PostgreSQL benar-benar siap menerima koneksi
const waitForPostgres = () => new Promise(resolve => {
  const check = () => {
    try {
      execSync('sudo -u postgres pg_isready -q', { stdio: 'pipe' });
      resolve();
    } catch {
      setTimeout(check, 1000);
    }
  };
  check();
});

// Setup user, database, dan tabel
const setupDatabase = async () => {
  await waitForPostgres();
  console.log('PostgreSQL siap, setup database...');

  const dbUser     = process.env.DB_USER     || 'academic_user';
  const dbPassword = process.env.DB_PASSWORD || 'password';
  const dbName     = process.env.DB_NAME     || 'academic_db';

  try {
    execSync(`sudo -u postgres psql -c "CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';" 2>/dev/null || true`, { stdio: 'pipe' });
    execSync(`sudo -u postgres psql -c "CREATE DATABASE ${dbName} OWNER ${dbUser};" 2>/dev/null || true`, { stdio: 'pipe' });
    execSync(`sudo -u postgres psql -d ${dbName} -f ./init.sql 2>/dev/null || true`, { stdio: 'pipe' });
    execSync(`sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};" 2>/dev/null || true`, { stdio: 'pipe' });
    console.log('Setup database selesai');
  } catch (e) {
    console.log('Setup database (mungkin sudah ada):', e.message);
  }
};

// Jalankan setup sebelum export pool
setupDatabase().catch(console.error);

const pool = new Pool({
  user: process.env.DB_USER || 'academic_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'academic_db',
  password: process.env.DB_PASSWORD || 'password',
  port: 5432,
});

// Retry koneksi sampai database siap (max 30x, jeda 3 detik)
const connectWithRetry = (retriesLeft = 30) => {
  pool.query('SELECT NOW()')
    .then(res => {
      console.log('Koneksi Database Berhasil pada:', res.rows[0].now);
    })
    .catch(err => {
      if (retriesLeft === 0) {
        console.error('Koneksi Database Gagal setelah beberapa percobaan:', err.message);
        return;
      }
      console.log(`Database belum siap, mencoba lagi... (sisa ${retriesLeft}x)`);
      setTimeout(() => connectWithRetry(retriesLeft - 1), 3000);
    });
};

connectWithRetry();

module.exports = pool;