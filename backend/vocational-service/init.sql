-- ============================================================
-- VOCATIONAL SERVICE - Database Schema
-- SMK Negeri 1 Sigumpar
-- ============================================================

-- Tabel Program Keahlian
CREATE TABLE IF NOT EXISTS program_keahlian (
    id SERIAL PRIMARY KEY,
    kode_program VARCHAR(20) UNIQUE NOT NULL,
    nama_program VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel PKL Submissions (Pengajuan PKL Siswa)
CREATE TABLE IF NOT EXISTS pkl_submissions (
    id SERIAL PRIMARY KEY,
    siswa_id VARCHAR(100) NOT NULL,
    nama_siswa VARCHAR(150) NOT NULL,
    kelas VARCHAR(50),
    program_keahlian_id INT REFERENCES program_keahlian(id),
    nama_perusahaan VARCHAR(200) NOT NULL,
    alamat_perusahaan TEXT,
    kontak_perusahaan VARCHAR(100),
    bidang_pekerjaan VARCHAR(200),
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    status_kelayakan VARCHAR(20) DEFAULT 'belum_dinilai' CHECK (status_kelayakan IN ('layak', 'tidak_layak', 'belum_dinilai')),
    status_approval VARCHAR(20) DEFAULT 'pending' CHECK (status_approval IN ('pending', 'disetujui', 'ditolak')),
    progres_terakhir INT DEFAULT 0 CHECK (progres_terakhir BETWEEN 0 AND 100),
    nilai_akhir DECIMAL(5,2),
    predikat VARCHAR(2),
    keterangan_nilai TEXT,
    catatan_guru TEXT,
    guru_pembimbing_id VARCHAR(100),
    nama_guru VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Monitoring Kunjungan PKL
CREATE TABLE IF NOT EXISTS pkl_monitoring (
    id SERIAL PRIMARY KEY,
    pkl_id INT NOT NULL REFERENCES pkl_submissions(id) ON DELETE CASCADE,
    tanggal_kunjungan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    catatan TEXT NOT NULL,
    progres_saat_kunjungan INT DEFAULT 0 CHECK (progres_saat_kunjungan BETWEEN 0 AND 100),
    petugas_id VARCHAR(100),
    nama_petugas VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Proyek Vokasi
CREATE TABLE IF NOT EXISTS proyek_vokasi (
    id SERIAL PRIMARY KEY,
    judul_proyek VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    program_keahlian_id INT REFERENCES program_keahlian(id),
    tahun_ajaran VARCHAR(20),
    semester VARCHAR(10) CHECK (semester IN ('ganjil', 'genap')),
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'dibatalkan')),
    guru_pembimbing_id VARCHAR(100),
    nama_guru VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Anggota Proyek (siswa yang terlibat dalam proyek)
CREATE TABLE IF NOT EXISTS proyek_anggota (
    id SERIAL PRIMARY KEY,
    proyek_id INT NOT NULL REFERENCES proyek_vokasi(id) ON DELETE CASCADE,
    siswa_id VARCHAR(100) NOT NULL,
    nama_siswa VARCHAR(150) NOT NULL,
    peran VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Nilai Kompetensi
CREATE TABLE IF NOT EXISTS nilai_kompetensi (
    id SERIAL PRIMARY KEY,
    siswa_id VARCHAR(100) NOT NULL,
    nama_siswa VARCHAR(150) NOT NULL,
    program_keahlian_id INT REFERENCES program_keahlian(id),
    kelas VARCHAR(50),
    tahun_ajaran VARCHAR(20),
    semester VARCHAR(10),
    aspek_teori DECIMAL(5,2) DEFAULT 0,
    aspek_praktik DECIMAL(5,2) DEFAULT 0,
    aspek_sikap DECIMAL(5,2) DEFAULT 0,
    nilai_akhir DECIMAL(5,2) GENERATED ALWAYS AS (
        (aspek_teori * 0.3 + aspek_praktik * 0.5 + aspek_sikap * 0.2)
    ) STORED,
    predikat VARCHAR(2),
    catatan TEXT,
    guru_id VARCHAR(100),
    nama_guru VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Program Keahlian SMK
INSERT INTO program_keahlian (kode_program, nama_program, deskripsi) VALUES
('TKJ', 'Teknik Komputer dan Jaringan', 'Program keahlian di bidang komputer dan jaringan'),
('RPL', 'Rekayasa Perangkat Lunak', 'Program keahlian pengembangan perangkat lunak'),
('TKR', 'Teknik Kendaraan Ringan', 'Program keahlian otomotif kendaraan ringan'),
('ATPH', 'Agribisnis Tanaman Pangan dan Hortikultura', 'Program keahlian pertanian'),
('AKL', 'Akuntansi dan Keuangan Lembaga', 'Program keahlian akuntansi')
ON CONFLICT (kode_program) DO NOTHING;

-- Seed Data PKL Submissions untuk demo
INSERT INTO pkl_submissions (siswa_id, nama_siswa, kelas, program_keahlian_id, nama_perusahaan, alamat_perusahaan, bidang_pekerjaan, tanggal_mulai, tanggal_selesai, status_kelayakan, status_approval, progres_terakhir, nilai_akhir, predikat, nama_guru) VALUES
('SIS001', 'Budi Santoso', 'XII TKJ 1', 1, 'CV. Maju Jaya Tech', 'Jl. Sudirman No. 10, Balige', 'Teknisi Jaringan', '2024-07-01', '2024-09-30', 'layak', 'disetujui', 85, 88.50, 'B', 'Pak Hendra'),
('SIS002', 'Siti Rahayu', 'XII RPL 1', 2, 'PT. Digital Solusi', 'Jl. Imam Bonjol No. 5, Medan', 'Web Developer', '2024-07-01', '2024-09-30', 'layak', 'disetujui', 90, 92.00, 'A', 'Bu Dewi'),
('SIS003', 'Ahmad Fauzi', 'XII TKR 1', 3, 'Bengkel Honda Bersama', 'Jl. Sisingamangaraja No. 25', 'Mekanik Otomotif', '2024-07-01', '2024-09-30', 'belum_dinilai', 'pending', 60, NULL, NULL, 'Pak Yudi'),
('SIS004', 'Rina Hastuti', 'XII AKL 1', 5, 'KSP Sejahtera Bersama', 'Jl. Raja Inal No. 3, Sigumpar', 'Staff Keuangan', '2024-07-01', '2024-09-30', 'layak', 'disetujui', 75, 80.00, 'B', 'Bu Sri'),
('SIS005', 'Doni Pratama', 'XII TKJ 2', 1, 'Warnet Cepat Net', 'Jl. Pelajar No. 8, Balige', 'Teknisi Komputer', '2024-07-01', '2024-09-30', 'tidak_layak', 'ditolak', 20, NULL, NULL, 'Pak Hendra')
ON CONFLICT DO NOTHING;

-- Seed Data Proyek Vokasi
INSERT INTO proyek_vokasi (judul_proyek, deskripsi, program_keahlian_id, tahun_ajaran, semester, status, nama_guru) VALUES
('Sistem Informasi Sekolah', 'Membangun sistem informasi manajemen sekolah berbasis web', 2, '2024/2025', 'ganjil', 'aktif', 'Bu Dewi'),
('Jaringan LAN Laboratorium', 'Instalasi dan konfigurasi jaringan komputer laboratorium', 1, '2024/2025', 'ganjil', 'selesai', 'Pak Hendra'),
('Mesin Pengering Hasil Tani', 'Membuat alat pengering produk pertanian otomatis', 4, '2024/2025', 'genap', 'aktif', 'Pak Barus')
ON CONFLICT DO NOTHING;
