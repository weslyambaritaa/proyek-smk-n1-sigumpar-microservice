-- ============================================================
-- MIGRATION: Sistem Review Perangkat oleh Kepala Sekolah
-- Jalankan di database learning-service (learning_db)
-- ============================================================

-- 1. Tambah kolom status & catatan revisi ke tabel perangkat_pembelajaran
ALTER TABLE perangkat_pembelajaran
  ADD COLUMN IF NOT EXISTS status_review   VARCHAR(20) DEFAULT 'menunggu'
    CHECK (status_review IN ('menunggu', 'disetujui', 'revisi', 'ditolak')),
  ADD COLUMN IF NOT EXISTS catatan_review  TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by     TEXT,         -- nama/id kepsek
  ADD COLUMN IF NOT EXISTS reviewed_at     TIMESTAMP,
  ADD COLUMN IF NOT EXISTS nama_guru       TEXT,         -- cache nama guru agar mudah ditampilkan
  ADD COLUMN IF NOT EXISTS versi           INTEGER DEFAULT 1;  -- versi upload (1=pertama, 2=revisi, dst)

-- 2. Tambah kolom parent_id untuk melacak rantai revisi
--    (dokumen revisi menyimpan id dokumen asli)
ALTER TABLE perangkat_pembelajaran
  ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES perangkat_pembelajaran(id) ON DELETE SET NULL;

-- 3. Buat index untuk performa query
CREATE INDEX IF NOT EXISTS idx_perangkat_status ON perangkat_pembelajaran(status_review);
CREATE INDEX IF NOT EXISTS idx_perangkat_guru   ON perangkat_pembelajaran(guru_id);
CREATE INDEX IF NOT EXISTS idx_perangkat_parent ON perangkat_pembelajaran(parent_id);

-- 4. Upgrade tabel review_kepsek (sudah ada, tambah kolom baru)
ALTER TABLE review_kepsek
  ADD COLUMN IF NOT EXISTS status      VARCHAR(20) DEFAULT 'revisi'
    CHECK (status IN ('disetujui', 'revisi', 'ditolak')),
  ADD COLUMN IF NOT EXISTS kepsek_id   TEXT,
  ADD COLUMN IF NOT EXISTS kepsek_nama TEXT,
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP DEFAULT NOW();

-- 5. Set dokumen lama sebagai 'menunggu' jika belum punya status
UPDATE perangkat_pembelajaran
SET status_review = 'menunggu'
WHERE status_review IS NULL;