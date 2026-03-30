ALTER TABLE pkl_submissions 
ADD COLUMN status_kelayakan ENUM('layak', 'tidak_layak'),
ADD COLUMN status_approval ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
ADD COLUMN progres_terakhir INT DEFAULT 0,
ADD COLUMN nilai_akhir DECIMAL(5,2),
ADD COLUMN predikat VARCHAR(2),
ADD COLUMN keterangan_nilai TEXT,
ADD COLUMN catatan_guru TEXT;

CREATE TABLE pkl_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pkl_id INT,
    tanggal_kunjungan DATETIME,
    catatan TEXT,
    FOREIGN KEY (pkl_id) REFERENCES pkl_submissions(id)
);