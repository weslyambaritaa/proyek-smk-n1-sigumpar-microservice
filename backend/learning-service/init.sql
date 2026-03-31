CREATE TABLE IF NOT EXISTS absensi_guru (id SERIAL PRIMARY KEY, guru_id UUID, tanggal DATE, status VARCHAR(20)); //sudah be
CREATE TABLE IF NOT EXISTS catatan_mengajar (id SERIAL PRIMARY KEY, guru_id UUID, kelas_id INTEGER, materi TEXT);
CREATE TABLE IF NOT EXISTS evaluasi_guru (id SERIAL PRIMARY KEY, guru_id UUID, nilai INTEGER, catatan TEXT);
CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (id SERIAL PRIMARY KEY, guru_id UUID, nama_perangkat VARCHAR(150), file_url TEXT); //sudah be
CREATE TABLE IF NOT EXISTS review_kepsek (id SERIAL PRIMARY KEY, perangkat_id INTEGER, komentar TEXT);
CREATE TABLE IF NOT EXISTS review_wakasek (id SERIAL PRIMARY KEY, perangkat_id INTEGER, komentar TEXT);