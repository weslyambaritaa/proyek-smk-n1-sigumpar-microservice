CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, nama_perusahaan VARCHAR(150), alamat TEXT);
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, minggu_ke INTEGER, deskripsi TEXT);
CREATE TABLE IF NOT EXISTS penilaian_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, aspek_penilaian VARCHAR(100), nilai INTEGER);