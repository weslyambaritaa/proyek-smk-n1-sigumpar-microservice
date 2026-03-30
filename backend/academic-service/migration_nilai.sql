-- =============================================
-- MIGRATION: Tabel Nilai Siswa
-- Jalankan script ini pada database academic_db
-- =============================================

CREATE TABLE IF NOT EXISTS nilai_siswa (
    id          SERIAL PRIMARY KEY,
    siswa_id    INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    mapel_id    INTEGER NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id    INTEGER NOT NULL REFERENCES kelas(id),
    tahun_ajar  VARCHAR(20) NOT NULL,           -- contoh: '2023/2024'
    guru_id     UUID,                            -- ID guru dari Keycloak
    nilai_tugas  NUMERIC(5,2) DEFAULT 0 CHECK (nilai_tugas  BETWEEN 0 AND 100),
    nilai_kuis   NUMERIC(5,2) DEFAULT 0 CHECK (nilai_kuis   BETWEEN 0 AND 100),
    nilai_uts    NUMERIC(5,2) DEFAULT 0 CHECK (nilai_uts    BETWEEN 0 AND 100),
    nilai_uas    NUMERIC(5,2) DEFAULT 0 CHECK (nilai_uas    BETWEEN 0 AND 100),
    nilai_praktik NUMERIC(5,2) DEFAULT 0 CHECK (nilai_praktik BETWEEN 0 AND 100),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),

    -- Unique constraint: satu siswa hanya punya 1 record nilai per mapel per tahun ajar
    CONSTRAINT uq_nilai_siswa_mapel_tahun UNIQUE (siswa_id, mapel_id, tahun_ajar)
);

-- Index untuk query filtering yang cepat
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_kelas    ON nilai_siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_mapel    ON nilai_siswa(mapel_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_tahun    ON nilai_siswa(tahun_ajar);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_guru     ON nilai_siswa(guru_id);

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE nilai_siswa TO academic_user;
GRANT ALL PRIVILEGES ON SEQUENCE nilai_siswa_id_seq TO academic_user;
