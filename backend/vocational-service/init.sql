-- 1. Tabel Regu Pramuka
CREATE TABLE IF NOT EXISTS kelas_pramuka (
    id SERIAL PRIMARY KEY, 
    nama_regu VARCHAR(100) NOT NULL
);

-- 2. Tabel Anggota Regu (Untuk mapping siswa ke regu tertentu)
CREATE TABLE IF NOT EXISTS anggota_regu (
    id SERIAL PRIMARY KEY,
    regu_id INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
    siswa_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS absensi_pramuka (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER NOT NULL,
    siswa_id INTEGER NOT NULL,
    nama_lengkap VARCHAR(150),
    nisn VARCHAR(30),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'izin', 'sakit', 'alpa')),
    keterangan TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_absensi_pramuka_kelas_siswa_tanggal
ON absensi_pramuka (kelas_id, siswa_id, tanggal);


-- ============================================
-- TABLE: laporan_pramuka
-- ============================================

CREATE TABLE laporan_pramuka (
    id SERIAL PRIMARY KEY,

    kelas_id INTEGER,
    tanggal DATE DEFAULT CURRENT_DATE,

    judul VARCHAR(150),
    deskripsi TEXT,
    file_url TEXT,

    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (id SERIAL PRIMARY KEY, siswa_id TEXT, nama_perusahaan VARCHAR(150), alamat TEXT);
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, minggu_ke INTEGER, deskripsi TEXT);

-- 5. Tabel Nilai PKL (Guru Vokasi menginput nilai praktik kerja lapangan)
CREATE TABLE IF NOT EXISTS nilai_pkl (
    id             SERIAL PRIMARY KEY,
    siswa_id       INTEGER NOT NULL,
    kelas_id       INTEGER,
    nilai_praktik  NUMERIC(5,2) DEFAULT 0,
    nilai_sikap    NUMERIC(5,2) DEFAULT 0,
    nilai_laporan  NUMERIC(5,2) DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_nilai_pkl UNIQUE (siswa_id, kelas_id)
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vocational_user;



CREATE TABLE laporan_kegiatan (
    id SERIAL PRIMARY KEY,

    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,

    file_data BYTEA,
    file_mime VARCHAR(100),
    file_nama VARCHAR(255),

    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =====================================================
-- OPTIONAL: AUTO UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk silabus
DROP TRIGGER IF EXISTS set_updated_at_silabus ON silabus_pramuka;
CREATE TRIGGER set_updated_at_silabus
BEFORE UPDATE ON silabus_pramuka
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk laporan
DROP TRIGGER IF EXISTS set_updated_at_laporan ON laporan_kegiatan;
CREATE TRIGGER set_updated_at_laporan
BEFORE UPDATE ON laporan_kegiatan
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- PRIVILEGES
-- =====================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;

-- ─── DETAIL TAMBAHAN TABEL LOKASI PKL ────────────────────────────────────
-- Alter table to add more columns if not exists

-- Add nama_lengkap to anggota_regu
ALTER TABLE anggota_regu ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150);
ALTER TABLE laporan_pramuka ADD COLUMN IF NOT EXISTS tanggal DATE DEFAULT CURRENT_DATE;

-- Silabus Pramuka
CREATE TABLE IF NOT EXISTS silabus_pramuka (
    id SERIAL PRIMARY KEY,

    kelas_id INTEGER,
    nama_kelas VARCHAR(100),

    judul_kegiatan VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,

    file_data BYTEA,
    file_mime VARCHAR(100),
    file_nama VARCHAR(255),

    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS kelas_id INTEGER;
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS nama_kelas VARCHAR(100);
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS file_data BYTEA;
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS file_mime VARCHAR(100);
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS file_nama VARCHAR(255);
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE silabus_pramuka ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- PKL Lokasi detail columns
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS nama_siswa VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS posisi VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS deskripsi_pekerjaan TEXT;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS pembimbing_industri VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS kontak_pembimbing VARCHAR(100);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS tanggal DATE DEFAULT CURRENT_DATE;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;

-- Tambah kolom nama_siswa ke nilai_pkl (untuk cache nama agar tidak selalu perlu hit academic service)
ALTER TABLE nilai_pkl ADD COLUMN IF NOT EXISTS nama_siswa VARCHAR(150);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS kontak_pembimbing VARCHAR(100);
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS tanggal DATE DEFAULT CURRENT_DATE;
ALTER TABLE laporan_lokasi_pkl ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Fix absensi_pramuka unique constraint agar upsert bisa berjalan
ALTER TABLE absensi_pramuka DROP CONSTRAINT IF EXISTS absensi_pramuka_regu_id_siswa_id_tanggal_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_absensi_pramuka_unique
  ON absensi_pramuka (regu_id, siswa_id, tanggal);

-- Tambah nama_lengkap di absensi_pramuka untuk kemudahan rekap
ALTER TABLE absensi_pramuka ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150);
ALTER TABLE absensi_pramuka ADD COLUMN IF NOT EXISTS kelas_id INTEGER;