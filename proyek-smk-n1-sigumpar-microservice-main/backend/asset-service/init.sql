CREATE TABLE IF NOT EXISTS input_sarpras (id SERIAL PRIMARY KEY, nama_barang VARCHAR(100), jumlah INTEGER, kondisi VARCHAR(50));
CREATE TABLE IF NOT EXISTS informasi_pengajuan (id SERIAL PRIMARY KEY, deskripsi TEXT, status VARCHAR(50));
CREATE TABLE IF NOT EXISTS peminjaman_barang (id SERIAL PRIMARY KEY, user_id UUID, barang_id INTEGER, tanggal_pinjam DATE);
CREATE TABLE IF NOT EXISTS pengajuan_alat_barang (id SERIAL PRIMARY KEY, user_id UUID, nama_alat VARCHAR(100), jumlah INTEGER);
CREATE TABLE IF NOT EXISTS respon_peminjaman (id SERIAL PRIMARY KEY, peminjaman_id INTEGER, status VARCHAR(20));
CREATE TABLE IF NOT EXISTS respon_pengajuan_bendahara (id SERIAL PRIMARY KEY, pengajuan_id INTEGER, status VARCHAR(20));
CREATE TABLE IF NOT EXISTS respon_pengajuan_kepsek (id SERIAL PRIMARY KEY, pengajuan_id INTEGER, status VARCHAR(20));