const pool = require('../config/db');

exports.getAllUpacara = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jadwal_upacara ORDER BY tanggal DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUpacara = async (req, res) => {
    const { tanggal, petugas } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO jadwal_upacara (tanggal, petugas) VALUES ($1, $2) RETURNING *',
            [tanggal, petugas]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUpacara = async (req, res) => {
    const { id } = req.params;
    const { tanggal, petugas } = req.body;
    try {
        const result = await pool.query(
            'UPDATE jadwal_upacara SET tanggal = $1, petugas = $2 WHERE id = $3 RETURNING *',
            [tanggal, petugas, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Jadwal upacara tidak ditemukan" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUpacara = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM jadwal_upacara WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Jadwal upacara tidak ditemukan" });
        }

        res.json({ success: true, message: "Jadwal upacara berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};