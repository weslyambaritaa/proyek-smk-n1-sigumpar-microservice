-- ============================================================
-- Migration: Wakil Kepala Sekolah Feature (Lengkap)
-- File: migration_wakil_kepsek_lengkap.sql
-- Jalankan terhadap database: academic-service
-- ============================================================

-- 1. Tabel Perangkat Pembelajaran (Pengecekan Wakil Kepsek)
CREATE TABLE IF NOT EXISTS wakil_perangkat_pembelajaran (
    id              SERIAL PRIMARY KEY,
    guru_id         INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    nama_perangkat  VARCHAR(200) NOT NULL,
    jenis           VARCHAR(50) NOT NULL DEFAULT 'RPP',
    -- Jenis: RPP | Silabus | Prota | Promes | Modul | Lainnya
    status          VARCHAR(30) NOT NULL DEFAULT 'belum_lengkap'
                    CHECK (status IN ('lengkap', 'belum_lengkap')),
    catatan         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Supervisi Guru
CREATE TABLE IF NOT EXISTS wakil_supervisi (
    id              SERIAL PRIMARY KEY,
    guru_id         INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    tanggal         DATE NOT NULL,
    kelas           VARCHAR(50),
    mata_pelajaran  VARCHAR(100),
    aspek_penilaian TEXT,
    nilai           NUMERIC(5,2) CHECK (nilai >= 0 AND nilai <= 100),
    catatan         TEXT,
    rekomendasi     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Program Kerja Wakil Kepala Sekolah
CREATE TABLE IF NOT EXISTS wakil_program_kerja (
    id                SERIAL PRIMARY KEY,
    nama_program      VARCHAR(200) NOT NULL,
    bidang            VARCHAR(100) DEFAULT 'Kurikulum',
    -- Bidang: Kurikulum | Kesiswaan | Sarana & Prasarana | Humas | Lainnya
    tanggal_mulai     DATE NOT NULL,
    tanggal_selesai   DATE,
    penanggung_jawab  VARCHAR(150),
    status            VARCHAR(30) NOT NULL DEFAULT 'belum_mulai'
                      CHECK (status IN ('belum_mulai','sedang_berjalan','selesai','ditunda')),
    deskripsi         TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Laporan Rekap Wakil Kepsek (snapshot bulanan)
CREATE TABLE IF NOT EXISTS wakil_laporan_rekap (
    id              SERIAL PRIMARY KEY,
    bulan           SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun           SMALLINT NOT NULL,
    jenis           VARCHAR(30) NOT NULL DEFAULT 'absensi',
    -- Jenis: absensi | jadwal | perangkat
    judul           VARCHAR(200),
    isi             TEXT,
    catatan         TEXT,
    dibuat_oleh     VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (bulan, tahun, jenis)
);

-- ── Index untuk performa query ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_wakil_perangkat_guru_id
    ON wakil_perangkat_pembelajaran(guru_id);

CREATE INDEX IF NOT EXISTS idx_wakil_perangkat_status
    ON wakil_perangkat_pembelajaran(status);

CREATE INDEX IF NOT EXISTS idx_wakil_supervisi_guru_id
    ON wakil_supervisi(guru_id);

CREATE INDEX IF NOT EXISTS idx_wakil_supervisi_tanggal
    ON wakil_supervisi(tanggal);

CREATE INDEX IF NOT EXISTS idx_wakil_program_status
    ON wakil_program_kerja(status);

CREATE INDEX IF NOT EXISTS idx_wakil_program_tahun
    ON wakil_program_kerja(tanggal_mulai);

CREATE INDEX IF NOT EXISTS idx_wakil_laporan_bulan_tahun
    ON wakil_laporan_rekap(bulan, tahun);

-- ── Grant Privileges ──────────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON wakil_perangkat_pembelajaran TO academic_user;
GRANT ALL PRIVILEGES ON wakil_supervisi              TO academic_user;
GRANT ALL PRIVILEGES ON wakil_program_kerja          TO academic_user;
GRANT ALL PRIVILEGES ON wakil_laporan_rekap          TO academic_user;

GRANT USAGE, SELECT ON SEQUENCE wakil_perangkat_pembelajaran_id_seq TO academic_user;
GRANT USAGE, SELECT ON SEQUENCE wakil_supervisi_id_seq              TO academic_user;
GRANT USAGE, SELECT ON SEQUENCE wakil_program_kerja_id_seq          TO academic_user;
GRANT USAGE, SELECT ON SEQUENCE wakil_laporan_rekap_id_seq          TO academic_user;

-- ── Sample Data (hapus comment untuk testing) ─────────────────────────────────
-- INSERT INTO wakil_program_kerja (nama_program, bidang, tanggal_mulai, tanggal_selesai, penanggung_jawab, status, deskripsi)
-- VALUES
--   ('Workshop Kurikulum Merdeka', 'Kurikulum', '2025-01-10', '2025-01-12', 'Budi Santoso, S.Pd', 'selesai', 'Workshop pemahaman kurikulum merdeka bagi seluruh guru'),
--   ('Penyusunan Jadwal Pelajaran TA 2025/2026', 'Kurikulum', '2025-06-01', '2025-06-30', 'Siti Rahayu, M.Pd', 'belum_mulai', NULL),
--   ('Supervisi Kelas Semester 1', 'Kurikulum', '2025-07-14', '2025-11-30', 'Wakasek Kurikulum', 'sedang_berjalan', 'Supervisi pembelajaran seluruh guru semester ganjil');
