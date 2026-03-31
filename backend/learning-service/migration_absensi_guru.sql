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
