-- ═══════════════════════════════════════════════════════════════════════════
-- PATCH DEFINITIF: Fix kolom absensi_guru (column "namaGuru" does not exist)
-- Jalankan di container learning-db:
--   docker exec -i <learning-db-container> psql -U learning_user -d learning_db \
--     < migration_fix_namaguru.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Pastikan tabel ada terlebih dahulu
CREATE TABLE IF NOT EXISTS absensi_guru (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  tanggal DATE NOT NULL,
  foto TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'hadir'
    CHECK (status IN ('hadir','terlambat','izin','sakit','alpa')),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tambahkan kolom yang mungkin hilang — gunakan nama LOWERCASE (tanpa quotes)
-- sehingga PostgreSQL bisa diakses tanpa case-sensitivity issue
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS nama_guru      VARCHAR(255) NOT NULL DEFAULT 'Unknown';
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS mata_pelajaran VARCHAR(255) NOT NULL DEFAULT '-';
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS jam_masuk      TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS foto           TEXT;
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS keterangan     TEXT;
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Buat kolom id_absensiGuru jika belum ada sebagai alias UUID
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'absensi_guru' AND lower(column_name) = 'id_absensiguru'
  ) THEN
    ALTER TABLE absensi_guru ADD COLUMN id_absensiguru UUID DEFAULT gen_random_uuid() UNIQUE;
  END IF;
END $$;

-- Pastikan unique constraint ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'absensi_guru_user_id_tanggal_key'
  ) THEN
    ALTER TABLE absensi_guru ADD CONSTRAINT absensi_guru_user_id_tanggal_key UNIQUE (user_id, tanggal);
  END IF;
END $$;

-- Pastikan index ada
CREATE INDEX IF NOT EXISTS idx_absensi_guru_user_id ON absensi_guru(user_id);
CREATE INDEX IF NOT EXISTS idx_absensi_guru_tanggal  ON absensi_guru(tanggal);

-- Berikan permission
GRANT ALL PRIVILEGES ON TABLE absensi_guru TO learning_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO learning_user;

-- Verifikasi hasil
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'absensi_guru'
ORDER BY ordinal_position;
