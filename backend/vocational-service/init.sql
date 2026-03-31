CREATE TABLE IF NOT EXISTS pkl_penempatan (
    id                    SERIAL PRIMARY KEY,
    nama_siswa            VARCHAR(100),
    nama_perusahaan       VARCHAR(100),
    alamat_singkat        VARCHAR(255),
    tanggal               DATE,
    judul_penempatan      VARCHAR(100),
    deskripsi_pekerjaan   TEXT,
    pembimbing_industri   VARCHAR(100),
    kontak_pembimbing     VARCHAR(50),
    foto_lokasi           VARCHAR(255),
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
