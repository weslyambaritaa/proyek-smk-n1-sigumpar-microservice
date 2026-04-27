const pool = require('../config/db');

// =============================================
// --- KONTROLLER REFLEKSI (WALI KELAS) ---
// =============================================

// GET semua refleksi, opsional filter ?kelas_id=1
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
        const result = await pool.query(
            'SELECT * FROM refleksi_kelas WHERE id = $1', [id]
        );
        if (result.rowCount === 0)
            return res.status(404).json({ message: 'Refleksi tidak ditemukan' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST buat refleksi baru (terima FormData + file foto)
exports.createRefleksi = async (req, res) => {
    const {
        kelas_id,
        tanggal,
        kondisi_kelas,
        hal_positif,
        hal_perlu_perbaikan,
        rencana_tindak_lanjut,
        catatan_tambahan,
    } = req.body;

    const foto_url = req.file
        ? `/api/academic/uploads/${req.file.filename}`
        : '';

    if (!kelas_id || !tanggal || !kondisi_kelas) {
        return res.status(400).json({
            success: false,
            message: 'kelas_id, tanggal, dan kondisi_kelas wajib diisi'
        });
    }

    try {
        const result = await pool.query(`
            INSERT INTO refleksi_kelas
                (kelas_id, tanggal, kondisi_kelas, hal_positif,
                 hal_perlu_perbaikan, rencana_tindak_lanjut,
                 catatan_tambahan, foto_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            kelas_id,
            tanggal,
            kondisi_kelas,
            hal_positif          || '',
            hal_perlu_perbaikan  || '',
            rencana_tindak_lanjut|| '',
            catatan_tambahan     || '',
            foto_url
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT update refleksi
exports.updateRefleksi = async (req, res) => {
    const { id } = req.params;
    const {
        kelas_id,
        tanggal,
        kondisi_kelas,
        hal_positif,
        hal_perlu_perbaikan,
        rencana_tindak_lanjut,
        catatan_tambahan,
    } = req.body;

    const foto_url = req.file
        ? `/api/academic/uploads/${req.file.filename}`
        : null;

    try {
        let query, params;

        if (foto_url) {
            query = `
                UPDATE refleksi_kelas SET
                    kelas_id = $1,
                    tanggal = $2,
                    kondisi_kelas = $3,
                    hal_positif = $4,
                    hal_perlu_perbaikan = $5,
                    rencana_tindak_lanjut = $6,
                    catatan_tambahan = $7,
                    foto_url = $8
                WHERE id = $9 RETURNING *
            `;
            params = [
                kelas_id, tanggal, kondisi_kelas,
                hal_positif          || '',
                hal_perlu_perbaikan  || '',
                rencana_tindak_lanjut|| '',
                catatan_tambahan     || '',
                foto_url, id
            ];
        } else {
            query = `
                UPDATE refleksi_kelas SET
                    kelas_id = $1,
                    tanggal = $2,
                    kondisi_kelas = $3,
                    hal_positif = $4,
                    hal_perlu_perbaikan = $5,
                    rencana_tindak_lanjut = $6,
                    catatan_tambahan = $7
                WHERE id = $8 RETURNING *
            `;
            params = [
                kelas_id, tanggal, kondisi_kelas,
                hal_positif          || '',
                hal_perlu_perbaikan  || '',
                rencana_tindak_lanjut|| '',
                catatan_tambahan     || '',
                id
            ];
        }

        const result = await pool.query(query, params);
        if (result.rowCount === 0)
            return res.status(404).json({ message: 'Refleksi tidak ditemukan' });

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE refleksi
exports.deleteRefleksi = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM refleksi_kelas WHERE id = $1', [id]
        );
        if (result.rowCount === 0)
            return res.status(404).json({ message: 'Refleksi tidak ditemukan' });

        res.json({ success: true, message: 'Refleksi berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};