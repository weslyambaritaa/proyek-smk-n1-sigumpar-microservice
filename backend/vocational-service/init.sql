-- =============================================
-- VOKASI SERVICE - Database Init
-- SMK N1 Sigumpar - PKL Vokasi
-- =============================================

CREATE TABLE IF NOT EXISTS pkl_lokasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_siswa VARCHAR(100) NOT NULL,
  siswa_id VARCHAR(100),
  nama_perusahaan VARCHAR(150) NOT NULL,
  alamat_singkat VARCHAR(200),
  tanggal DATE NOT NULL,
  judul_penempatan VARCHAR(200),
  deskripsi_pekerjaan TEXT,
  pembimbing_industri VARCHAR(100),
  kontak_pembimbing VARCHAR(50),
  foto_lokasi VARCHAR(255),
  guru_id VARCHAR(100),
  guru_nama VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pkl_progres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id VARCHAR(100) NOT NULL,
  nama_siswa VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  nilai_progres INTEGER CHECK (nilai_progres >= 0 AND nilai_progres <= 100),
  judul_pekerjaan VARCHAR(200),
  deskripsi_pekerjaan TEXT,
  foto_bukti VARCHAR(255),
  guru_id VARCHAR(100),
  guru_nama VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed data demo
INSERT INTO pkl_lokasi (
  nama_siswa, siswa_id, nama_perusahaan, alamat_singkat, tanggal,
  judul_penempatan, deskripsi_pekerjaan, pembimbing_industri,
  kontak_pembimbing, guru_id, guru_nama
) VALUES (
  'Budi Santoso', 'siswa-001', 'PT. Teknologi Maju', 'Medan',
  '2024-03-01', 'Junior Web Developer',
  'Membantu pengembangan modul frontend aplikasi internal perusahaan menggunakan React.',
  'Heru Darmawan', '0812-3456-7890', 'guru-demo', 'Ivana Pasaribu (Demo)'
) ON CONFLICT DO NOTHING;

INSERT INTO pkl_progres (
  siswa_id, nama_siswa, tanggal, nilai_progres, judul_pekerjaan,
  deskripsi_pekerjaan, guru_id, guru_nama
) VALUES (
  'siswa-001', 'Budi Santoso', '2024-03-01', 85, 'Instalasi Server',
  'Melakukan instalasi OS Linux Ubuntu Server di ruang NOC.',
  'guru-demo', 'Ivana Pasaribu (Demo)'
) ON CONFLICT DO NOTHING;
