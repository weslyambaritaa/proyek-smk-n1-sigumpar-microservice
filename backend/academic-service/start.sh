#!/bin/bash
# Menjalankan PostgreSQL di background
service postgresql start
sleep 5

# Membuat User dan Database sesuai variabel lingkungan
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true

# Inisialisasi tabel dari file init.sql (schema utama)
sudo -u postgres psql -d $DB_NAME -f ./init.sql || true

# FIX: Jalankan migration nilai_siswa agar tabel selalu ada
# (aman dijalankan berulang karena menggunakan CREATE TABLE IF NOT EXISTS)
sudo -u postgres psql -d $DB_NAME -f ./migration_nilai.sql || true

# Menjalankan aplikasi Node.js
npm run dev