-- 1. Pembuatan Tabel-Tabel

-- Tabel kelas (primary key UUID)
CREATE TABLE IF NOT EXISTS kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10),
    wali_kelas_id UUID
);

-- Tabel siswa (foreign key ke kelas.id)
CREATE TABLE IF NOT EXISTS siswa (
    id_siswa UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelas UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    namaSiswa VARCHAR(255) NOT NULL,
    NIS VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel mata pelajaran (foreign key ke kelas.id, dan guru_mapel_id UUID)
CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id SERIAL PRIMARY KEY,
    nama_mapel VARCHAR(20) UNIQUE NOT NULL,
    kelas_id UUID REFERENCES kelas(id) ON DELETE SET NULL,
    guru_mapel_id UUID
);

-- Tabel absensi siswa (menambahkan mata_pelajaran_id untuk membedakan absensi per mapel)
CREATE TABLE IF NOT EXISTS absensi_siswa (
    id_absensi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_siswa UUID NOT NULL REFERENCES siswa(id_siswa) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    mata_pelajaran_id INTEGER REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa', 'terlambat')),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (id_siswa, tanggal, mata_pelajaran_id)  -- Satu siswa, satu mapel, satu hari hanya satu absensi
);

-- Indeks
CREATE INDEX IF NOT EXISTS idx_absensi_id_siswa ON absensi_siswa(id_siswa);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON absensi_siswa(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_mata_pelajaran ON absensi_siswa(mata_pelajaran_id);

-- Tabel lainnya tetap
CREATE TABLE IF NOT EXISTS pengumuman (id SERIAL PRIMARY KEY, judul VARCHAR(255), isi TEXT);
CREATE TABLE IF NOT EXISTS arsip_surat (id SERIAL PRIMARY KEY, nomor_surat VARCHAR(100), file_url TEXT);
CREATE TABLE IF NOT EXISTS jadwal_mengajar (
    id SERIAL PRIMARY KEY, 
    guru_id UUID, 
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    mata_pelajaran VARCHAR(100),
    hari VARCHAR(20),
    waktu_mulai TIME,
    waktu_berakhir TIME
);
CREATE TABLE IF NOT EXISTS jadwal_piket (id SERIAL PRIMARY KEY, tanggal DATE, guru_id UUID);
CREATE TABLE IF NOT EXISTS jadwal_upacara (id SERIAL PRIMARY KEY, tanggal DATE, petugas TEXT);

-- Data dummy siswa (dengan id_kelas UUID yang valid)
-- Pertama, kita harus punya data kelas agar id_kelas bisa di-refer.
INSERT INTO kelas (id, nama_kelas, tingkat) VALUES
    ('11111111-1111-1111-1111-111111111001', 'Kelas 1A', '1'),
    ('22222222-2222-2222-2222-222222222002', 'Kelas 2B', '2')
ON CONFLICT (id) DO NOTHING;

-- Kemudian insert siswa dengan id_kelas yang sudah ada
INSERT INTO siswa (id_siswa, id_kelas, namaSiswa, NIS) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111001', 'Budi Santoso', '12345'),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111001', 'Siti Rahayu', '12346'),
    ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222002', 'Ahmad Wijaya', '12347')
ON CONFLICT (NIS) DO NOTHING;

-- Data dummy mata pelajaran (contoh)
INSERT INTO mata_pelajaran (nama_mapel, kelas_id, guru_mapel_id) VALUES
    ('Matematika', '11111111-1111-1111-1111-111111111001', 'guru-uuid-1'),
    ('Bahasa Indonesia', '11111111-1111-1111-1111-111111111001', 'guru-uuid-2'),
    ('IPA', '22222222-2222-2222-2222-222222222002', 'guru-uuid-1')
ON CONFLICT (nama_mapel) DO NOTHING;

-- Data dummy jadwal mengajar (opsional)
INSERT INTO jadwal_mengajar (guru_id, kelas_id, mata_pelajaran, hari, waktu_mulai, waktu_berakhir) VALUES
    ('guru-uuid-1', '11111111-1111-1111-1111-111111111001', 'Matematika', 'Senin', '07:30', '09:00'),
    ('guru-uuid-2', '11111111-1111-1111-1111-111111111001', 'Bahasa Indonesia', 'Selasa', '09:15', '10:45')
ON CONFLICT DO NOTHING;

-- Grant privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;