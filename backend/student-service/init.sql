CREATE TABLE IF NOT EXISTS rekap_absensi_siswa (
    id_rekap SERIAL PRIMARY KEY,
    id_siswa UUID NOT NULL,
    nama_siswa VARCHAR(255),
    nis VARCHAR(255),
    id_kelas INTEGER,
    nama_kelas VARCHAR(50),
    tanggal_awal DATE NOT NULL,
    tanggal_akhir DATE NOT NULL,
    hadir INTEGER DEFAULT 0,
    sakit INTEGER DEFAULT 0,
    izin INTEGER DEFAULT 0,
    alpa INTEGER DEFAULT 0,
    terlambat INTEGER DEFAULT 0,
    total_hari INTEGER DEFAULT 0,
    persentase_kehadiran DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (id_siswa, tanggal_awal, tanggal_akhir)
);

CREATE INDEX IF NOT EXISTS idx_rekap_periode ON rekap_absensi_siswa(tanggal_awal, tanggal_akhir);
CREATE INDEX IF NOT EXISTS idx_rekap_kelas ON rekap_absensi_siswa(id_kelas);

CREATE TABLE IF NOT EXISTS kebersihan_kelas (id SERIAL PRIMARY KEY, kelas_id INTEGER, tanggal DATE, skor INTEGER);
CREATE TABLE IF NOT EXISTS parenting (id SERIAL PRIMARY KEY, siswa_id INTEGER, catatan TEXT);
CREATE TABLE IF NOT EXISTS refleksi (id SERIAL PRIMARY KEY, siswa_id INTEGER, deskripsi TEXT);
CREATE TABLE IF NOT EXISTS surat_panggilan (id SERIAL PRIMARY KEY, siswa_id INTEGER, tanggal DATE, alasan TEXT);