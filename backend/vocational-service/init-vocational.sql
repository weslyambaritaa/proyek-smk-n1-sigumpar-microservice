CREATE TABLE IF NOT EXISTS kelas_pramuka (id SERIAL PRIMARY KEY, nama_regu VARCHAR(100));
CREATE TABLE IF NOT EXISTS absensi_pramuka (id SERIAL PRIMARY KEY, siswa_id INTEGER, tanggal DATE, status VARCHAR(20));
CREATE TABLE IF NOT EXISTS laporan_pramuka (id SERIAL PRIMARY KEY, deskripsi TEXT, file_url TEXT);
CREATE TABLE IF NOT EXISTS laporan_lokasi_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, nama_perusahaan VARCHAR(150), alamat TEXT);
CREATE TABLE IF NOT EXISTS laporan_progres_pkl (id SERIAL PRIMARY KEY, siswa_id INTEGER, minggu_ke INTEGER, deskripsi TEXT);