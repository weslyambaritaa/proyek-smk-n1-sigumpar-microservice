#!/bin/bash
service postgresql start
sleep 3

# Buat user jika belum ada, kalau sudah ada update passwordnya
sudo -u postgres psql -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  ELSE
    ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END \$\$;" || true

# Buat database jika belum ada
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true

# Grant akses
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || true

# Inisialisasi tabel
sudo -u postgres psql -d $DB_NAME -f ./init.sql || true

npm run dev