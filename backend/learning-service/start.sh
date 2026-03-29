#!/bin/sh
# Menjalankan PostgreSQL di background
service postgresql start
sleep 3

# Membuat User dan Database sesuai variabel lingkungan
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true

# Inisialisasi tabel dari file init.sql yang sudah disalin
sudo -u postgres psql -d $DB_NAME -f ./init.sql || true

# Menjalankan aplikasi Node.js
npm run dev