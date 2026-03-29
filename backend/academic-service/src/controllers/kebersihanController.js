const pool = require('../config/db');

// ================================================
// --- KONTROLLER KEBERSIHAN KELAS (WALI KELAS) ---
// ================================================
// Mengelola jadwal piket dan penilaian kebersihan kelas

// GET semua data kebersihan
// Query param opsional: ?kelas_id=1&minggu=2025-W14
exports.getAllKebersihan = async (req, res) => {
    const { kelas_id, minggu } = req.query;
    try {
        let query = `SELECT * FROM kebersihan_kelas`;
        const params = [];
        const conditions = [];

        if (kelas_id) {
            conditions.push(`kelas_id = $${params.length + 1}`);
            params.push(kelas_id);
        }
        if (minggu) {
            // Format: 'YYYY-WXX', filter berdasarkan minggu ISO
            conditions.push(`to_char(tanggal_penilaian, 'IYYY-"W"IW') = $${params.length + 1}`);
            params.push(minggu);
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

// POST buat penilaian kebersihan baru
exports.createKebersihan = async (req, res) => {
    const {
        kelas_id,
        tanggal_penilaian,
        petugas_piket,   // array nama siswa: ["Budi", "Siti", "Joko"]
        skor,            // 1-100
        aspek_penilaian, // JSON: { lantai, meja, papan_tulis, tempat_sampah }
        catatan
    } = req.body;

    if (!kelas_id || !tanggal_penilaian || skor === undefined) {
        return res.status(400).json({ message: 'kelas_id, tanggal_penilaian, dan skor wajib diisi' });
    }

    if (skor < 0 || skor > 100) {
        return res.status(400).json({ message: 'Skor harus antara 0 dan 100' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO kebersihan_kelas
                (kelas_id, tanggal_penilaian, petugas_piket, skor, aspek_penilaian, catatan)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [
            kelas_id,
            tanggal_penilaian,
            JSON.stringify(petugas_piket || []),
            skor,
            JSON.stringify(aspek_penilaian || {}),
            catatan || ''
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update penilaian kebersihan
exports.updateKebersihan = async (req, res) => {
    const { id } = req.params;
    const { kelas_id, tanggal_penilaian, petugas_piket, skor, aspek_penilaian, catatan } = req.body;
    try {
        const result = await pool.query(`
            UPDATE kebersihan_kelas
            SET kelas_id = $1, tanggal_penilaian = $2, petugas_piket = $3,
                skor = $4, aspek_penilaian = $5, catatan = $6
            WHERE id = $7 RETURNING *
        `, [
            kelas_id,
            tanggal_penilaian,
            JSON.stringify(petugas_piket || []),
            skor,
            JSON.stringify(aspek_penilaian || {}),
            catatan || '',
            id
        ]);

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

// GET rekap rata-rata skor per minggu untuk satu kelas
exports.getRekapKebersihan = async (req, res) => {
    const { kelas_id } = req.params;
    try {
        const result = await pool.query(`
            SELECT
                to_char(tanggal_penilaian, 'IYYY-"W"IW') AS minggu,
                ROUND(AVG(skor), 1) AS rata_rata_skor,
                COUNT(*) AS jumlah_penilaian
            FROM kebersihan_kelas
            WHERE kelas_id = $1
            GROUP BY minggu
            ORDER BY minggu DESC
            LIMIT 12
        `, [kelas_id]);

        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
