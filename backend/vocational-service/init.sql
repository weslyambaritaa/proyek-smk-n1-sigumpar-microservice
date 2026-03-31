CREATE TABLE IF NOT EXISTS pkl_penempatan (
    id                    SERIAL PRIMARY KEY,
    nama_siswa            VARCHAR(100),
    nama_perusahaan       VARCHAR(100),
    alamat_singkat        VARCHAR(255),
    tanggal               DATE,
    judul_penempatan      VARCHAR(100),
    deskripsi_pekerjaan   TEXT,
    pembimbing_industri   VARCHAR(100),
    kontak_pembimbing     VARCHAR(50),
    foto_lokasi           VARCHAR(255),
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pkl_submissions (
    id                  SERIAL PRIMARY KEY,
    siswa_id            INTEGER NOT NULL,
    nama_perusahaan     VARCHAR(255),
    alamat              TEXT,
    status_validasi     VARCHAR(50) DEFAULT 'pending',
    status_persetujuan  VARCHAR(50) DEFAULT 'pending',
    keterangan_layak    TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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
