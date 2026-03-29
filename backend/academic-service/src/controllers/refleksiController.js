const pool = require('../config/db');

// =============================================
// --- KONTROLLER REFLEKSI (WALI KELAS) ---
// =============================================
// Mencatat refleksi mingguan kondisi kelas oleh wali kelas

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
        kondisi_kelas,      // 'sangat_baik' | 'baik' | 'cukup' | 'kurang'
        hal_positif,        // TEXT — hal-hal baik minggu ini
        hal_perlu_perbaikan,// TEXT — hal yang perlu ditingkatkan
        rencana_tindak_lanjut, // TEXT — rencana ke depan
        catatan_tambahan
    } = req.body;

    if (!kelas_id || !tanggal || !kondisi_kelas) {
        return res.status(400).json({ message: 'kelas_id, tanggal, dan kondisi_kelas wajib diisi' });
    }

    const kondisiValid = ['sangat_baik', 'baik', 'cukup', 'kurang'];
    if (!kondisiValid.includes(kondisi_kelas)) {
        return res.status(400).json({ message: `kondisi_kelas harus salah satu dari: ${kondisiValid.join(', ')}` });
    }

    try {
        const result = await pool.query(`
            INSERT INTO refleksi_kelas
                (kelas_id, tanggal, kondisi_kelas, hal_positif, hal_perlu_perbaikan, rencana_tindak_lanjut, catatan_tambahan)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `, [
            kelas_id,
            tanggal,
            kondisi_kelas,
            hal_positif || '',
            hal_perlu_perbaikan || '',
            rencana_tindak_lanjut || '',
            catatan_tambahan || ''
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update refleksi
exports.updateRefleksi = async (req, res) => {
    const { id } = req.params;
    const {
        kelas_id, tanggal, kondisi_kelas,
        hal_positif, hal_perlu_perbaikan,
        rencana_tindak_lanjut, catatan_tambahan
    } = req.body;

    try {
        const result = await pool.query(`
            UPDATE refleksi_kelas
            SET kelas_id = $1, tanggal = $2, kondisi_kelas = $3, hal_positif = $4,
                hal_perlu_perbaikan = $5, rencana_tindak_lanjut = $6, catatan_tambahan = $7
            WHERE id = $8 RETURNING *
        `, [
            kelas_id, tanggal, kondisi_kelas,
            hal_positif || '', hal_perlu_perbaikan || '',
            rencana_tindak_lanjut || '', catatan_tambahan || '',
            id
        ]);

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
