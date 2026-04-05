-- Tabel Perangkat Pembelajaran
CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (
    id SERIAL PRIMARY KEY,
    guru_id UUID NOT NULL,
    nama_dokumen VARCHAR(200) NOT NULL,
    jenis_dokumen VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    file_data BYTEA,
    file_mime VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    feedback TEXT,
    approved_at TIMESTAMP,
    approved_by UUID,
    tanggal_upload TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

--Tabel evaluasi guru
CREATE TABLE IF NOT EXISTS evaluasi_guru (
    id SERIAL PRIMARY KEY,
    guru_id UUID NOT NULL,
    periode_penilaian VARCHAR(50) NOT NULL,
    nilai_numerik DECIMAL(5,2),
    nilai_huruf VARCHAR(2),
    komentar TEXT,
    dinilai_oleh UUID NOT NULL,
    dinilai_pada TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Nilai Siswa
CREATE TABLE IF NOT EXISTS nilai_siswa (
    id SERIAL PRIMARY KEY,
    guru_id UUID NOT NULL,
    siswa_id INTEGER NOT NULL,
    nama_siswa VARCHAR(150),
    nis VARCHAR(30),
    kelas_id INTEGER NOT NULL,
    nama_kelas VARCHAR(50),
    mata_pelajaran VARCHAR(100) NOT NULL,
    tahun_ajar VARCHAR(20) NOT NULL,
    nilai_tugas NUMERIC(5,2) DEFAULT 0,
    nilai_kuis NUMERIC(5,2) DEFAULT 0,
    nilai_uts NUMERIC(5,2) DEFAULT 0,
    nilai_uas NUMERIC(5,2) DEFAULT 0,
    nilai_praktik NUMERIC(5,2) DEFAULT 0,
    nilai_akhir NUMERIC(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_nilai UNIQUE (guru_id, siswa_id, mata_pelajaran, tahun_ajar)
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO learning_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO learning_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO learning_user;
