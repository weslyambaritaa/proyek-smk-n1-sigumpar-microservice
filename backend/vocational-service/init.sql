-- 1. Tabel Regu Pramuka
CREATE TABLE IF NOT EXISTS kelas_pramuka (
    id SERIAL PRIMARY KEY, 
    nama_regu VARCHAR(100) NOT NULL
);

-- 2. Tabel Anggota Regu (Untuk mapping siswa ke regu tertentu)
CREATE TABLE IF NOT EXISTS anggota_regu (
    id SERIAL PRIMARY KEY,
    regu_id INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
    siswa_id INTEGER NOT NULL
);

-- 3. Tabel Absensi (Sekarang punya regu_id)
CREATE TABLE IF NOT EXISTS absensi_pramuka (
    id SERIAL PRIMARY KEY, 
    regu_id INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
    siswa_id INTEGER NOT NULL, 
    tanggal DATE NOT NULL, 
    status VARCHAR(20) NOT NULL
);

-- 4. Tabel Laporan (Sekarang punya regu_id)
CREATE TABLE IF NOT EXISTS laporan_pramuka (
    id SERIAL PRIMARY KEY, 
    regu_id INTEGER REFERENCES kelas_pramuka(id) ON DELETE CASCADE,
    deskripsi TEXT, 
    file_url TEXT
);
CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, nama_perusahaan VARCHAR(150), alamat TEXT);
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, minggu_ke INTEGER, deskripsi TEXT);

-- 5. Tabel Nilai PKL (Guru Vokasi menginput nilai praktik kerja lapangan)
CREATE TABLE IF NOT EXISTS nilai_pkl (
    id             SERIAL PRIMARY KEY,
    siswa_id       INTEGER NOT NULL,
    kelas_id       INTEGER,
    nilai_praktik  NUMERIC(5,2) DEFAULT 0,
    nilai_sikap    NUMERIC(5,2) DEFAULT 0,
    nilai_laporan  NUMERIC(5,2) DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_nilai_pkl UNIQUE (siswa_id, kelas_id)
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vocational_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vocational_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vocational_user;