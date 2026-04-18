#!/bin/bash
service postgresql start

echo "Menunggu PostgreSQL siap..."
until sudo -u postgres psql -c '\q' 2>/dev/null; do
  echo "PostgreSQL belum siap, tunggu 2 detik..."
  sleep 2
done
echo "PostgreSQL siap!"

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true
sudo -u postgres psql -d $DB_NAME -f ./init.sql || true

for f in migration_*.sql; do
  if [ -f "$f" ]; then
    echo "Running migration: $f"
    sudo -u postgres psql -d $DB_NAME -f ./$f || true
  fi
done

npm run dev