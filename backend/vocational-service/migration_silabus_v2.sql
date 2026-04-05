-- ═══════════════════════════════════════════════════════════════════════════
-- Migration v2: Simpan file biner silabus & laporan_kegiatan langsung di DB
-- Jalankan di container vocational-db:
--   docker exec -i <vocational-db-container> psql -U vocational_user -d vocational_db \
--     < migration_silabus_v2.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Pastikan tabel silabus_pramuka ada
CREATE TABLE IF NOT EXISTS silabus_pramuka (
  id             SERIAL PRIMARY KEY,
  tingkat_kelas  VARCHAR(20),
  judul_kegiatan VARCHAR(255) NOT NULL,
  tanggal        DATE         NOT NULL DEFAULT CURRENT_DATE,
  file_url       TEXT,        -- kolom lama (backward compat)
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Kolom baru: simpan file binary di DB
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS file_data BYTEA;
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS file_mime VARCHAR(100);
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS file_nama VARCHAR(255);

-- Pastikan tabel laporan_kegiatan ada
CREATE TABLE IF NOT EXISTS laporan_kegiatan (
  id         SERIAL PRIMARY KEY,
  judul      VARCHAR(255) NOT NULL,
  deskripsi  TEXT,
  tanggal    DATE         DEFAULT CURRENT_DATE,
  file_url   TEXT,        -- kolom lama (backward compat)
  file_nama  VARCHAR(255),
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Kolom baru untuk laporan_kegiatan
ALTER TABLE laporan_kegiatan ADD COLUMN IF NOT EXISTS file_data BYTEA;
ALTER TABLE laporan_kegiatan ADD COLUMN IF NOT EXISTS file_mime VARCHAR(100);

-- Berikan permission
GRANT ALL PRIVILEGES ON TABLE silabus_pramuka  TO vocational_user;
GRANT ALL PRIVILEGES ON TABLE laporan_kegiatan TO vocational_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vocational_user;

-- Verifikasi
SELECT 'silabus_pramuka' AS tabel, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'silabus_pramuka'
  AND column_name IN ('file_data','file_mime','file_nama')
UNION ALL
SELECT 'laporan_kegiatan', column_name, data_type
FROM information_schema.columns
WHERE table_name = 'laporan_kegiatan'
  AND column_name IN ('file_data','file_mime','file_nama')
ORDER BY tabel, column_name;
