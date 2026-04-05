-- Fix: permission denied for table absensi_guru and perangkat_pembelajaran
-- Run as postgres superuser on learning_db
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO learning_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO learning_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO learning_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO learning_user;
