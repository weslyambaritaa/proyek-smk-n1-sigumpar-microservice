const pool = require('../config/db');

exports.getAllPiket = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jadwal_piket ORDER BY tanggal DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPiket = async (req, res) => {
    const { tanggal, guru_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO jadwal_piket (tanggal, guru_id) VALUES ($1, $2) RETURNING *',
            [tanggal, guru_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePiket = async (req, res) => {
    const { id } = req.params;
    const { tanggal, guru_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE jadwal_piket SET tanggal = $1, guru_id = $2 WHERE id = $3 RETURNING *',
            [tanggal, guru_id || null, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Jadwal piket tidak ditemukan" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePiket = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM jadwal_piket WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Jadwal piket tidak ditemukan" });
        }

        res.json({ success: true, message: "Jadwal piket berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};