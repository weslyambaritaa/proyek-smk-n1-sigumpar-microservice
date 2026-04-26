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
    tanggal DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('hadir', 'sakit', 'izin', 'alpa', 'terlambat')
    ),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_absensi_siswa UNIQUE (siswa_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_absensi_siswa_siswa_id 
ON absensi_siswa(siswa_id);

CREATE INDEX IF NOT EXISTS idx_absensi_siswa_kelas_id 
ON absensi_siswa(kelas_id);

CREATE INDEX IF NOT EXISTS idx_absensi_siswa_tanggal 
ON absensi_siswa(tanggal);


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