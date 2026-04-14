-- ═══════════════════════════════════════════════════════════════════════════
-- Academic Service — init.sql (lengkap, sesuai semua model Sequelize)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── KELAS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kelas (
  id            SERIAL PRIMARY KEY,
  nama_kelas    VARCHAR(50) NOT NULL,
  tingkat       VARCHAR(10),
  wali_kelas_id UUID
);

-- ─── SISWA ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS siswa (
  id            SERIAL PRIMARY KEY,
  nisn          VARCHAR(20) UNIQUE NOT NULL,
  nama_lengkap  VARCHAR(150) NOT NULL,
  kelas_id      INTEGER REFERENCES kelas(id) ON DELETE SET NULL
);

-- ─── GURU (dikelola Tata Usaha) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guru (
  id             SERIAL PRIMARY KEY,
  nip            VARCHAR(30) UNIQUE,
  nama_lengkap   VARCHAR(150) NOT NULL,
  email          VARCHAR(150),
  jabatan        VARCHAR(100),
  mata_pelajaran VARCHAR(150),
  no_telepon     VARCHAR(20),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── MATA PELAJARAN ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id            SERIAL PRIMARY KEY,
  nama_mapel    VARCHAR(100) UNIQUE NOT NULL,
  kelas_id      INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
  guru_mapel_id INTEGER
);

-- ─── JADWAL ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jadwal_mengajar (
  id             SERIAL PRIMARY KEY,
  guru_id        UUID,
  kelas_id       INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
  mata_pelajaran VARCHAR(100),
  hari           VARCHAR(20),
  waktu_mulai    TIME,
  waktu_berakhir TIME
);

CREATE TABLE IF NOT EXISTS jadwal_piket (
  id      SERIAL PRIMARY KEY,
  tanggal DATE,
  guru_id UUID
);

CREATE TABLE IF NOT EXISTS jadwal_upacara (
  id      SERIAL PRIMARY KEY,
  tanggal DATE,
  petugas TEXT
);

-- ─── INFORMASI ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pengumuman (
  id    SERIAL PRIMARY KEY,
  judul VARCHAR(255),
  isi   TEXT
);

CREATE TABLE IF NOT EXISTS arsip_surat (
  id          SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(100),
  file_url    TEXT
);

-- ─── NILAI SISWA ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nilai_siswa (
  id             SERIAL PRIMARY KEY,
  siswa_id       INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  mapel_id       INTEGER NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  kelas_id       INTEGER NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  tahun_ajar     VARCHAR(20) NOT NULL,
  nilai_tugas    NUMERIC(5,2) DEFAULT 0,
  nilai_kuis     NUMERIC(5,2) DEFAULT 0,
  nilai_uts      NUMERIC(5,2) DEFAULT 0,
  nilai_uas      NUMERIC(5,2) DEFAULT 0,
  nilai_praktik  NUMERIC(5,2) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_nilai_siswa UNIQUE (siswa_id, mapel_id, kelas_id, tahun_ajar)
);

