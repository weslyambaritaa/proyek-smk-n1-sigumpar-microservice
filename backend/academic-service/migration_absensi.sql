CREATE TABLE IF NOT EXISTS absensi_siswa (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    mapel_id INTEGER REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa', 'terlambat')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_absensi_siswa UNIQUE (siswa_id, tanggal, mapel_id)
);

CREATE INDEX IF NOT EXISTS idx_absensi_siswa_siswa_id ON absensi_siswa(siswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa_tanggal ON absensi_siswa(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa_mapel_id ON absensi_siswa(mapel_id);
