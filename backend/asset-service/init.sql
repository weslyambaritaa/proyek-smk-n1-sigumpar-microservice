CREATE TABLE IF NOT EXISTS informasi_pengajuan (id SERIAL PRIMARY KEY, deskripsi TEXT, status VARCHAR(50));
CREATE TABLE IF NOT EXISTS peminjaman_barang (id SERIAL PRIMARY KEY, user_id UUID, barang_id INTEGER, tanggal_pinjam DATE);
CREATE TABLE IF NOT EXISTS pengajuan_alat_barang (id SERIAL PRIMARY KEY, user_id UUID, nama_alat VARCHAR(100), jumlah INTEGER);
CREATE TABLE IF NOT EXISTS respon_peminjaman (id SERIAL PRIMARY KEY, peminjaman_id INTEGER, status VARCHAR(20));
CREATE TABLE IF NOT EXISTS respon_pengajuan_bendahara (id SERIAL PRIMARY KEY, pengajuan_id INTEGER, status VARCHAR(20));
CREATE TABLE IF NOT EXISTS respon_pengajuan_kepsek (id SERIAL PRIMARY KEY, pengajuan_id INTEGER, status VARCHAR(20));
CREATE TABLE IF NOT EXISTS inventory (id SERIAL PRIMARY KEY, nama_barang VARCHAR(255), kategori VARCHAR(100), jumlah INTEGER, kondisi VARCHAR(50), lokasi VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Sample data for inventory
INSERT INTO inventory (nama_barang, kategori, jumlah, kondisi, lokasi) VALUES
('Meja Guru', 'Furniture', 20, 'Baik', 'Ruang Kelas'),
('Kursi Siswa', 'Furniture', 200, 'Baik', 'Ruang Kelas'),
('Proyektor', 'Elektronik', 5, 'Baik', 'Ruang Multimedia'),
('Komputer', 'Elektronik', 30, 'Baik', 'Lab Komputer'),
('Buku Pelajaran', 'Buku', 500, 'Baik', 'Perpustakaan');