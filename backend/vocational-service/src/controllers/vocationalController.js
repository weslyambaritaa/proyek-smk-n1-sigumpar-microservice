const pool = require('../config/db');

// Get All Laporan PKL
exports.getAllLaporanPKL = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM laporan_lokasi_pkl ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Create Laporan PKL
exports.createLaporanPKL = async (req, res, next) => {
    const { siswa_id, nama_perusahaan, alamat } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO laporan_lokasi_pkl (siswa_id, nama_perusahaan, alamat) VALUES ($1, $2, $3) RETURNING *',
            [siswa_id, nama_perusahaan, alamat]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Update Laporan PKL
exports.updateLaporanPKL = async (req, res, next) => {
    const { id } = req.params;
    const { siswa_id, nama_perusahaan, alamat } = req.body;
    try {
        const result = await pool.query(
            'UPDATE laporan_lokasi_pkl SET siswa_id = $1, nama_perusahaan = $2, alamat = $3 WHERE id = $4 RETURNING *',
            [siswa_id, nama_perusahaan, alamat, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Delete Laporan PKL
exports.deleteLaporanPKL = async (req, res, next) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM laporan_lokasi_pkl WHERE id = $1', [id]);
        res.json({ message: 'Laporan berhasil dihapus' });
    } catch (error) {
        next(error);
    }
};