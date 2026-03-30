#!/bin/bash
#!/bin/bash
# service postgresql start
# sleep 5

# sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || true
# sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true
# sudo -u postgres psql -d $DB_NAME -f ./init.sql || true

# # Pastikan user punya akses penuh
# sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;" || true
# sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;" || true

npm run dev
