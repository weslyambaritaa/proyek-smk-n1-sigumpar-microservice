CREATE TABLE IF NOT EXISTS kebersihan_kelas (id SERIAL PRIMARY KEY, kelas_id INTEGER, tanggal DATE, skor INTEGER);
CREATE TABLE IF NOT EXISTS parenting (id SERIAL PRIMARY KEY, siswa_id INTEGER, catatan TEXT);
CREATE TABLE IF NOT EXISTS refleksi (id SERIAL PRIMARY KEY, siswa_id INTEGER, deskripsi TEXT);
CREATE TABLE IF NOT EXISTS surat_panggilan (id SERIAL PRIMARY KEY, siswa_id INTEGER, tanggal DATE, alasan TEXT);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  nis VARCHAR(50),
  kelas VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_grades (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  nis VARCHAR(50),
  mapel VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  tahun_ajar VARCHAR(20) NOT NULL,
  tugas NUMERIC(5,2) DEFAULT 0,
  kuis NUMERIC(5,2) DEFAULT 0,
  uts NUMERIC(5,2) DEFAULT 0,
  uas NUMERIC(5,2) DEFAULT 0,
  praktik NUMERIC(5,2) DEFAULT 0,
  nilai_akhir NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_student_grade'
  ) THEN
    ALTER TABLE student_grades
    ADD CONSTRAINT unique_student_grade
    UNIQUE (student_id, mapel, kelas, tahun_ajar);
  END IF;
END $$;