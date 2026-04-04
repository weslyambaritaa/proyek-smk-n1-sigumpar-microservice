-- Migration: Wakil Kepala Sekolah Feature
-- Run this against the academic-service database

-- 1. Tabel Perangkat Pembelajaran (untuk pengecekan oleh Wakil Kepsek)
CREATE TABLE IF NOT EXISTS wakil_perangkat_pembelajaran (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    nama_perangkat VARCHAR(200) NOT NULL,
    jenis VARCHAR(50) NOT NULL DEFAULT 'RPP',  -- RPP, Silabus, Prota, Promes, Modul, Lainnya
    status VARCHAR(30) NOT NULL DEFAULT 'belum_lengkap' CHECK (status IN ('lengkap', 'belum_lengkap')),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Supervisi Guru
CREATE TABLE IF NOT EXISTS wakil_supervisi (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    kelas VARCHAR(50),
    mata_pelajaran VARCHAR(100),
    aspek_penilaian TEXT,
    nilai NUMERIC(4,1) CHECK (nilai >= 0 AND nilai <= 100),
    catatan TEXT,
    rekomendasi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Program Kerja Wakil Kepala Sekolah
CREATE TABLE IF NOT EXISTS wakil_program_kerja (
    id SERIAL PRIMARY KEY,
    nama_program VARCHAR(200) NOT NULL,
    bidang VARCHAR(100) DEFAULT 'Kurikulum',   -- Kurikulum, Kesiswaan, Sarana, Humas
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    penanggung_jawab VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'belum_mulai' CHECK (status IN ('belum_mulai', 'sedang_berjalan', 'selesai', 'ditunda')),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant privileges
GRANT ALL PRIVILEGES ON wakil_perangkat_pembelajaran TO academic_user;
GRANT ALL PRIVILEGES ON wakil_supervisi TO academic_user;
GRANT ALL PRIVILEGES ON wakil_program_kerja TO academic_user;
GRANT USAGE, SELECT ON SEQUENCE wakil_perangkat_pembelajaran_id_seq TO academic_user;
GRANT USAGE, SELECT ON SEQUENCE wakil_supervisi_id_seq TO academic_user;
GRANT USAGE, SELECT ON SEQUENCE wakil_program_kerja_id_seq TO academic_user;
