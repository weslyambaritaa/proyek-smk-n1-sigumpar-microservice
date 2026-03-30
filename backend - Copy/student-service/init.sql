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
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_student_grade'
  ) THEN
    ALTER TABLE student_grades
    ADD CONSTRAINT unique_student_grade
    UNIQUE (student_id, mapel, kelas, tahun_ajar);
  END IF;
END $$;

-- ============================================================
-- SEED DATA SISWA (self-contained, tidak butuh service lain)
-- XII RPL 1
-- ============================================================
INSERT INTO users (id, username, email, nis, kelas) VALUES
  ('s-xii-rpl1-001', 'Andi Pratama',       'andi.pratama@smk.sch.id',       '2021001', 'XII RPL 1'),
  ('s-xii-rpl1-002', 'Budi Santoso',        'budi.santoso@smk.sch.id',        '2021002', 'XII RPL 1'),
  ('s-xii-rpl1-003', 'Citra Dewi',          'citra.dewi@smk.sch.id',          '2021003', 'XII RPL 1'),
  ('s-xii-rpl1-004', 'Dian Rahayu',         'dian.rahayu@smk.sch.id',         '2021004', 'XII RPL 1'),
  ('s-xii-rpl1-005', 'Eko Wijaya',          'eko.wijaya@smk.sch.id',          '2021005', 'XII RPL 1'),
  ('s-xii-rpl1-006', 'Fitri Handayani',     'fitri.handayani@smk.sch.id',     '2021006', 'XII RPL 1'),
  ('s-xii-rpl1-007', 'Gilang Permana',      'gilang.permana@smk.sch.id',      '2021007', 'XII RPL 1'),
  ('s-xii-rpl1-008', 'Hendra Saputra',      'hendra.saputra@smk.sch.id',      '2021008', 'XII RPL 1'),
  ('s-xii-rpl1-009', 'Indah Lestari',       'indah.lestari@smk.sch.id',       '2021009', 'XII RPL 1'),
  ('s-xii-rpl1-010', 'Joko Susilo',         'joko.susilo@smk.sch.id',         '2021010', 'XII RPL 1')
ON CONFLICT (id) DO NOTHING;

-- XII RPL 2
INSERT INTO users (id, username, email, nis, kelas) VALUES
  ('s-xii-rpl2-001', 'Kevin Aditya',        'kevin.aditya@smk.sch.id',        '2021011', 'XII RPL 2'),
  ('s-xii-rpl2-002', 'Linda Kusuma',        'linda.kusuma@smk.sch.id',        '2021012', 'XII RPL 2'),
  ('s-xii-rpl2-003', 'Muhammad Rizki',      'muhammad.rizki@smk.sch.id',      '2021013', 'XII RPL 2'),
  ('s-xii-rpl2-004', 'Nadia Putri',         'nadia.putri@smk.sch.id',         '2021014', 'XII RPL 2'),
  ('s-xii-rpl2-005', 'Oscar Firmansyah',    'oscar.firmansyah@smk.sch.id',    '2021015', 'XII RPL 2'),
  ('s-xii-rpl2-006', 'Putri Amalia',        'putri.amalia@smk.sch.id',        '2021016', 'XII RPL 2'),
  ('s-xii-rpl2-007', 'Rizal Fauzi',         'rizal.fauzi@smk.sch.id',         '2021017', 'XII RPL 2'),
  ('s-xii-rpl2-008', 'Sari Wulandari',      'sari.wulandari@smk.sch.id',      '2021018', 'XII RPL 2'),
  ('s-xii-rpl2-009', 'Teguh Prasetyo',      'teguh.prasetyo@smk.sch.id',      '2021019', 'XII RPL 2'),
  ('s-xii-rpl2-010', 'Ulfa Rahmawati',      'ulfa.rahmawati@smk.sch.id',      '2021020', 'XII RPL 2')
ON CONFLICT (id) DO NOTHING;

-- XI RPL 1
INSERT INTO users (id, username, email, nis, kelas) VALUES
  ('s-xi-rpl1-001',  'Vian Nugroho',        'vian.nugroho@smk.sch.id',        '2022001', 'XI RPL 1'),
  ('s-xi-rpl1-002',  'Windi Sari',          'windi.sari@smk.sch.id',          '2022002', 'XI RPL 1'),
  ('s-xi-rpl1-003',  'Xena Alvira',         'xena.alvira@smk.sch.id',         '2022003', 'XI RPL 1'),
  ('s-xi-rpl1-004',  'Yoga Pratama',        'yoga.pratama@smk.sch.id',        '2022004', 'XI RPL 1'),
  ('s-xi-rpl1-005',  'Zahra Aulia',         'zahra.aulia@smk.sch.id',         '2022005', 'XI RPL 1'),
  ('s-xi-rpl1-006',  'Arif Budiman',        'arif.budiman@smk.sch.id',        '2022006', 'XI RPL 1'),
  ('s-xi-rpl1-007',  'Bella Anggraini',     'bella.anggraini@smk.sch.id',     '2022007', 'XI RPL 1'),
  ('s-xi-rpl1-008',  'Chandra Wijaya',      'chandra.wijaya@smk.sch.id',      '2022008', 'XI RPL 1'),
  ('s-xi-rpl1-009',  'Desi Permata',        'desi.permata@smk.sch.id',        '2022009', 'XI RPL 1'),
  ('s-xi-rpl1-010',  'Evan Setiawan',       'evan.setiawan@smk.sch.id',       '2022010', 'XI RPL 1')
ON CONFLICT (id) DO NOTHING;

-- XI RPL 2
INSERT INTO users (id, username, email, nis, kelas) VALUES
  ('s-xi-rpl2-001',  'Fani Oktavia',        'fani.oktavia@smk.sch.id',        '2022011', 'XI RPL 2'),
  ('s-xi-rpl2-002',  'Galih Santoso',       'galih.santoso@smk.sch.id',       '2022012', 'XI RPL 2'),
  ('s-xi-rpl2-003',  'Hani Rahmawati',      'hani.rahmawati@smk.sch.id',      '2022013', 'XI RPL 2'),
  ('s-xi-rpl2-004',  'Ilham Maulana',       'ilham.maulana@smk.sch.id',       '2022014', 'XI RPL 2'),
  ('s-xi-rpl2-005',  'Julia Safitri',       'julia.safitri@smk.sch.id',       '2022015', 'XI RPL 2'),
  ('s-xi-rpl2-006',  'Krisna Bayu',         'krisna.bayu@smk.sch.id',         '2022016', 'XI RPL 2'),
  ('s-xi-rpl2-007',  'Laila Nurhayati',     'laila.nurhayati@smk.sch.id',     '2022017', 'XI RPL 2'),
  ('s-xi-rpl2-008',  'Miko Ardian',         'miko.ardian@smk.sch.id',         '2022018', 'XI RPL 2'),
  ('s-xi-rpl2-009',  'Nina Setiawati',      'nina.setiawati@smk.sch.id',      '2022019', 'XI RPL 2'),
  ('s-xi-rpl2-010',  'Omar Hakim',          'omar.hakim@smk.sch.id',          '2022020', 'XI RPL 2')
ON CONFLICT (id) DO NOTHING;

-- GRANT akses ke student_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO student_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO student_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO student_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO student_user;
