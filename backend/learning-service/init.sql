-- Hapus tabel jika sudah ada (hati-hati di production)
DROP TABLE IF EXISTS t_absensi_guru CASCADE;

CREATE TABLE t_absensi_guru (
    id_absensiGuru UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    namaGuru VARCHAR(255) NOT NULL,
    mataPelajaran VARCHAR(255) NOT NULL,
    jamMasuk TIMESTAMP WITH TIME ZONE NOT NULL,
    tanggal DATE NOT NULL,                         -- kolom tanggal untuk unique constraint
    foto TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'terlambat')),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, tanggal)                     -- sekarang valid
);

-- Indeks untuk performa
CREATE INDEX idx_absensi_guru_user_id ON t_absensi_guru(user_id);
CREATE INDEX idx_absensi_guru_tanggal ON t_absensi_guru(tanggal);

CREATE TABLE IF NOT EXISTS absensi_guru (id SERIAL PRIMARY KEY, guru_id UUID, tanggal DATE, status VARCHAR(20));
CREATE TABLE IF NOT EXISTS catatan_mengajar (id SERIAL PRIMARY KEY, guru_id UUID, kelas_id INTEGER, materi TEXT);
CREATE TABLE IF NOT EXISTS evaluasi_guru (id SERIAL PRIMARY KEY, guru_id UUID, nilai INTEGER, catatan TEXT);
CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (id SERIAL PRIMARY KEY, guru_id UUID, nama_perangkat VARCHAR(150), file_url TEXT);
CREATE TABLE IF NOT EXISTS review_kepsek (id SERIAL PRIMARY KEY, perangkat_id INTEGER, komentar TEXT);
CREATE TABLE IF NOT EXISTS review_wakasek (id SERIAL PRIMARY KEY, perangkat_id INTEGER, komentar TEXT);