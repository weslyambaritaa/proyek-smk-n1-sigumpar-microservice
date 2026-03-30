const pool = require('../config/db');

// ==========================================
// --- KONTROLLER PARENTING KELAS MASSAL ---
// ==========================================

exports.getAllParenting = async (req, res) => {
    const { kelas_id } = req.query;
    try {
        let query = `SELECT * FROM parenting`;
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

exports.getParentingById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM parenting WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan parenting tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createParenting = async (req, res) => {
    // ===== DEBUG LOG - HAPUS SETELAH MASALAH TERSELESAIKAN =====
    console.log('=== CREATE PARENTING DEBUG ===');
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    console.log('HEADERS content-type:', req.headers['content-type']);
    // ===========================================================

    const { kelas_id, tanggal, kehadiran_ortu, agenda_utama, ringkasan_hasil } = req.body;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : (req.body.foto_url || '');

    if (!kelas_id || !tanggal || !agenda_utama) {
        console.log('VALIDASI GAGAL:', { kelas_id, tanggal, agenda_utama }); // DEBUG
        return res.status(400).json({ message: 'kelas_id, tanggal, dan agenda_utama wajib diisi' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO parenting (kelas_id, tanggal, kehadiran_ortu, agenda_utama, foto_url, ringkasan_hasil)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [kelas_id, tanggal, kehadiran_ortu || 0, agenda_utama, foto_url, ringkasan_hasil || '']);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateParenting = async (req, res) => {
    const { id } = req.params;
    const { kelas_id, tanggal, kehadiran_ortu, agenda_utama, ringkasan_hasil } = req.body;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : (req.body.foto_url || '');

    try {
        const result = await pool.query(`
            UPDATE parenting
            SET kelas_id = $1, tanggal = $2, kehadiran_ortu = $3,
                agenda_utama = $4, foto_url = $5, ringkasan_hasil = $6
            WHERE id = $7 RETURNING *
        `, [kelas_id, tanggal, kehadiran_ortu || 0, agenda_utama, foto_url, ringkasan_hasil || '', id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan parenting tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteParenting = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM parenting WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan parenting tidak ditemukan' });
        }
        res.json({ success: true, message: 'Catatan parenting berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};