-- ─── ABSENSI SISWA ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS absensi_siswa (
  id          SERIAL PRIMARY KEY,
  siswa_id    INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  tanggal     DATE    NOT NULL,
  mapel_id    INTEGER REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL
              CHECK (status IN ('hadir','sakit','izin','alpa','terlambat')),
  keterangan  TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_absensi_siswa
  ON absensi_siswa (siswa_id, tanggal, COALESCE(mapel_id, 0));

CREATE INDEX IF NOT EXISTS idx_absensi_siswa_siswa_id ON absensi_siswa(siswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa_tanggal   ON absensi_siswa(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa_mapel_id  ON absensi_siswa(mapel_id);

-- ─── WALI KELAS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parenting_log (
  id              SERIAL PRIMARY KEY,
  kelas_id        INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
  wali_id         UUID,
  tanggal         DATE    NOT NULL DEFAULT CURRENT_DATE,
  kehadiran_ortu  INTEGER DEFAULT 0,
  agenda          VARCHAR(255),
  ringkasan       TEXT,
  foto_url        TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kebersihan_kelas (
  id         SERIAL PRIMARY KEY,
  kelas_id   INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
  tanggal    DATE    NOT NULL DEFAULT CURRENT_DATE,
  penilaian  JSONB   DEFAULT '{}',
  catatan    TEXT,
  foto_url   TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refleksi_wali_kelas (
  id         SERIAL PRIMARY KEY,
  kelas_id   INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
  wali_id    UUID,
  tanggal    DATE    NOT NULL DEFAULT CURRENT_DATE,
  capaian    TEXT,
  tantangan  TEXT,
  rencana    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── WAKIL KEPALA SEKOLAH ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wakil_program_kerja (
  id               SERIAL PRIMARY KEY,
  nama_program     VARCHAR(200) NOT NULL,
  bidang           VARCHAR(100) NOT NULL DEFAULT 'Kurikulum',
  tanggal_mulai    DATE NOT NULL,
  tanggal_selesai  DATE,
  penanggung_jawab VARCHAR(150),
  status           VARCHAR(30)  NOT NULL DEFAULT 'belum_mulai'
                   CHECK (status IN ('belum_mulai','sedang_berjalan','selesai','ditunda')),
  deskripsi        TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- wakil_supervisi menggunakan guru.id (INTEGER), bukan UUID
CREATE TABLE IF NOT EXISTS wakil_supervisi (
  id               SERIAL PRIMARY KEY,
  guru_id          INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
  tanggal          DATE    NOT NULL,
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
  id             SERIAL PRIMARY KEY,
  guru_id        INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
  nama_perangkat VARCHAR(200) NOT NULL,
  jenis          VARCHAR(50)  NOT NULL DEFAULT 'RPP',
  status         VARCHAR(30)  NOT NULL DEFAULT 'belum_lengkap'
                 CHECK (status IN ('lengkap','belum_lengkap')),
  catatan        TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── KONFIRMASI REKAP NILAI (Kepala Sekolah) ──────────────────────────────
CREATE TABLE IF NOT EXISTS konfirmasi_rekap_nilai (
  id              SERIAL PRIMARY KEY,
  kelas_id        INTEGER,
  mapel_id        INTEGER,
  tahun_ajar      VARCHAR(20),
  wali_id         UUID,
  dikonfirmasi_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CUTI GURU ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cuti_guru (
  id              SERIAL PRIMARY KEY,
  guru_id         INTEGER NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
  jenis_cuti      VARCHAR(50) NOT NULL,
  tanggal_mulai   DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  alasan          TEXT,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by     UUID,
  approved_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── ANGGARAN ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anggaran (
  id              SERIAL PRIMARY KEY,
  tahun           INTEGER NOT NULL,
  kategori        VARCHAR(100) NOT NULL,
  sub_kategori    VARCHAR(100),
  jumlah_anggaran NUMERIC(15,2) NOT NULL,
  jumlah_terpakai NUMERIC(15,2) DEFAULT 0,
  deskripsi       TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for anggaran
INSERT INTO anggaran (tahun, kategori, sub_kategori, jumlah_anggaran, deskripsi) VALUES
(2026, 'Sarana Prasarana', 'Pemeliharaan Gedung', 50000000, 'Anggaran untuk perbaikan dan pemeliharaan gedung sekolah'),
(2026, 'Sarana Prasarana', 'Pembelian Alat Tulis', 10000000, 'ATK untuk kegiatan belajar mengajar'),
(2026, 'SDM', 'Pelatihan Guru', 25000000, 'Pelatihan dan pengembangan kompetensi guru'),
(2026, 'Kegiatan', 'Kegiatan Ekstrakurikuler', 15000000, 'Dana untuk kegiatan ekstrakurikuler siswa');

-- ─── GRANT PERMISSIONS ────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO academic_user;