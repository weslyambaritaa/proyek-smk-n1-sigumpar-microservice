CREATE TABLE IF NOT EXISTS kebersihan_kelas (id SERIAL PRIMARY KEY, kelas_id INTEGER, tanggal DATE, skor INTEGER);
CREATE TABLE IF NOT EXISTS parenting (id SERIAL PRIMARY KEY, siswa_id INTEGER, catatan TEXT);
CREATE TABLE IF NOT EXISTS refleksi (id SERIAL PRIMARY KEY, siswa_id INTEGER, deskripsi TEXT);
CREATE TABLE IF NOT EXISTS surat_panggilan (id SERIAL PRIMARY KEY, siswa_id INTEGER, tanggal DATE, alasan TEXT);

CREATE TABLE IF NOT EXISTS parenting_meetings (
  id SERIAL PRIMARY KEY,
  kelas VARCHAR(50) NOT NULL,
  wali_kelas VARCHAR(150),
  meeting_date DATE NOT NULL,
  attendance_count INTEGER DEFAULT 0,
  attendance_label VARCHAR(100),
  agenda VARCHAR(255) NOT NULL,
  summary TEXT,
  attachment_name VARCHAR(255),
  attachment_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);