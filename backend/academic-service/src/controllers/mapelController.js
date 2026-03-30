const pool = require('../config/db');

exports.getAllMapel = async (req, res) => {
    try {
        // Mengambil data mapel beserta nama kelasnya
        const result = await pool.query(`
            SELECT m.*, k.nama_kelas 
            FROM mata_pelajaran m 
            LEFT JOIN kelas k ON m.kelas_id = k.id 
            ORDER BY m.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMapel = async (req, res) => {
    const { nama_mapel, kelas_id, guru_mapel_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO mata_pelajaran (nama_mapel, kelas_id, guru_mapel_id) VALUES ($1, $2, $3) RETURNING *',
            [nama_mapel, kelas_id || null, guru_mapel_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMapel = async (req, res) => {
    const { id } = req.params;
    const { nama_mapel, kelas_id, guru_mapel_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE mata_pelajaran SET nama_mapel = $1, kelas_id = $2, guru_mapel_id = $3 WHERE id = $4 RETURNING *',
            [nama_mapel, kelas_id || null, guru_mapel_id || null, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Mata pelajaran tidak ditemukan" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMapel = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM mata_pelajaran WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Mata pelajaran tidak ditemukan" });
        }

        res.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};