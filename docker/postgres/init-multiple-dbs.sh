#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER auth_user WITH PASSWORD 'password';
  CREATE DATABASE auth_db OWNER auth_user;

  CREATE USER academic_user WITH PASSWORD 'password';
  CREATE DATABASE academic_db OWNER academic_user;

  CREATE USER asset_user WITH PASSWORD 'password';
  CREATE DATABASE asset_db OWNER asset_user;

  CREATE USER learning_user WITH PASSWORD 'password';
  CREATE DATABASE learning_db OWNER learning_user;

  CREATE USER student_user WITH PASSWORD 'password';
  CREATE DATABASE student_db OWNER student_user;

  CREATE USER vocational_user WITH PASSWORD 'password';
  CREATE DATABASE vocational_db OWNER vocational_user;
EOSQL