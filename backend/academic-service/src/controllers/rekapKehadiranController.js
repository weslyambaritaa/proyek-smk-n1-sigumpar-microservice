const pool = require('../config/db');

// GET rekap kehadiran semua siswa dalam satu kelas
exports.getRekapKehadiran = async (req, res) => {
    const { kelas_id } = req.params;
    try {
        const siswaResult = await pool.query(
            `SELECT id, nama_lengkap FROM siswa WHERE kelas_id = $1 ORDER BY nama_lengkap ASC`,
            [kelas_id]
        );

        if (siswaResult.rowCount === 0)
            return res.json({ success: true, data: [] });

        const kehadiranResult = await pool.query(
            `SELECT siswa_id, nama_mapel, bulan, tahun,
                    SUM(hadir) as hadir, SUM(izin) as izin,
                    SUM(sakit) as sakit, SUM(alpa) as alpa
             FROM kehadiran_siswa WHERE kelas_id = $1
             GROUP BY siswa_id, nama_mapel, bulan, tahun`,
            [kelas_id]
        );

        const data = siswaResult.rows.map((siswa) => {
            const kehadiran = kehadiranResult.rows.filter(
                (k) => k.siswa_id === siswa.id
            );

            const totalHadir = kehadiran.reduce((s, k) => s + parseInt(k.hadir || 0), 0);
            const totalIzin  = kehadiran.reduce((s, k) => s + parseInt(k.izin  || 0), 0);
            const totalSakit = kehadiran.reduce((s, k) => s + parseInt(k.sakit || 0), 0);
            const totalAlpa  = kehadiran.reduce((s, k) => s + parseInt(k.alpa  || 0), 0);

            const mapelSet = new Set(kehadiran.map((k) => k.nama_mapel).filter(Boolean));

            return {
                id: siswa.id,
                nama_siswa: siswa.nama_lengkap,
                nama_mapel: [...mapelSet].join(', '),
                hadir: totalHadir,
                izin: totalIzin,
                sakit: totalSakit,
                alpa: totalAlpa,
            };
        });

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST input kehadiran
exports.createKehadiran = async (req, res) => {
    const { siswa_id, kelas_id, nama_mapel, bulan, tahun, hadir, izin, sakit, alpa } = req.body;

    if (!siswa_id || !kelas_id || !bulan || !tahun)
        return res.status(400).json({
            success: false,
            message: 'siswa_id, kelas_id, bulan, dan tahun wajib diisi'
        });

    try {
        const result = await pool.query(`
            INSERT INTO kehadiran_siswa
                (siswa_id, kelas_id, nama_mapel, bulan, tahun, hadir, izin, sakit, alpa)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [siswa_id, kelas_id, nama_mapel || '',
            bulan, tahun,
            hadir || 0, izin || 0, sakit || 0, alpa || 0]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT update kehadiran
exports.updateKehadiran = async (req, res) => {
    const { id } = req.params;
    const { nama_mapel, bulan, tahun, hadir, izin, sakit, alpa } = req.body;
    try {
        const result = await pool.query(`
            UPDATE kehadiran_siswa SET
                nama_mapel = $1, bulan = $2, tahun = $3,
                hadir = $4, izin = $5, sakit = $6, alpa = $7
            WHERE id = $8 RETURNING *
        `, [nama_mapel || '', bulan, tahun,
            hadir || 0, izin || 0, sakit || 0, alpa || 0, id]);

        if (result.rowCount === 0)
            return res.status(404).json({ message: 'Data kehadiran tidak ditemukan' });

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE kehadiran
exports.deleteKehadiran = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM kehadiran_siswa WHERE id = $1', [id]);
        if (result.rowCount === 0)
            return res.status(404).json({ message: 'Data kehadiran tidak ditemukan' });
        res.json({ success: true, message: 'Data kehadiran berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};