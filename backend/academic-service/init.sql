-- 1. Pembuatan Tabel-Tabel
CREATE TABLE IF NOT EXISTS kelas (
    id SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10),
    wali_kelas_id UUID,
    wali_kelas_nama VARCHAR(150)
);
ALTER TABLE kelas
ADD COLUMN IF NOT EXISTS wali_kelas_id UUID;

ALTER TABLE kelas
ADD COLUMN IF NOT EXISTS wali_kelas_nama VARCHAR(150);

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



CREATE TABLE IF NOT EXISTS nilai_siswa (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    mapel_id INTEGER NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id INTEGER NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    tahun_ajar VARCHAR(20) NOT NULL,
    nilai_tugas NUMERIC(5,2) DEFAULT 0,
    nilai_kuis NUMERIC(5,2) DEFAULT 0,
    nilai_uts NUMERIC(5,2) DEFAULT 0,
    nilai_uas NUMERIC(5,2) DEFAULT 0,
    nilai_praktik NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_nilai_siswa UNIQUE (siswa_id, mapel_id, kelas_id, tahun_ajar)
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;

CREATE TABLE IF NOT EXISTS absensi_siswa (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    mapel_id INTEGER REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa', 'terlambat')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_absensi_siswa UNIQUE (siswa_id, tanggal, mapel_id)
);

CREATE INDEX IF NOT EXISTS idx_absensi_siswa_siswa_id ON absensi_siswa(siswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa_tanggal ON absensi_siswa(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa_mapel_id ON absensi_siswa(mapel_id);

-- ─── TABEL WALI KELAS ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS parenting_log (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kehadiran_ortu INTEGER DEFAULT 0,
    agenda VARCHAR(255),
    ringkasan TEXT,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kebersihan_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    penilaian JSONB DEFAULT '{}',
    catatan TEXT,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refleksi_wali_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    capaian TEXT,
    tantangan TEXT,
    rencana TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;

-- Fix unique constraint untuk absensi siswa (saat mapel_id null)
ALTER TABLE absensi_siswa DROP CONSTRAINT IF EXISTS unique_absensi_siswa;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_absensi_siswa 
  ON absensi_siswa (siswa_id, tanggal, COALESCE(mapel_id, 0));

-- ─── TABEL GURU (dikelola oleh Tata Usaha) ──────────────────────────────
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

-- ─── TABEL WAKIL KEPALA SEKOLAH ──────────────────────────────────────────────
-- Dibuat otomatis agar service tidak crash jika migration belum dijalankan manual

CREATE TABLE IF NOT EXISTS wakil_program_kerja (
    id               SERIAL PRIMARY KEY,
    nama_program     VARCHAR(200) NOT NULL,
    bidang           VARCHAR(100) NOT NULL DEFAULT 'Kurikulum',
    tanggal_mulai    DATE NOT NULL,
    tanggal_selesai  DATE,
    penanggung_jawab VARCHAR(150),
    status           VARCHAR(30) NOT NULL DEFAULT 'belum_mulai'
                     CHECK (status IN ('belum_mulai', 'sedang_berjalan', 'selesai', 'ditunda')),
    deskripsi        TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wakil_supervisi (
    id               SERIAL PRIMARY KEY,
    guru_id          INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    tanggal          DATE NOT NULL,
    kelas            VARCHAR(50),
    mata_pelajaran   VARCHAR(100),
    aspek_penilaian  TEXT,
    nilai            NUMERIC(5,2) CHECK (nilai >= 0 AND nilai <= 100),
    catatan          TEXT,
    rekomendasi      TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wakil_perangkat_pembelajaran (
    id               SERIAL PRIMARY KEY,
    guru_id          INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    nama_perangkat   VARCHAR(200) NOT NULL,
    jenis            VARCHAR(50) NOT NULL DEFAULT 'RPP',
    status           VARCHAR(30) NOT NULL DEFAULT 'belum_lengkap'
                     CHECK (status IN ('lengkap', 'belum_lengkap')),
    catatan          TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;