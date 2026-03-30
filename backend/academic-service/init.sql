-- 1. Pembuatan Tabel-Tabel
CREATE TABLE IF NOT EXISTS kelas (
    id SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10),
    wali_kelas_id UUID
);

CREATE TABLE IF NOT EXISTS siswa (
    id SERIAL PRIMARY KEY,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    kelas_id INTEGER REFERENCES kelas(id)
);

CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id SERIAL PRIMARY KEY,
    nama_mapel VARCHAR(20) UNIQUE NOT NULL,
    kelas_id INTEGER REFERENCES kelas(id),
    guru_mapel_id UUID
);

CREATE TABLE IF NOT EXISTS pengumuman (id SERIAL PRIMARY KEY, judul VARCHAR(255), isi TEXT);
CREATE TABLE IF NOT EXISTS arsip_surat (id SERIAL PRIMARY KEY, nomor_surat VARCHAR(100), file_url TEXT);
CREATE TABLE IF NOT EXISTS jadwal_mengajar (
    id SERIAL PRIMARY KEY, 
    guru_id UUID, 
    kelas_id INTEGER, 
    mata_pelajaran VARCHAR(100),
    hari VARCHAR(20),
    waktu_mulai TIME,
    waktu_berakhir TIME
);
CREATE TABLE IF NOT EXISTS jadwal_piket (id SERIAL PRIMARY KEY, tanggal DATE, guru_id UUID);
CREATE TABLE IF NOT EXISTS jadwal_upacara (id SERIAL PRIMARY KEY, tanggal DATE, petugas TEXT);

-- =============================================
-- TABEL NILAI SISWA (untuk fitur Input Nilai Guru Mapel)
-- =============================================
CREATE TABLE IF NOT EXISTS nilai_siswa (
    id              SERIAL PRIMARY KEY,
    siswa_id        INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    mapel_id        INTEGER NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id        INTEGER NOT NULL REFERENCES kelas(id),
    tahun_ajar      VARCHAR(20) NOT NULL,           -- contoh: '2023/2024'
    guru_id         UUID,                            -- ID guru dari Keycloak
    nilai_tugas     NUMERIC(5,2) DEFAULT 0 CHECK (nilai_tugas   BETWEEN 0 AND 100),
    nilai_kuis      NUMERIC(5,2) DEFAULT 0 CHECK (nilai_kuis    BETWEEN 0 AND 100),
    nilai_uts       NUMERIC(5,2) DEFAULT 0 CHECK (nilai_uts     BETWEEN 0 AND 100),
    nilai_uas       NUMERIC(5,2) DEFAULT 0 CHECK (nilai_uas     BETWEEN 0 AND 100),
    nilai_praktik   NUMERIC(5,2) DEFAULT 0 CHECK (nilai_praktik BETWEEN 0 AND 100),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),

    -- Satu siswa hanya boleh punya 1 record nilai per mapel per tahun ajar
    CONSTRAINT uq_nilai_siswa_mapel_tahun UNIQUE (siswa_id, mapel_id, tahun_ajar)
);

-- Index agar query filter cepat
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_kelas  ON nilai_siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_mapel  ON nilai_siswa(mapel_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_tahun  ON nilai_siswa(tahun_ajar);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_guru   ON nilai_siswa(guru_id);

-- =============================================
-- GRANT PRIVILEGES
-- =============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;