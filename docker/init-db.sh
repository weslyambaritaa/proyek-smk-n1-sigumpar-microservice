#!/bin/bash
# =============================================================================
# docker/init-db.sh
# Script ini dijalankan otomatis oleh PostgreSQL saat container pertama kali
# dibuat. Tugasnya membuat semua database dan user untuk setiap microservice.
# =============================================================================

set -e

echo "========================================"
echo " Membuat database & user untuk semua service..."
echo "========================================"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL

  -- ── AUTH SERVICE ─────────────────────────────────────────────────────────
  CREATE USER auth_user WITH PASSWORD 'password';
  CREATE DATABASE auth_db OWNER auth_user;
  GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

  -- ── ACADEMIC SERVICE ─────────────────────────────────────────────────────
  CREATE USER academic_user WITH PASSWORD 'password';
  CREATE DATABASE academic_db OWNER academic_user;
  GRANT ALL PRIVILEGES ON DATABASE academic_db TO academic_user;

  -- ── ASSET SERVICE ────────────────────────────────────────────────────────
  CREATE USER asset_user WITH PASSWORD 'password';
  CREATE DATABASE asset_db OWNER asset_user;
  GRANT ALL PRIVILEGES ON DATABASE asset_db TO asset_user;

  -- ── LEARNING SERVICE ─────────────────────────────────────────────────────
  CREATE USER learning_user WITH PASSWORD 'password';
  CREATE DATABASE learning_db OWNER learning_user;
  GRANT ALL PRIVILEGES ON DATABASE learning_db TO learning_user;

  -- ── STUDENT SERVICE ──────────────────────────────────────────────────────
  CREATE USER student_user WITH PASSWORD 'password';
  CREATE DATABASE student_db OWNER student_user;
  GRANT ALL PRIVILEGES ON DATABASE student_db TO student_user;

  -- ── VOCATIONAL SERVICE ───────────────────────────────────────────────────
  CREATE USER vocational_user WITH PASSWORD 'password';
  CREATE DATABASE vocational_db OWNER vocational_user;
  GRANT ALL PRIVILEGES ON DATABASE vocational_db TO vocational_user;

EOSQL

# ── Inisialisasi tabel di setiap database ─────────────────────────────────

echo "--- Inisialisasi tabel: auth_db ---"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="auth_db" <<-EOSQL
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS hak_akses (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    permissions TEXT
  );
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO auth_user;
EOSQL

