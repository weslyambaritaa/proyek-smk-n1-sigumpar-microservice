-- Fix: pastikan kolom camelCase pada tabel absensi_guru ada dengan nama yang benar
-- Jika tabel sudah dibuat tanpa quote, kolom akan lowercase (namaguru, dll).
-- Migration ini memastikan kolom dengan nama yang tepat tersedia.

DO $$
BEGIN
  -- Cek apakah kolom namaGuru sudah ada (case-sensitive)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'absensi_guru'
      AND column_name = 'namaGuru'
  ) THEN
    -- Cek apakah kolom namaguru (lowercase) ada, jika ya rename ke namaGuru
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'absensi_guru'
        AND column_name = 'namaguru'
    ) THEN
      ALTER TABLE absensi_guru RENAME COLUMN namaguru TO "namaGuru";
      RAISE NOTICE 'Kolom namaguru berhasil direname ke "namaGuru"';
    ELSE
      -- Tambahkan kolom baru jika belum ada sama sekali
      ALTER TABLE absensi_guru ADD COLUMN "namaGuru" VARCHAR(255) NOT NULL DEFAULT '';
      RAISE NOTICE 'Kolom "namaGuru" berhasil ditambahkan';
    END IF;
  ELSE
    RAISE NOTICE 'Kolom "namaGuru" sudah ada, tidak ada perubahan';
  END IF;

  -- Hal sama untuk mataPelajaran
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'absensi_guru'
      AND column_name = 'mataPelajaran'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'absensi_guru'
        AND column_name = 'matapelajaran'
    ) THEN
      ALTER TABLE absensi_guru RENAME COLUMN matapelajaran TO "mataPelajaran";
      RAISE NOTICE 'Kolom matapelajaran berhasil direname ke "mataPelajaran"';
    ELSE
      ALTER TABLE absensi_guru ADD COLUMN "mataPelajaran" VARCHAR(255) NOT NULL DEFAULT '-';
      RAISE NOTICE 'Kolom "mataPelajaran" berhasil ditambahkan';
    END IF;
  END IF;

  -- Hal sama untuk jamMasuk
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'absensi_guru'
      AND column_name = 'jamMasuk'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'absensi_guru'
        AND column_name = 'jammasuk'
    ) THEN
      ALTER TABLE absensi_guru RENAME COLUMN jammasuk TO "jamMasuk";
      RAISE NOTICE 'Kolom jammasuk berhasil direname ke "jamMasuk"';
    ELSE
      ALTER TABLE absensi_guru ADD COLUMN "jamMasuk" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
      RAISE NOTICE 'Kolom "jamMasuk" berhasil ditambahkan';
    END IF;
  END IF;
END $$;
