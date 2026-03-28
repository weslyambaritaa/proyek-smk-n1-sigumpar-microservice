-- 1. Pembuatan Tabel-Tabel
CREATE TABLE IF NOT EXISTS kelas (
    id SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10),
    wali_kelas_id UUID  -- TAMBAHKAN BARIS INI
);

CREATE TABLE IF NOT EXISTS siswa (
    id_siswa UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelas UUID NOT NULL,
    namaSiswa VARCHAR(255) NOT NULL,
    NIS VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel absensi
CREATE TABLE IF NOT EXISTS absensi (
    id_absensi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_siswa UUID NOT NULL REFERENCES siswa(id_siswa) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa', 'terlambat')),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (id_siswa, tanggal)  -- Satu siswa hanya satu absensi per hari
);

-- Indeks untuk mempercepat pencarian berdasarkan id_siswa dan tanggal
CREATE INDEX idx_absensi_id_siswa ON absensi(id_siswa);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);

-- Data dummy siswa
INSERT INTO siswa (id_siswa, id_kelas, namaSiswa, NIS) VALUES
    ('11111111-1111-1111-1111-111111111111', 'kelas-1', 'Budi Santoso', '12345'),
    ('22222222-2222-2222-2222-222222222222', 'kelas-1', 'Siti Rahayu', '12346'),
    ('33333333-3333-3333-3333-333333333333', 'kelas-2', 'Ahmad Wijaya', '12347'),
    ('44444444-4444-4444-4444-444444444444', 'kelas-2', 'Dewi Lestari', '12348'),
    ('55555555-5555-5555-5555-555555555555', 'kelas-3', 'Eko Prasetyo', '12349')
ON CONFLICT (NIS) DO NOTHING;

-- Data dummy absensi_siswa
INSERT INTO absensi_siswa (id_siswa, tanggal, status, keterangan) VALUES
    ('11111111-1111-1111-1111-111111111111', '2025-03-28', 'hadir', 'Tepat waktu'),
    ('11111111-1111-1111-1111-111111111111', '2025-03-27', 'hadir', 'Tepat waktu'),
    ('22222222-2222-2222-2222-222222222222', '2025-03-28', 'izin', 'Sakit'),
    ('22222222-2222-2222-2222-222222222222', '2025-03-27', 'sakit', 'Demam'),
    ('33333333-3333-3333-3333-333333333333', '2025-03-28', 'alpa', 'Tidak hadir tanpa kabar'),
    ('44444444-4444-4444-4444-444444444444', '2025-03-28', 'terlambat', 'Datang jam 08:15'),
    ('55555555-5555-5555-5555-555555555555', '2025-03-28', 'hadir', 'Tepat waktu')
ON CONFLICT (id_siswa, tanggal) DO NOTHING;

CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id SERIAL PRIMARY KEY,
    nama_mapel VARCHAR(20) UNIQUE NOT NULL,
    kelas_id INTEGER REFERENCES kelas(id),
    guru_mapel_id UUID
);

CREATE TABLE IF NOT EXISTS pengumuman (id SERIAL PRIMARY KEY, judul VARCHAR(255), isi TEXT);
CREATE TABLE IF NOT EXISTS arsip_surat (id SERIAL PRIMARY KEY, nomor_surat VARCHAR(100), file_url TEXT);
CREATE TABLE IF NOT EXISTS jadwal_mengajar (
    id SERIAL PRIMARY KEY, 
    guru_id UUID, 
    kelas_id INTEGER, 
    mata_pelajaran VARCHAR(100),
    hari VARCHAR(20),
    waktu_mulai TIME,
    waktu_berakhir TIME
);
CREATE TABLE IF NOT EXISTS jadwal_piket (id SERIAL PRIMARY KEY, hari VARCHAR(20), guru_id UUID);
CREATE TABLE IF NOT EXISTS jadwal_upacara (id SERIAL PRIMARY KEY, tanggal DATE, petugas TEXT);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;