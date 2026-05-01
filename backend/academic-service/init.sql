-- =========================================================
-- INIT DATABASE ACADEMIC SERVICE
-- Scope:
-- 1. Kelas
-- 2. Siswa
-- 3. Pengumuman
-- 4. Arsip Surat
-- 5. Mata Pelajaran
-- 6. Jadwal Mengajar
-- 7. Jadwal Piket
-- 8. Jadwal Upacara
-- =========================================================

CREATE TABLE IF NOT EXISTS kelas (
    id SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10),
    wali_kelas_id UUID,
    wali_kelas_nama VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS siswa (
    id SERIAL PRIMARY KEY,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id SERIAL PRIMARY KEY,
    nama_mapel VARCHAR(100) NOT NULL,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    guru_mapel_id UUID,
    guru_mapel_nama VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pengumuman (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arsip_surat (
    id SERIAL PRIMARY KEY,
    nomor_surat VARCHAR(100),
    judul VARCHAR(255),
    kategori VARCHAR(100),
    tanggal_surat DATE,
    file_url TEXT,
    file_name VARCHAR(255),
    file_mime VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jadwal_mengajar (
    id SERIAL PRIMARY KEY,
    guru_id UUID,
    guru_nama VARCHAR(150),
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    mapel_id INTEGER REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
    mata_pelajaran VARCHAR(100),
    hari VARCHAR(20),
    waktu_mulai TIME,
    waktu_berakhir TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jadwal_piket (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    user_id UUID,
    user_nama VARCHAR(150),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jadwal_upacara (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    user_id UUID,
    user_nama VARCHAR(150),
    tugas VARCHAR(150),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helper opsional untuk dropdown guru jika belum ambil dari auth-service
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

CREATE INDEX IF NOT EXISTS idx_siswa_kelas_id ON siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_mapel_kelas_id ON mata_pelajaran(kelas_id);
CREATE INDEX IF NOT EXISTS idx_mapel_guru_mapel_id ON mata_pelajaran(guru_mapel_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_kelas_id ON jadwal_mengajar(kelas_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_mapel_id ON jadwal_mengajar(mapel_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_guru_id ON jadwal_mengajar(guru_id);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO academic_user;