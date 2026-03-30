CREATE TABLE IF NOT EXISTS kebersihan_kelas (id SERIAL PRIMARY KEY, kelas_id INTEGER, tanggal DATE, skor INTEGER);
CREATE TABLE IF NOT EXISTS parenting (id SERIAL PRIMARY KEY, siswa_id INTEGER, catatan TEXT);
CREATE TABLE IF NOT EXISTS refleksi (id SERIAL PRIMARY KEY, siswa_id INTEGER, deskripsi TEXT);
CREATE TABLE IF NOT EXISTS surat_panggilan (id SERIAL PRIMARY KEY, siswa_id INTEGER, tanggal DATE, alasan TEXT);