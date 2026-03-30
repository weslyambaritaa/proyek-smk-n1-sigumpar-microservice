const pool = require('../config/db');

// ================================================
// --- KONTROLLER KEBERSIHAN KELAS (WALI KELAS) ---
// ================================================
// Mengelola kontrol kebersihan kelas harian

// GET semua data kebersihan
// Query param opsional: ?kelas_id=1
exports.getAllKebersihan = async (req, res) => {
    const { kelas_id } = req.query;
    try {
        let query = `SELECT * FROM kebersihan_kelas`;
        const params = [];
        const conditions = [];

        if (kelas_id) {
            conditions.push(`kelas_id = $${params.length + 1}`);
            params.push(kelas_id);
        }
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        query += ` ORDER BY tanggal_penilaian DESC`;

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET satu data kebersihan by ID
exports.getKebersihanById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM kebersihan_kelas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data kebersihan tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST buat laporan kebersihan baru
exports.createKebersihan = async (req, res) => {
    const {
        kelas_id,
        tanggal_penilaian,
        status_kebersihan,
        catatan
    } = req.body;

    const foto_url = req.file ? `/uploads/${req.file.filename}` : (req.body.foto_url || '');

    if (!kelas_id || !tanggal_penilaian || !status_kebersihan) {
        return res.status(400).json({ message: 'kelas_id, tanggal_penilaian, dan status_kebersihan wajib diisi' });
    }

    const statusValid = ['sangat_bersih', 'bersih', 'cukup', 'kotor'];
    if (!statusValid.includes(status_kebersihan)) {
        return res.status(400).json({ message: `status_kebersihan harus salah satu dari: ${statusValid.join(', ')}` });
    }

    try {
        const result = await pool.query(`
            INSERT INTO kebersihan_kelas
                (kelas_id, tanggal_penilaian, status_kebersihan, foto_url, catatan)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [kelas_id, tanggal_penilaian, status_kebersihan, foto_url, catatan || '']);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update laporan kebersihan
exports.updateKebersihan = async (req, res) => {
    const { id } = req.params;
    const { kelas_id, tanggal_penilaian, status_kebersihan, catatan } = req.body;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : (req.body.foto_url || '');

    try {
        const result = await pool.query(`
            UPDATE kebersihan_kelas
            SET kelas_id = $1, tanggal_penilaian = $2, status_kebersihan = $3,
                foto_url = $4, catatan = $5
            WHERE id = $6 RETURNING *
        `, [kelas_id, tanggal_penilaian, status_kebersihan, foto_url, catatan || '', id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data kebersihan tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE data kebersihan
exports.deleteKebersihan = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM kebersihan_kelas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data kebersihan tidak ditemukan' });
        }
        res.json({ success: true, message: 'Data kebersihan berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET rekap kebersihan per kelas
exports.getRekapKebersihan = async (req, res) => {
    const { kelas_id } = req.params;
    try {
        const result = await pool.query(`
            SELECT status_kebersihan, COUNT(*) AS jumlah
            FROM kebersihan_kelas
            WHERE kelas_id = $1
            GROUP BY status_kebersihan
            ORDER BY jumlah DESC
        `, [kelas_id]);

        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};