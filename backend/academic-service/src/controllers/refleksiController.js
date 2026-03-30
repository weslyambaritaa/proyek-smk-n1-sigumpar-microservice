const pool = require('../config/db');

// =============================================
// --- KONTROLLER REFLEKSI (WALI KELAS) ---
// =============================================
// Mencatat refleksi wali kelas berupa judul + isi evaluasi

// GET semua catatan refleksi
// Query param opsional: ?kelas_id=1
exports.getAllRefleksi = async (req, res) => {
    const { kelas_id } = req.query;
    try {
        let query = `SELECT * FROM refleksi_kelas`;
        const params = [];

        if (kelas_id) {
            query += ` WHERE kelas_id = $1`;
            params.push(kelas_id);
        }
        query += ` ORDER BY tanggal DESC`;

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET satu refleksi by ID
exports.getRefleksiById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM refleksi_kelas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan refleksi tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST buat refleksi baru
exports.createRefleksi = async (req, res) => {
    const {
        kelas_id,
        tanggal,
        judul_refleksi,
        isi_refleksi,
    } = req.body;

    if (!kelas_id || !tanggal || !judul_refleksi) {
        return res.status(400).json({ message: 'kelas_id, tanggal, dan judul_refleksi wajib diisi' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO refleksi_kelas
                (kelas_id, tanggal, judul_refleksi, isi_refleksi)
            VALUES ($1, $2, $3, $4) RETURNING *
        `, [kelas_id, tanggal, judul_refleksi, isi_refleksi || '']);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update refleksi
exports.updateRefleksi = async (req, res) => {
    const { id } = req.params;
    const { kelas_id, tanggal, judul_refleksi, isi_refleksi } = req.body;

    try {
        const result = await pool.query(`
            UPDATE refleksi_kelas
            SET kelas_id = $1, tanggal = $2, judul_refleksi = $3, isi_refleksi = $4
            WHERE id = $5 RETURNING *
        `, [kelas_id, tanggal, judul_refleksi, isi_refleksi || '', id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan refleksi tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE refleksi
exports.deleteRefleksi = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM refleksi_kelas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan refleksi tidak ditemukan' });
        }
        res.json({ success: true, message: 'Catatan refleksi berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};