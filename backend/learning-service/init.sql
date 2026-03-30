-- init.sql — Learning Service (disesuaikan dengan TypeScript models)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS t_absensi_guru (
  id_absensiGuru   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL,
  "namaGuru"       VARCHAR(150) NOT NULL,
  "mataPelajaran"  VARCHAR(150) NOT NULL,
  "jamMasuk"       TIMESTAMP    NOT NULL,
  foto             TEXT,
  status           VARCHAR(50)  NOT NULL,
  keterangan       TEXT,
  created_at       TIMESTAMP    DEFAULT NOW(),
  updated_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_catatan_mengajar (
  id_catatanMengajar  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID        NOT NULL,
  tanggal             DATE        NOT NULL,
  kelas               VARCHAR(50) NOT NULL,
  "mataPelajaran"     VARCHAR(150) NOT NULL,
  "materiDisampaikan" TEXT        NOT NULL,
  catatan             TEXT,
  created_at          TIMESTAMP   DEFAULT NOW(),
  updated_at          TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_evaluasi_guru (
  id_evaluasiGuru    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID        NOT NULL,
  user_id_penilai    UUID        NOT NULL,
  "statusEvaluasi"   VARCHAR(50) NOT NULL,
  "catatanEvaluasi"  TEXT,
  created_at         TIMESTAMP   DEFAULT NOW(),
  updated_at         TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_perangkat_pembelajaran (
  id_perangkatPembelajaran  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID         NOT NULL,
  "namaMapel"               VARCHAR(150) NOT NULL,
  kelas                     VARCHAR(50)  NOT NULL,
  "uploadSilabus"           TEXT,
  "uploadRPP"               TEXT,
  "modulAjar"               TEXT,
  created_at                TIMESTAMP    DEFAULT NOW(),
  updated_at                TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_review_perangkat_kepsek (
  id_reviewPerangkatPembelajaranKepsek  UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_perangkatPembelajaran              UUID  NOT NULL REFERENCES t_perangkat_pembelajaran(id_perangkatPembelajaran) ON DELETE CASCADE,
  user_id                               UUID  NOT NULL,
  "komentarSilabus"                     TEXT,
  "komentarRPP"                         TEXT,
  "komentarModulAjar"                   TEXT,
  created_at                            TIMESTAMP DEFAULT NOW(),
  updated_at                            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_review_perangkat_wakasek (
  id_reviewPerangkatPembelajaranWakasek UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_perangkatPembelajaran              UUID  NOT NULL REFERENCES t_perangkat_pembelajaran(id_perangkatPembelajaran) ON DELETE CASCADE,
  user_id                               UUID  NOT NULL,
  "komentarSilabus"                     TEXT,
  "komentarRPP"                         TEXT,
  "komentarModulAjar"                   TEXT,
  created_at                            TIMESTAMP DEFAULT NOW(),
  updated_at                            TIMESTAMP DEFAULT NOW()
);