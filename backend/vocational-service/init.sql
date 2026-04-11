-- ═══════════════════════════════════════════════════════════════════════════
-- Vocational Service — init.sql (lengkap, sesuai semua model Sequelize)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── PRAMUKA ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kelas_pramuka (
  id        SERIAL PRIMARY KEY,
  nama_regu VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS anggota_regu (
  id           SERIAL PRIMARY KEY,
  regu_id      INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
  siswa_id     INTEGER NOT NULL,
  nama_lengkap VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS absensi_pramuka (
  id           SERIAL PRIMARY KEY,
  regu_id      INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
  siswa_id     INTEGER NOT NULL,
  tanggal      DATE    NOT NULL,
  status       VARCHAR(20) NOT NULL,
  nama_lengkap VARCHAR(150),
  kelas_id     INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_absensi_pramuka_unique
  ON absensi_pramuka (regu_id, siswa_id, tanggal);

CREATE TABLE IF NOT EXISTS laporan_pramuka (
  id        SERIAL PRIMARY KEY,
  regu_id   INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
  tanggal   DATE DEFAULT CURRENT_DATE,
  deskripsi TEXT,
  file_url  TEXT
);

-- Silabus pramuka — file disimpan sebagai BYTEA
-- Kolom lengkap sesuai model SilabusPramuka.js
CREATE TABLE IF NOT EXISTS silabus_pramuka (
  id             SERIAL PRIMARY KEY,
  tingkat_kelas  VARCHAR(20),
  judul_kegiatan VARCHAR(255) NOT NULL,
  tanggal        DATE         NOT NULL DEFAULT CURRENT_DATE,
  file_data      BYTEA,
  file_mime      VARCHAR(100),
  file_nama      VARCHAR(255),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Laporan kegiatan besar pramuka — file disimpan sebagai BYTEA
-- Kolom lengkap sesuai model LaporanKegiatan.js
CREATE TABLE IF NOT EXISTS laporan_kegiatan (
  id        SERIAL PRIMARY KEY,
  judul     VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  tanggal   DATE         DEFAULT CURRENT_DATE,
  file_data BYTEA,
  file_mime VARCHAR(100),
  file_nama VARCHAR(255),
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ─── PKL ──────────────────────────────────────────────────────────────────

-- Lokasi PKL siswa — kolom lengkap sesuai model LaporanLokasiPKL.js
CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (
  id                   SERIAL PRIMARY KEY,
  siswa_id             TEXT,
  nama_siswa           VARCHAR(150),
  nama_perusahaan      VARCHAR(150) NOT NULL,
  alamat               TEXT,
  posisi               VARCHAR(150),
  deskripsi_pekerjaan  TEXT,
  pembimbing_industri  VARCHAR(150),
  kontak_pembimbing    VARCHAR(100),
  foto_url             TEXT,
  tanggal              DATE         DEFAULT CURRENT_DATE,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Laporan progres mingguan PKL
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (
  id        SERIAL PRIMARY KEY,
  siswa_id  INTEGER,
  minggu_ke INTEGER,
  deskripsi TEXT
);

-- Nilai akhir PKL — kolom lengkap sesuai model NilaiPKL.js
CREATE TABLE IF NOT EXISTS nilai_pkl (
  id            SERIAL PRIMARY KEY,
  siswa_id      INTEGER NOT NULL,
  kelas_id      INTEGER,
  nama_siswa    VARCHAR(150),
  nilai_praktik NUMERIC(5,2) DEFAULT 0,
  nilai_sikap   NUMERIC(5,2) DEFAULT 0,
  nilai_laporan NUMERIC(5,2) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_nilai_pkl UNIQUE (siswa_id, kelas_id)
);

-- ─── GRANT PERMISSIONS ────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO vocational_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vocational_user;