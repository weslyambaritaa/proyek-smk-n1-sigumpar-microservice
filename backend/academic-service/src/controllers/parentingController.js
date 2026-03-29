const pool = require('../config/db');

// ==========================================
// --- KONTROLLER PARENTING (WALI KELAS) ---
// ==========================================
// Mencatat riwayat komunikasi/pertemuan wali kelas dengan orang tua siswa

// GET semua catatan parenting
// Query param opsional: ?kelas_id=1
exports.getAllParenting = async (req, res) => {
    const { kelas_id } = req.query;
    try {
        let query = `
            SELECT p.*, s.nama_lengkap AS nama_siswa, s.nisn
            FROM parenting p
            JOIN siswa s ON p.siswa_id = s.id
        `;
        const params = [];

        if (kelas_id) {
            query += ` WHERE s.kelas_id = $1`;
            params.push(kelas_id);
        }

        query += ` ORDER BY p.tanggal DESC`;
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET satu catatan parenting by ID
exports.getParentingById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.*, s.nama_lengkap AS nama_siswa, s.nisn
            FROM parenting p
            JOIN siswa s ON p.siswa_id = s.id
            WHERE p.id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan parenting tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST buat catatan parenting baru
exports.createParenting = async (req, res) => {
    const { siswa_id, tanggal, topik, catatan, jenis_komunikasi } = req.body;
    // jenis_komunikasi: 'tatap_muka' | 'telepon' | 'whatsapp' | 'surat'

    if (!siswa_id || !tanggal || !topik) {
        return res.status(400).json({ message: 'siswa_id, tanggal, dan topik wajib diisi' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO parenting (siswa_id, tanggal, topik, catatan, jenis_komunikasi)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [siswa_id, tanggal, topik, catatan || '', jenis_komunikasi || 'tatap_muka']);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update catatan parenting
exports.updateParenting = async (req, res) => {
    const { id } = req.params;
    const { siswa_id, tanggal, topik, catatan, jenis_komunikasi } = req.body;
    try {
        const result = await pool.query(`
            UPDATE parenting
            SET siswa_id = $1, tanggal = $2, topik = $3, catatan = $4, jenis_komunikasi = $5
            WHERE id = $6 RETURNING *
        `, [siswa_id, tanggal, topik, catatan, jenis_komunikasi, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Catatan parenting tidak ditemukan' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE catatan parenting
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
