CREATE TABLE IF NOT EXISTS absensi_guru (
  id SERIAL PRIMARY KEY,
  guru_id UUID,
  tanggal DATE,
  status VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS catatan_mengajar (
  id SERIAL PRIMARY KEY,
  guru_id UUID,
  kelas_id INTEGER,
  materi TEXT
);

CREATE TABLE IF NOT EXISTS evaluasi_guru (
  id SERIAL PRIMARY KEY,
  guru_id UUID,
  nilai INTEGER,
  catatan TEXT
);

CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  nama_mapel VARCHAR(150),
  kelas VARCHAR(50),
  upload_silabus TEXT,
  upload_rpp TEXT,
  modul_ajar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_kepsek (
  id SERIAL PRIMARY KEY,
  perangkat_id INTEGER,
  komentar TEXT
);

CREATE TABLE IF NOT EXISTS review_wakasek (
  id SERIAL PRIMARY KEY,
  perangkat_id INTEGER,
  komentar TEXT
);