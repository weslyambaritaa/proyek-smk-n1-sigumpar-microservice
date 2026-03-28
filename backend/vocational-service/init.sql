CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, nama_perusahaan VARCHAR(150), alamat TEXT);
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, minggu_ke INTEGER, deskripsi TEXT);
-- Tambahkan ke file init.sql pada vocational-service
CREATE TABLE IF NOT EXISTS pkl_penilaian (
    id SERIAL PRIMARY KEY,
    submission_id INT UNIQUE NOT NULL, -- Merujuk ke pengajuan PKL tertentu
    disiplin INT DEFAULT 0,
    teknis INT DEFAULT 0,
    komunikasi INT DEFAULT 0,
    laporan INT DEFAULT 0,
    presentasi INT DEFAULT 0,
    nilai_akhir DECIMAL(5,2),
    grade VARCHAR(2),
    status_penilaian VARCHAR(20) DEFAULT 'Draft', -- Sesuai kolom 'Status' di mockup
    catatan_guru TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);