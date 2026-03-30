-- 1. Pembuatan Tabel-Tabel

-- Tabel kelas (primary key UUID)
CREATE TABLE IF NOT EXISTS kelas (
    id SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10),
    wali_kelas_id UUID  -- TAMBAHKAN BARIS INI
);

-- Tabel siswa (foreign key ke kelas.id)
CREATE TABLE IF NOT EXISTS siswa (
    id_siswa UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelas INTEGER NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,  -- ubah tipe jadi INTEGER
    namaSiswa VARCHAR(255) NOT NULL,
    NIS VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel mata pelajaran (foreign key ke kelas.id, dan guru_mapel_id UUID)
CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id SERIAL PRIMARY KEY,
    nama_mapel VARCHAR(20) UNIQUE NOT NULL,
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE SET NULL,
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
    kelas_id INTEGER REFERENCES kelas(id) ON DELETE CASCADE,
    mata_pelajaran VARCHAR(100),
    hari VARCHAR(20),
    waktu_mulai TIME,
    waktu_berakhir TIME
);

CREATE TABLE IF NOT EXISTS jadwal_piket (id SERIAL PRIMARY KEY, tanggal DATE, guru_id UUID);
CREATE TABLE IF NOT EXISTS jadwal_upacara (id SERIAL PRIMARY KEY, tanggal DATE, petugas TEXT);


-- Grant privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO academic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO academic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO academic_user;