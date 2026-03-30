CREATE TABLE IF NOT EXISTS pkl_submissions (
    id                  SERIAL PRIMARY KEY,
    siswa_id            INTEGER NOT NULL,
    nama_perusahaan     VARCHAR(255),
    alamat              TEXT,
    status_validasi     VARCHAR(50) DEFAULT 'pending',
    status_persetujuan  VARCHAR(50) DEFAULT 'pending',
    keterangan_layak    TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
