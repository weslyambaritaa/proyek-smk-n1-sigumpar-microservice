-- Seed data for academic-service DB
-- Jalankan: docker-compose exec academic-service psql -U academic_user -h postgres_host -d academic_db -f seed_academic_data.sql
-- Tapi karena tidak ada postgres container, jalankan dari host atau fix DB connection.

-- 1. Insert Kelas
INSERT INTO kelas (nama_kelas, tingkat) VALUES 
('X TKJ 1', '10'),
('X TKJ 2', '10'),
('XI TKJ 1', '11'),
('XII TKJ 1', '12')
ON CONFLICT DO NOTHING;

-- 2. Insert Mata Pelajaran
INSERT INTO mata_pelajaran (nama_mapel) VALUES 
('Matematika'),
('Bahasa Indonesia'),
('Pemrograman Web'),
('Basis Data')
ON CONFLICT DO NOTHING;

-- 3. Insert Siswa (with kelas_id)
INSERT INTO siswa (id_siswa, id_kelas, namaSiswa, NIS) VALUES 
(gen_random_uuid(), 1, 'Ahmad Santoso', '12345678'),
(gen_random_uuid(), 1, 'Budi Hartono', '12345679'),
(gen_random_uuid(), 1, 'Citra Dewi', '12345680'),
(gen_random_uuid(), 2, 'Dedi Suparman', '12345681'),
(gen_random_uuid(), 3, 'Eka Putri', '12345682')
ON CONFLICT (NIS) DO NOTHING;

-- Verify
SELECT 'Kelas' as table_name, COUNT(*) as count FROM kelas
UNION ALL
SELECT 'Siswa', COUNT(*) FROM siswa
UNION ALL
SELECT 'Mapel', COUNT(*) FROM mata_pelajaran;

