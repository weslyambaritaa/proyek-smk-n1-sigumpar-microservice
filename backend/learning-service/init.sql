-- ═══════════════════════════════════════════════════════════════════════════
-- Learning Service — init.sql (v2, lowercase column names)
-- ═══════════════════════════════════════════════════════════════════════════

-- Tabel absensi guru (kolom lowercase — tidak bergantung case sensitivity PostgreSQL)
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

CREATE INDEX IF NOT EXISTS idx_absensi_guru_user_id ON absensi_guru(user_id);
CREATE INDEX IF NOT EXISTS idx_absensi_guru_tanggal  ON absensi_guru(tanggal);

CREATE TABLE IF NOT EXISTS catatan_mengajar (
  id       SERIAL PRIMARY KEY,
  guru_id  UUID,
  kelas_id INTEGER,
  materi   TEXT
);

CREATE TABLE IF NOT EXISTS evaluasi_guru (
  id      SERIAL PRIMARY KEY,
  guru_id UUID,
  nilai   INTEGER,
  catatan TEXT
);

-- Perangkat pembelajaran / RPP (file biner di DB)
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

CREATE TABLE IF NOT EXISTS review_kepsek (
  id           SERIAL PRIMARY KEY,
  perangkat_id INTEGER,
  komentar     TEXT
);

CREATE TABLE IF NOT EXISTS review_wakasek (
  id           SERIAL PRIMARY KEY,
  perangkat_id INTEGER,
  komentar     TEXT
);

-- ─── GRANT PERMISSIONS ────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO learning_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO learning_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO learning_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO learning_user;
