-- Fix: insert or update on table "laporan_pramuka" violates foreign key constraint
-- "laporan_pramuka_regu_id_fkey"
-- The frontend sends kelas_id from the academic kelas table, not from kelas_pramuka.
-- We drop the FK constraint so any integer (academic kelas ID) can be stored.

ALTER TABLE laporan_pramuka DROP CONSTRAINT IF EXISTS laporan_pramuka_regu_id_fkey;
ALTER TABLE absensi_pramuka DROP CONSTRAINT IF EXISTS absensi_pramuka_regu_id_fkey;

-- Add a comment to clarify the column is now used for academic kelas_id
COMMENT ON COLUMN laporan_pramuka.regu_id IS 'Stores academic kelas_id (FK removed for compatibility)';
COMMENT ON COLUMN absensi_pramuka.regu_id IS 'Stores academic kelas_id (FK removed for compatibility)';

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;

-- Add laporan_kegiatan table for LaporanKegiatanPage
CREATE TABLE IF NOT EXISTS laporan_kegiatan (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    file_url TEXT,
    file_nama VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;

-- Fix existing file_url paths: update old /uploads/ to /api/vocational/uploads/
UPDATE silabus_pramuka
   SET file_url = REPLACE(file_url, '/uploads/', '/api/vocational/uploads/')
 WHERE file_url LIKE '/uploads/%';

UPDATE laporan_lokasi_pkl
   SET foto_url = REPLACE(foto_url, '/uploads/', '/api/vocational/uploads/')
 WHERE foto_url LIKE '/uploads/%';
