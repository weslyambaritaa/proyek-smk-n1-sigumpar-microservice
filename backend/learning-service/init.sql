CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS absensi_guru (
  id SERIAL PRIMARY KEY,
  id_absensiguru UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  user_id UUID NOT NULL,
  nama_guru VARCHAR(255) NOT NULL DEFAULT 'Unknown',
  mata_pelajaran VARCHAR(255) NOT NULL DEFAULT '-',
  jam_masuk TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tanggal DATE NOT NULL,
  foto TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'hadir'
    CHECK (status IN ('hadir', 'terlambat', 'izin', 'sakit', 'alpa')),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, tanggal)
);

CREATE TABLE IF NOT EXISTS catatan_mengajar (
  id SERIAL PRIMARY KEY,
  guru_id UUID NOT NULL,
  nama_guru VARCHAR(255),
  kelas_id INTEGER,
  mapel_id INTEGER,
  mata_pelajaran VARCHAR(255),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_mulai TIME,
  jam_selesai TIME,
  materi TEXT NOT NULL,
  metode TEXT,
  kendala TEXT,
  tindak_lanjut TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluasi_guru (
  id SERIAL PRIMARY KEY,
  guru_id UUID NOT NULL,
  nama_guru VARCHAR(255) NOT NULL,
  mapel VARCHAR(255),
  semester VARCHAR(50),
  penilaian JSONB NOT NULL DEFAULT '{}',
  skor NUMERIC(5,2) CHECK (skor >= 0 AND skor <= 100),
  predikat VARCHAR(50),
  catatan TEXT,
  evaluator_id UUID,
  evaluator_nama VARCHAR(255),
  evaluator_role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluasi_guru_id ON evaluasi_guru(guru_id);
CREATE INDEX IF NOT EXISTS idx_evaluasi_created_at ON evaluasi_guru(created_at);


CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (
  id SERIAL PRIMARY KEY,
  guru_id UUID NOT NULL,
  nama_guru VARCHAR(255),
  nama_dokumen VARCHAR(200) NOT NULL,
  jenis_dokumen VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_data BYTEA,
  file_mime VARCHAR(100),
  status_review VARCHAR(20) DEFAULT 'menunggu'
    CHECK (status_review IN ('menunggu', 'disetujui', 'revisi', 'ditolak')),
  catatan_review TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  versi INTEGER DEFAULT 1,
  parent_id INTEGER REFERENCES perangkat_pembelajaran(id) ON DELETE SET NULL,
  tanggal_upload TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_kepsek (
  id SERIAL PRIMARY KEY,
  perangkat_id INTEGER REFERENCES perangkat_pembelajaran(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'revisi'
    CHECK (status IN ('disetujui', 'revisi', 'ditolak')),
  komentar TEXT,
  kepsek_id UUID,
  kepsek_nama TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_wakasek (
  id SERIAL PRIMARY KEY,
  perangkat_id INTEGER REFERENCES perangkat_pembelajaran(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'revisi'
    CHECK (status IN ('disetujui', 'revisi', 'ditolak')),
  komentar TEXT,
  wakasek_id UUID,
  wakasek_nama TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_absensi_guru_user_id ON absensi_guru(user_id);
CREATE INDEX IF NOT EXISTS idx_absensi_guru_tanggal ON absensi_guru(tanggal);
CREATE INDEX IF NOT EXISTS idx_catatan_guru_id ON catatan_mengajar(guru_id);
CREATE INDEX IF NOT EXISTS idx_evaluasi_guru_id ON evaluasi_guru(guru_id);
CREATE INDEX IF NOT EXISTS idx_perangkat_guru_id ON perangkat_pembelajaran(guru_id);
CREATE INDEX IF NOT EXISTS idx_perangkat_status ON perangkat_pembelajaran(status_review);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO learning_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO learning_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO learning_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO learning_user;9