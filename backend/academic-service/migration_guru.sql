-- Migration: Tambah tabel guru untuk Tata Usaha
CREATE TABLE IF NOT EXISTS guru (
    id SERIAL PRIMARY KEY,
    nip VARCHAR(30) UNIQUE,
    nama_lengkap VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    jabatan VARCHAR(100),
    mata_pelajaran VARCHAR(150),
    no_telepon VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;

-- Index untuk pencarian
CREATE INDEX IF NOT EXISTS idx_guru_nama ON guru(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_guru_nip ON guru(nip);
