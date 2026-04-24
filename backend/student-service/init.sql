CREATE TABLE IF NOT EXISTS parenting (
    id SERIAL PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS kebersihan_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    penilaian JSONB DEFAULT '{}'::jsonb,
    catatan TEXT,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    siswa_id INTEGER NOT NULL,
    kelas_id INTEGER,
    wali_id UUID,
    nomor_surat VARCHAR(100),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    alasan TEXT NOT NULL,
    tindak_lanjut TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'dikirim', 'selesai')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO student_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO student_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO student_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO student_user;