echo "--- Inisialisasi tabel: academic_db ---"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="academic_db" <<-EOSQL
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
    nama_mapel VARCHAR(100) UNIQUE NOT NULL,
    kelas_id INTEGER REFERENCES kelas(id),
    guru_mapel_id UUID
  );
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
  CREATE TABLE IF NOT EXISTS pengumuman (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255),
    isi TEXT
  );
  CREATE TABLE IF NOT EXISTS arsip_surat (
    id SERIAL PRIMARY KEY,
    nomor_surat VARCHAR(100),
    file_url TEXT
  );
  CREATE TABLE IF NOT EXISTS jadwal_mengajar (
    id SERIAL PRIMARY KEY,
    guru_id UUID,
    kelas_id INTEGER,
    mata_pelajaran VARCHAR(100),
    hari VARCHAR(20),
    waktu_mulai TIME,
    waktu_berakhir TIME
  );
  CREATE TABLE IF NOT EXISTS jadwal_piket (
    id SERIAL PRIMARY KEY,
    tanggal DATE,
    guru_id UUID
  );
  CREATE TABLE IF NOT EXISTS jadwal_upacara (
    id SERIAL PRIMARY KEY,
    tanggal DATE,
    petugas TEXT
  );
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
  CREATE TABLE IF NOT EXISTS absensi_siswa (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    mapel_id INTEGER REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir','sakit','izin','alpa','terlambat')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_absensi_siswa
    ON absensi_siswa (siswa_id, tanggal, COALESCE(mapel_id, 0));
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
  CREATE TABLE IF NOT EXISTS wakil_program_kerja (
    id SERIAL PRIMARY KEY,
    nama_program VARCHAR(200) NOT NULL,
    bidang VARCHAR(100) NOT NULL DEFAULT 'Kurikulum',
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    penanggung_jawab VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'belum_mulai'
      CHECK (status IN ('belum_mulai','sedang_berjalan','selesai','ditunda')),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS wakil_supervisi (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    kelas VARCHAR(50),
    mata_pelajaran VARCHAR(100),
    aspek_penilaian TEXT,
    nilai NUMERIC(5,2) CHECK (nilai >= 0 AND nilai <= 100),
    catatan TEXT,
    rekomendasi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS wakil_perangkat_pembelajaran (
    id SERIAL PRIMARY KEY,
    guru_id INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    nama_perangkat VARCHAR(200) NOT NULL,
    jenis VARCHAR(50) NOT NULL DEFAULT 'RPP',
    status VARCHAR(30) NOT NULL DEFAULT 'belum_lengkap'
      CHECK (status IN ('lengkap','belum_lengkap')),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO academic_user;
EOSQL

echo "--- Inisialisasi tabel: asset_db ---"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="asset_db" <<-EOSQL
  CREATE TABLE IF NOT EXISTS informasi_pengajuan (id SERIAL PRIMARY KEY, deskripsi TEXT, status VARCHAR(50));
  CREATE TABLE IF NOT EXISTS peminjaman_barang (id SERIAL PRIMARY KEY, user_id UUID, barang_id INTEGER, tanggal_pinjam DATE);
  CREATE TABLE IF NOT EXISTS pengajuan_alat_barang (id SERIAL PRIMARY KEY, user_id UUID, nama_alat VARCHAR(100), jumlah INTEGER);
  CREATE TABLE IF NOT EXISTS respon_peminjaman (id SERIAL PRIMARY KEY, peminjaman_id INTEGER, status VARCHAR(20));
  CREATE TABLE IF NOT EXISTS respon_pengajuan_bendahara (id SERIAL PRIMARY KEY, pengajuan_id INTEGER, status VARCHAR(20));
  CREATE TABLE IF NOT EXISTS respon_pengajuan_kepsek (id SERIAL PRIMARY KEY, pengajuan_id INTEGER, status VARCHAR(20));
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO asset_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO asset_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO asset_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO asset_user;
EOSQL

echo "--- Inisialisasi tabel: learning_db ---"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="learning_db" <<-EOSQL
  CREATE TABLE IF NOT EXISTS absensi_guru (
    id              SERIAL PRIMARY KEY,
    id_absensiguru  UUID    NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    user_id         UUID    NOT NULL,
    nama_guru       VARCHAR(255) NOT NULL DEFAULT 'Unknown',
    mata_pelajaran  VARCHAR(255) NOT NULL DEFAULT '-',
    jam_masuk       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tanggal         DATE    NOT NULL,
    foto            TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'hadir'
                    CHECK (status IN ('hadir','terlambat','izin','sakit','alpa')),
    keterangan      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, tanggal)
  );
  CREATE TABLE IF NOT EXISTS catatan_mengajar (
    id SERIAL PRIMARY KEY, guru_id UUID, kelas_id INTEGER, materi TEXT
  );
  CREATE TABLE IF NOT EXISTS evaluasi_guru (
    id SERIAL PRIMARY KEY, guru_id UUID, nilai INTEGER, catatan TEXT
  );
  CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (
    id             SERIAL PRIMARY KEY,
    guru_id        UUID         NOT NULL,
    nama_dokumen   VARCHAR(200) NOT NULL,
    jenis_dokumen  VARCHAR(50)  NOT NULL,
    file_name      VARCHAR(255),
    file_data      BYTEA,
    file_mime      VARCHAR(100),
    tanggal_upload TIMESTAMP    DEFAULT NOW(),
    created_at     TIMESTAMP    DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS review_kepsek (id SERIAL PRIMARY KEY, perangkat_id INTEGER, komentar TEXT);
  CREATE TABLE IF NOT EXISTS review_wakasek (id SERIAL PRIMARY KEY, perangkat_id INTEGER, komentar TEXT);
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO learning_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO learning_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO learning_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO learning_user;
EOSQL

echo "--- Inisialisasi tabel: vocational_db ---"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="vocational_db" <<-EOSQL
  CREATE TABLE IF NOT EXISTS kelas_pramuka (id SERIAL PRIMARY KEY, nama_regu VARCHAR(100) NOT NULL);
  CREATE TABLE IF NOT EXISTS anggota_regu (
    id SERIAL PRIMARY KEY,
    regu_id INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
    siswa_id INTEGER NOT NULL,
    nama_lengkap VARCHAR(150)
  );
  CREATE TABLE IF NOT EXISTS absensi_pramuka (
    id SERIAL PRIMARY KEY,
    regu_id INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
    siswa_id INTEGER NOT NULL,
    nama_lengkap VARCHAR(150),
    kelas_id INTEGER,
    tanggal DATE NOT NULL,
    status VARCHAR(20) NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_absensi_pramuka_unique
    ON absensi_pramuka (regu_id, siswa_id, tanggal);
  CREATE TABLE IF NOT EXISTS laporan_pramuka (
    id SERIAL PRIMARY KEY,
    regu_id INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
    deskripsi TEXT,
    file_url TEXT,
    tanggal DATE DEFAULT CURRENT_DATE
  );
  CREATE TABLE IF NOT EXISTS silabus_pramuka (
    id SERIAL PRIMARY KEY,
    tingkat_kelas VARCHAR(20),
    judul_kegiatan VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (
    id SERIAL PRIMARY KEY,
    siswa_id TEXT,
    nama_siswa VARCHAR(150),
    nama_perusahaan VARCHAR(150),
    alamat TEXT,
    posisi VARCHAR(150),
    deskripsi_pekerjaan TEXT,
    pembimbing_industri VARCHAR(150),
    kontak_pembimbing VARCHAR(100),
    foto_url TEXT,
    tanggal DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS laporan_progres_pkl (
    id SERIAL PRIMARY KEY, siswa_id INTEGER, minggu_ke INTEGER, deskripsi TEXT
  );
  CREATE TABLE IF NOT EXISTS nilai_pkl (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER NOT NULL,
    nama_siswa VARCHAR(150),
    kelas_id INTEGER,
    nilai_praktik NUMERIC(5,2) DEFAULT 0,
    nilai_sikap NUMERIC(5,2) DEFAULT 0,
    nilai_laporan NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_nilai_pkl UNIQUE (siswa_id, kelas_id)
  );
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vocational_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vocational_user;
EOSQL

echo "========================================"
echo " Semua database & tabel berhasil dibuat!"
echo "========================================"