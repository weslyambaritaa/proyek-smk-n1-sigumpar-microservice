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
