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
CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER,
    nama_perusahaan VARCHAR(150),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, minggu_ke INTEGER, deskripsi TEXT);