-- =============================================
-- init.sql — academic-service
-- =============================================

-- 1. Tabel kelas
CREATE TABLE IF NOT EXISTS kelas (
    id            SERIAL PRIMARY KEY,
    nama_kelas    VARCHAR(50) NOT NULL,
    tingkat       VARCHAR(10),
    wali_kelas_id UUID
);

-- 2. Tabel siswa  (PK = UUID, FK ke kelas.id INTEGER)
CREATE TABLE IF NOT EXISTS siswa (
    id_siswa   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelas   INTEGER     NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    namaSiswa  VARCHAR(255) NOT NULL,
    NIS        VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel mata_pelajaran
CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id            SERIAL PRIMARY KEY,
    nama_mapel    VARCHAR(20) UNIQUE NOT NULL,
    kelas_id      INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    guru_mapel_id UUID
);

-- 4. Tabel pendukung
CREATE TABLE IF NOT EXISTS pengumuman (
    id    SERIAL PRIMARY KEY,
    judul VARCHAR(255),
    isi   TEXT
);

CREATE TABLE IF NOT EXISTS arsip_surat (
    id           SERIAL PRIMARY KEY,
    nomor_surat  VARCHAR(100),
    file_url     TEXT
);

CREATE TABLE IF NOT EXISTS jadwal_mengajar (
    id              SERIAL PRIMARY KEY,
    guru_id         UUID,
    kelas_id        INTEGER REFERENCES kelas(id) ON DELETE CASCADE,
    mata_pelajaran  VARCHAR(100),
    hari            VARCHAR(20),
    waktu_mulai     TIME,
    waktu_berakhir  TIME
);

CREATE TABLE IF NOT EXISTS jadwal_piket (
    id       SERIAL PRIMARY KEY,
    tanggal  DATE,
    guru_id  UUID
);

CREATE TABLE IF NOT EXISTS jadwal_upacara (
    id      SERIAL PRIMARY KEY,
    tanggal DATE,
    petugas TEXT
);

-- =============================================
-- 5. Tabel nilai_siswa
--    siswa_id → UUID (ikut tipe PK siswa.id_siswa)
-- =============================================
CREATE TABLE IF NOT EXISTS nilai_siswa (
    id            SERIAL PRIMARY KEY,
    siswa_id      UUID        NOT NULL REFERENCES siswa(id_siswa) ON DELETE CASCADE,
    mapel_id      INTEGER     NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id      INTEGER     NOT NULL REFERENCES kelas(id),
    tahun_ajar    VARCHAR(20) NOT NULL,
    guru_id       UUID,
    nilai_tugas   NUMERIC(5,2) DEFAULT 0 CHECK (nilai_tugas   BETWEEN 0 AND 100),
    nilai_kuis    NUMERIC(5,2) DEFAULT 0 CHECK (nilai_kuis    BETWEEN 0 AND 100),
    nilai_uts     NUMERIC(5,2) DEFAULT 0 CHECK (nilai_uts     BETWEEN 0 AND 100),
    nilai_uas     NUMERIC(5,2) DEFAULT 0 CHECK (nilai_uas     BETWEEN 0 AND 100),
    nilai_praktik NUMERIC(5,2) DEFAULT 0 CHECK (nilai_praktik BETWEEN 0 AND 100),
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uq_nilai_siswa_mapel_tahun UNIQUE (siswa_id, mapel_id, tahun_ajar)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_kelas ON nilai_siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_mapel ON nilai_siswa(mapel_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_tahun ON nilai_siswa(tahun_ajar);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_guru  ON nilai_siswa(guru_id);

-- =============================================
-- GRANT PRIVILEGES
-- =============================================
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO academic_user;
