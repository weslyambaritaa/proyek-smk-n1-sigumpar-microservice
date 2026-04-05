-- ═══════════════════════════════════════════════════════════════════════════
-- PATCH: Pastikan semua kolom tabel absensi_guru ada (fix "column does not exist")
-- Jalankan di container learning-db:
--   docker exec -i <learning-db-container> psql -U learning_user -d learning_db < migration_fix_namaguru.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Tambahkan kolom yang mungkin hilang jika tabel dibuat dari versi schema lama
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS "namaGuru"      VARCHAR(255) NOT NULL DEFAULT 'Unknown';
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS "mataPelajaran" VARCHAR(255) NOT NULL DEFAULT '-';
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS "jamMasuk"      TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS foto            TEXT;
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS keterangan      TEXT;
ALTER TABLE absensi_guru ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Pastikan index ada
CREATE INDEX IF NOT EXISTS idx_absensi_guru_user_id ON absensi_guru(user_id);
CREATE INDEX IF NOT EXISTS idx_absensi_guru_tanggal  ON absensi_guru(tanggal);

-- Pastikan constraint UNIQUE ada (cegah duplikasi absensi di hari yang sama)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'absensi_guru_user_id_tanggal_key'
  ) THEN
    ALTER TABLE absensi_guru ADD CONSTRAINT absensi_guru_user_id_tanggal_key UNIQUE (user_id, tanggal);
  END IF;
END $$;

-- Grant ulang permission jika diperlukan
GRANT ALL PRIVILEGES ON TABLE absensi_guru TO learning_user;

-- Verifikasi hasilnya
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'absensi_guru'
ORDER BY ordinal_position;
