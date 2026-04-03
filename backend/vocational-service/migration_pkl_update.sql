-- Migration: Update PKL tables untuk integrasi dengan Tata Usaha
ALTER TABLE nilai_pkl ADD COLUMN IF NOT EXISTS nama_siswa VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS kontak_pembimbing VARCHAR(100);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS tanggal DATE DEFAULT CURRENT_DATE;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Fix absensi_pramuka unique constraint
ALTER TABLE absensi_pramuka DROP CONSTRAINT IF EXISTS absensi_pramuka_regu_id_siswa_id_tanggal_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_absensi_pramuka_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_absensi_pramuka_unique
      ON absensi_pramuka (regu_id, siswa_id, tanggal);
  END IF;
END $$;

ALTER TABLE absensi_pramuka ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150);
ALTER TABLE absensi_pramuka ADD COLUMN IF NOT EXISTS kelas_id INTEGER;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;
