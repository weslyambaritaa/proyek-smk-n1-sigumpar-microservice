-- Migration: Silabus Pramuka & PKL Detail
ALTER TABLE anggota_regu ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150);
ALTER TABLE laporan_pramuka ADD COLUMN IF NOT EXISTS tanggal DATE DEFAULT CURRENT_DATE;

CREATE TABLE IF NOT EXISTS silabus_pramuka (
    id SERIAL PRIMARY KEY,
    tingkat_kelas VARCHAR(20),
    judul_kegiatan VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS nama_siswa VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS posisi VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS deskripsi_pekerjaan TEXT;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS pembimbing_industri VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS kontak_pembimbing VARCHAR(100);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS tanggal DATE DEFAULT CURRENT_DATE;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

GRANT ALL PRIVILEGES ON TABLE silabus_pramuka TO vocational_user;
GRANT ALL PRIVILEGES ON SEQUENCE silabus_pramuka_id_seq TO vocational_user;
