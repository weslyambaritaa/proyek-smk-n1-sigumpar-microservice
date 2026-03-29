-- 1. Pembuatan Tabel-Tabel
CREATE TABLE IF NOT EXISTS kelas (
    id SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10),
    wali_kelas_id UUID  -- TAMBAHKAN BARIS INI
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

-- ==========================================
-- TABEL FITUR WALI KELAS
-- ==========================================

-- Tabel catatan komunikasi wali kelas dengan orang tua siswa
CREATE TABLE IF NOT EXISTS parenting (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    topik VARCHAR(255) NOT NULL,
    catatan TEXT DEFAULT '',
    jenis_komunikasi VARCHAR(50) DEFAULT 'tatap_muka',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel penilaian kebersihan kelas mingguan
CREATE TABLE IF NOT EXISTS kebersihan_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    tanggal_penilaian DATE NOT NULL,
    petugas_piket JSONB DEFAULT '[]',      -- array nama siswa piket
    skor INTEGER NOT NULL CHECK (skor >= 0 AND skor <= 100),
    aspek_penilaian JSONB DEFAULT '{}',    -- { lantai, meja, papan_tulis, tempat_sampah }
    catatan TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel refleksi mingguan kondisi kelas oleh wali kelas
CREATE TABLE IF NOT EXISTS refleksi_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    kondisi_kelas VARCHAR(20) NOT NULL DEFAULT 'baik',  -- sangat_baik | baik | cukup | kurang
    hal_positif TEXT DEFAULT '',
    hal_perlu_perbaikan TEXT DEFAULT '',
    rencana_tindak_lanjut TEXT DEFAULT '',
    catatan_tambahan TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;