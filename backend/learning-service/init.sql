CREATE TABLE IF NOT EXISTS absensi_guru (
  id_absensiGuru UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  namaGuru VARCHAR(255) NOT NULL,
  mataPelajaran VARCHAR(255) NOT NULL,
  jamMasuk TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  tanggal DATE NOT NULL,
  foto TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'terlambat', 'izin', 'sakit', 'alpa')),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_absensi_guru_user_id ON absensi_guru(user_id);
CREATE INDEX IF NOT EXISTS idx_absensi_guru_tanggal ON absensi_guru(tanggal);

CREATE TABLE IF NOT EXISTS catatan_mengajar (
  id SERIAL PRIMARY KEY,
  guru_id UUID,
  kelas_id INTEGER,
  materi TEXT
);

CREATE TABLE IF NOT EXISTS evaluasi_guru (
  id SERIAL PRIMARY KEY,
  guru_id UUID,
  nilai INTEGER,
  catatan TEXT
);

CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (
  id SERIAL PRIMARY KEY,
  guru_id UUID NOT NULL,
  nama_dokumen VARCHAR(200) NOT NULL,
  jenis_dokumen VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_data BYTEA,
  file_mime VARCHAR(100),
  tanggal_upload TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_kepsek (
  id SERIAL PRIMARY KEY,
  perangkat_id INTEGER,
  komentar TEXT
);

CREATE TABLE IF NOT EXISTS review_wakasek (
  id SERIAL PRIMARY KEY,
  perangkat_id INTEGER,
  komentar TEXT
);
