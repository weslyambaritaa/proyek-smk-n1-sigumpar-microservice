const pool = require('../config/db');

exports.getAllJadwal = async (req, res) => {
    try {
        // Ambil data jadwal beserta nama kelasnya
        const result = await pool.query(`
            SELECT j.*, k.nama_kelas, g.nama AS nama_guru
            FROM jadwal_mengajar j 
            LEFT JOIN kelas k ON j.kelas_id = k.id
            LEFT JOIN guru g ON j.guru_id = g.id
            ORDER BY 
                CASE j.hari
                    WHEN 'Senin' THEN 1
                    WHEN 'Selasa' THEN 2
                    WHEN 'Rabu' THEN 3
                    WHEN 'Kamis' THEN 4
                    WHEN 'Jumat' THEN 5
                    WHEN 'Sabtu' THEN 6
                    WHEN 'Minggu' THEN 7
                    ELSE 8
                END, 
                j.waktu_mulai ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createJadwal = async (req, res) => {
    const { guru_id, kelas_id, mata_pelajaran, hari, waktu_mulai, waktu_berakhir } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO jadwal_mengajar (guru_id, kelas_id, mata_pelajaran, hari, waktu_mulai, waktu_berakhir) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [guru_id || null, kelas_id || null, mata_pelajaran, hari, waktu_mulai, waktu_berakhir]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateJadwal = async (req, res) => {
    const { id } = req.params;
    const { guru_id, kelas_id, mata_pelajaran, hari, waktu_mulai, waktu_berakhir } = req.body;
    try {
        const result = await pool.query(
            'UPDATE jadwal_mengajar SET guru_id = $1, kelas_id = $2, mata_pelajaran = $3, hari = $4, waktu_mulai = $5, waktu_berakhir = $6 WHERE id = $7 RETURNING *',
            [guru_id || null, kelas_id || null, mata_pelajaran, hari, waktu_mulai, waktu_berakhir, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Jadwal mengajar tidak ditemukan" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteJadwal = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM jadwal_mengajar WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Jadwal mengajar tidak ditemukan" });
        }

        res.json({ success: true, message: "Jadwal mengajar berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};