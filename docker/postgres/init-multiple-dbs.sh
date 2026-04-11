#!/bin/bash
set -e

# Script ini dijalankan oleh postgres container saat pertama kali start.
# Membuat database + user masing-masing agar setiap service punya kredensial sendiri.

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL

  -- ── AUTH ──────────────────────────────────────────────────────────────
  CREATE USER auth_user WITH PASSWORD 'password';
  CREATE DATABASE auth_db OWNER auth_user;
  GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

  -- ── ACADEMIC ──────────────────────────────────────────────────────────
  CREATE USER academic_user WITH PASSWORD 'password';
  CREATE DATABASE academic_db OWNER academic_user;
  GRANT ALL PRIVILEGES ON DATABASE academic_db TO academic_user;

  -- ── ASSET ─────────────────────────────────────────────────────────────
  CREATE USER asset_user WITH PASSWORD 'password';
  CREATE DATABASE asset_db OWNER asset_user;
  GRANT ALL PRIVILEGES ON DATABASE asset_db TO asset_user;

  -- ── LEARNING ──────────────────────────────────────────────────────────
  CREATE USER learning_user WITH PASSWORD 'password';
  CREATE DATABASE learning_db OWNER learning_user;
  GRANT ALL PRIVILEGES ON DATABASE learning_db TO learning_user;

  -- ── STUDENT ───────────────────────────────────────────────────────────
  CREATE USER student_user WITH PASSWORD 'password';
  CREATE DATABASE student_db OWNER student_user;
  GRANT ALL PRIVILEGES ON DATABASE student_db TO student_user;

  -- ── VOCATIONAL ────────────────────────────────────────────────────────
  CREATE USER vocational_user WITH PASSWORD 'password';
  CREATE DATABASE vocational_db OWNER vocational_user;
  GRANT ALL PRIVILEGES ON DATABASE vocational_db TO vocational_user;

EOSQL