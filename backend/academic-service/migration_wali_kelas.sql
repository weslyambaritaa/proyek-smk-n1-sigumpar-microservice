-- Migration: Tabel Wali Kelas
CREATE TABLE IF NOT EXISTS parenting_log (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kehadiran_ortu INTEGER DEFAULT 0,
    agenda VARCHAR(255),
    ringkasan TEXT,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kebersihan_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    penilaian JSONB DEFAULT '{}',
    catatan TEXT,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refleksi_wali_kelas (
    id SERIAL PRIMARY KEY,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
    wali_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    capaian TEXT,
    tantangan TEXT,
    rencana TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE parenting_log TO academic_user;
GRANT ALL PRIVILEGES ON TABLE kebersihan_kelas TO academic_user;
GRANT ALL PRIVILEGES ON TABLE refleksi_wali_kelas TO academic_user;
GRANT ALL PRIVILEGES ON SEQUENCE parenting_log_id_seq TO academic_user;
GRANT ALL PRIVILEGES ON SEQUENCE kebersihan_kelas_id_seq TO academic_user;
GRANT ALL PRIVILEGES ON SEQUENCE refleksi_wali_kelas_id_seq TO academic_user;
