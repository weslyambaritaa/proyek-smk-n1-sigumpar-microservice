CREATE TABLE IF NOT EXISTS kebersihan_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    penilaian JSONB DEFAULT '{}',
    catatan TEXT,
    foto_url TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nilai_siswa (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER NOT NULL,
    kelas_id INTEGER NOT NULL,
    mapel_id INTEGER NOT NULL,
    guru_id UUID NOT NULL,
    tahun_ajar VARCHAR(20) DEFAULT '2024/2025',
    semester VARCHAR(20) DEFAULT 'ganjil',

    tugas NUMERIC(5,2) DEFAULT 0,
    kuis NUMERIC(5,2) DEFAULT 0,
    uts NUMERIC(5,2) DEFAULT 0,
    uas NUMERIC(5,2) DEFAULT 0,
    praktik NUMERIC(5,2) DEFAULT 0,

    bobot_tugas NUMERIC(5,2) DEFAULT 20,
    bobot_kuis NUMERIC(5,2) DEFAULT 10,
    bobot_uts NUMERIC(5,2) DEFAULT 25,
    bobot_uas NUMERIC(5,2) DEFAULT 30,
    bobot_praktik NUMERIC(5,2) DEFAULT 15,

    nilai_akhir NUMERIC(5,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_nilai_siswa 
    UNIQUE (siswa_id, kelas_id, mapel_id, tahun_ajar, semester)
);

CREATE INDEX IF NOT EXISTS idx_nilai_siswa_siswa_id ON nilai_siswa(siswa_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_kelas_id ON nilai_siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_mapel_id ON nilai_siswa(mapel_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_guru_id ON nilai_siswa(guru_id);

CREATE TABLE IF NOT EXISTS catatan_parenting (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER,
    kelas_id INTEGER,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kehadiran_ortu INTEGER DEFAULT 0,
    agenda VARCHAR(255),
    ringkasan TEXT,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS absensi_siswa (
  id SERIAL PRIMARY KEY,
  siswa_id INTEGER NOT NULL,
  kelas_id INTEGER NOT NULL,
  mapel_id INTEGER,
  jadwal_id INTEGER,
  guru_id UUID,
  tanggal DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('hadir', 'sakit', 'izin', 'alpa', 'terlambat')
  ),
  keterangan TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_absensi_siswa_jadwal UNIQUE (siswa_id, tanggal, jadwal_id)
);

-- 1. Absensi wali kelas (tanpa jadwal)
CREATE UNIQUE INDEX uq_absensi_wali_per_hari
ON absensi_siswa (siswa_id, tanggal)
WHERE jadwal_id IS NULL;

-- 2. Absensi guru mapel (berdasarkan jadwal)
CREATE UNIQUE INDEX uq_absensi_mapel_per_jadwal
ON absensi_siswa (siswa_id, tanggal, jadwal_id)
WHERE jadwal_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS refleksi_wali_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    capaian TEXT,
    tantangan TEXT,
    rencana TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS surat_panggilan_siswa (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER,
    kelas_id INTEGER,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    alasan TEXT,
    tindak_lanjut TEXT,
    status VARCHAR(30) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kebersihan_kelas_id ON kebersihan_kelas(kelas_id);
CREATE INDEX IF NOT EXISTS idx_parenting_kelas_id ON catatan_parenting(kelas_id);
CREATE INDEX IF NOT EXISTS idx_parenting_siswa_id ON catatan_parenting(siswa_id);
CREATE INDEX IF NOT EXISTS idx_refleksi_kelas_id ON refleksi_wali_kelas(kelas_id);
CREATE INDEX IF NOT EXISTS idx_surat_panggilan_siswa_id ON surat_panggilan_siswa(siswa_id);
CREATE INDEX IF NOT EXISTS idx_surat_panggilan_kelas_id ON surat_panggilan_siswa(kelas_id);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO student_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO student_user;