// File: src/utils/constUtil.js
require('dotenv').config();

// PROTEKSI KEAMANAN: Matikan aplikasi jika kredensial DB tidak diatur di .env
if (!process.env.DB_PASSWORD || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error("FATAL ERROR: Kredensial Database tidak ditemukan di file .env!");
  process.exit(1); 
}

module.exports = {
  APP: {
    PORT: process.env.PORT || 3001,
  },
  DB: {
    // Rahasia wajib diambil mutlak dari .env (Tanpa nilai default || '...')
    USER: process.env.DB_USER,
    NAME: process.env.DB_NAME,
    PASSWORD: process.env.DB_PASSWORD,
    
    // Konfigurasi umum boleh menggunakan nilai default
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 5432,
  }
};