-- ============================================================
-- VOCATIONAL SERVICE — DATABASE SCHEMA
-- SMK N 1 Sigumpar PKL Monitoring System
-- ============================================================

-- Tabel siswa (referensi dari student-service, bisa di-sync)
CREATE TABLE IF NOT EXISTS siswa (
    id          SERIAL PRIMARY KEY,
    nisn        VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    kelas       VARCHAR(50),
    jurusan     VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pengajuan PKL oleh siswa
CREATE TABLE IF NOT EXISTS pkl_submissions (
    id                  SERIAL PRIMARY KEY,
    siswa_id            INT NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    nama_perusahaan     VARCHAR(150) NOT NULL,
    bidang_usaha        VARCHAR(100),
    alamat              TEXT,
    pembimbing_industri VARCHAR(150),
    kontak_pembimbing   VARCHAR(50),
    judul_penempatan    VARCHAR(200),
    deskripsi_pekerjaan TEXT,
    tanggal_mulai       DATE,
    tanggal_selesai     DATE,
    foto_lokasi         TEXT,
    -- Status
    status_validasi     VARCHAR(20)  DEFAULT 'pending',  -- pending | validated | rejected
    status_persetujuan  VARCHAR(20)  DEFAULT 'pending',  -- pending | approved | rejected
    keterangan_layak    TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring & kunjungan lapangan
CREATE TABLE IF NOT EXISTS pkl_monitoring (
    id                  SERIAL PRIMARY KEY,
    submission_id       INT NOT NULL REFERENCES pkl_submissions(id) ON DELETE CASCADE,
    tanggal_kunjungan   DATE NOT NULL,
    catatan_monitoring  TEXT,
    progres_siswa       TEXT,
    file_laporan        TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Penilaian akhir PKL per siswa
CREATE TABLE IF NOT EXISTS pkl_penilaian (
    id              SERIAL PRIMARY KEY,
    submission_id   INT UNIQUE NOT NULL REFERENCES pkl_submissions(id) ON DELETE CASCADE,
    disiplin        INT DEFAULT 0,
    teknis          INT DEFAULT 0,
    komunikasi      INT DEFAULT 0,
    laporan         INT DEFAULT 0,
    presentasi      INT DEFAULT 0,
    nilai_akhir     DECIMAL(5,2),
    grade           VARCHAR(2),
    status_penilaian VARCHAR(20) DEFAULT 'Draft',  -- Draft | Simpan
    catatan_guru    TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Laporan lokasi PKL (legacy, kompatibel dengan FE lama)
CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (
    id              SERIAL PRIMARY KEY,
    siswa_id        INT REFERENCES siswa(id),
    nama_perusahaan VARCHAR(150),
    alamat          TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Laporan progres mingguan (legacy)
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (
    id          SERIAL PRIMARY KEY,
    siswa_id    INT REFERENCES siswa(id),
    minggu_ke   INT,
    deskripsi   TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── SEED DATA (untuk development/testing) ──────────────────────
INSERT INTO siswa (nisn, nama_lengkap, kelas, jurusan) VALUES
  ('0087612345', 'Aulia Rahman',   'XI RPL 1', 'Rekayasa Perangkat Lunak'),
  ('0087612346', 'Nabila Sari',    'XI TKJ 2', 'Teknik Komputer & Jaringan'),
  ('0087612347', 'Fikri Maulana',  'XI TBSM 1','Teknik Bisnis Sepeda Motor'),
  ('2122001',    'Budi Santoso',   'XII RPL 1', 'Rekayasa Perangkat Lunak'),
  ('2122002',    'Ani Wijaya',     'XII TKJ 1', 'Teknik Komputer & Jaringan')
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO pkl_submissions (siswa_id, nama_perusahaan, bidang_usaha, alamat, pembimbing_industri, kontak_pembimbing, judul_penempatan, status_validasi, status_persetujuan) VALUES
  (1, 'PT Digital Nusantara',  'Software Development', 'Medan, Sumatera Utara', 'Budi Santoso',    '0812-3456-7890', 'Junior Web Developer',   'validated', 'approved'),
  (2, 'CV Jaringan Cerdas',    'Networking',            'Medan, Sumatera Utara', 'Rina Wulandari',  '0813-4567-8901', 'Teknisi Jaringan',        'validated', 'approved'),
  (3, 'Bengkel Prima Motor',   'Otomotif',              'Tarutung, Tapanuli Utara','Agus Setiawan', '0814-5678-9012', 'Mekanik Motor',           'pending',   'pending'),
  (4, 'PT. Teknologi Maju',    'Software Development', 'Medan, Sumatera Utara', 'Heru Darmawan',   '0812-3456-7890', 'Frontend Developer',      'validated', 'approved'),
  (5, 'PT. Teknologi Maju',    'Software Development', 'Medan, Sumatera Utara', 'Heru Darmawan',   '0812-3456-7890', 'Backend Developer',       'validated', 'approved')
ON CONFLICT DO NOTHING;

INSERT INTO pkl_penilaian (submission_id, disiplin, teknis, komunikasi, laporan, presentasi, nilai_akhir, grade, status_penilaian) VALUES
  (1, 88, 90, 86, 89, 87, 88.80, 'A', 'Simpan'),
  (2, 92, 94, 90, 91, 93, 92.30, 'A', 'Simpan')
ON CONFLICT (submission_id) DO NOTHING;