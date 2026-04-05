-- ============================================================
-- Fix: siswa_id di laporan_lokasi_pkl ubah INTEGER → TEXT
-- Karena user_id dari Keycloak adalah UUID (string), bukan integer
-- ============================================================

-- Ubah tipe kolom siswa_id dari INTEGER ke TEXT
ALTER TABLE laporan_lokasi_pkl
  ALTER COLUMN siswa_id TYPE TEXT USING siswa_id::TEXT;

-- Pastikan semua kolom yang dibutuhkan sudah ada
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS nama_siswa         VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS posisi             VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS deskripsi_pekerjaan TEXT;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS pembimbing_industri VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS kontak_pembimbing  VARCHAR(100);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS foto_url           TEXT;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS tanggal            DATE DEFAULT CURRENT_DATE;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

GRANT ALL PRIVILEGES ON laporan_lokasi_pkl TO vocational_user;