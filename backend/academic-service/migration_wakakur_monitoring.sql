-- ============================================================
-- Migration: Wakil Kepala Sekolah — Monitoring Access
-- Service: academic-service database
-- Run AFTER migration_wakil_kepsek.sql
-- ============================================================

-- Pastikan kolom foto_url tersedia di tabel parenting_log
-- (umumnya sudah ada dari wali kelas, ini hanya safeguard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='parenting_log' AND column_name='foto_url'
  ) THEN
    ALTER TABLE parenting_log ADD COLUMN foto_url TEXT;
  END IF;
END$$;

-- View untuk monitoring absensi guru oleh Wakakur
-- (read-only, bergabung dengan tabel guru di learning-service — akses via API)

-- View jadwal mengajar dengan nama kelas
CREATE OR REPLACE VIEW wakil_view_jadwal AS
SELECT
    j.id,
    j.guru_id,
    j.kelas_id,
    j.mata_pelajaran,
    j.hari,
    j.waktu_mulai,
    j.waktu_berakhir,
    k.nama_kelas
FROM jadwal_mengajar j
LEFT JOIN kelas k ON j.kelas_id = k.id
ORDER BY
    CASE j.hari
        WHEN 'Senin'   THEN 1
        WHEN 'Selasa'  THEN 2
        WHEN 'Rabu'    THEN 3
        WHEN 'Kamis'   THEN 4
        WHEN 'Jumat'   THEN 5
        WHEN 'Sabtu'   THEN 6
        ELSE 7
    END, j.waktu_mulai;

-- Grant view ke academic_user
GRANT SELECT ON wakil_view_jadwal TO academic_user;

-- View rekap parenting per kelas (untuk monitoring Wakakur)
CREATE OR REPLACE VIEW wakil_view_parenting AS
SELECT
    p.*,
    k.nama_kelas
FROM parenting_log p
LEFT JOIN kelas k ON p.kelas_id = k.id
ORDER BY p.tanggal DESC, p.id DESC;

GRANT SELECT ON wakil_view_parenting TO academic_user;