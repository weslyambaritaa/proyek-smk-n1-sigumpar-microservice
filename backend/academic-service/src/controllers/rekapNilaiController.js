const pool = require('../config/db');

// =============================================
// --- REKAP NILAI SISWA (WALI KELAS) ---
// =============================================

// GET rekap nilai semua siswa dalam satu kelas
// Response: [{ id, nama_siswa, nilai: [{ nama_mapel, tugas, uts, uas, rata_rata }] }]
exports.getRekapNilai = async (req, res) => {
    const { kelas_id } = req.params;

    try {
        // Ambil semua siswa di kelas ini
        const siswaResult = await pool.query(
            `SELECT id, nama_lengkap FROM siswa WHERE kelas_id = $1 ORDER BY nama_lengkap ASC`,
            [kelas_id]
        );

        if (siswaResult.rowCount === 0) {
            return res.json({ success: true, data: [] });
        }

        // Ambil semua nilai untuk kelas ini
        const nilaiResult = await pool.query(
            `SELECT siswa_id, nama_mapel, semester, tugas, uts, uas, rata_rata
             FROM nilai_siswa WHERE kelas_id = $1`,
            [kelas_id]
        );

        // Gabungkan data siswa dengan nilai
        const data = siswaResult.rows.map((siswa) => ({
            id: siswa.id,
            nama_siswa: siswa.nama_lengkap,
            nilai: nilaiResult.rows
                .filter((n) => n.siswa_id === siswa.id)
                .map((n) => ({
                    nama_mapel: n.nama_mapel,
                    semester: n.semester,
                    tugas: n.tugas,
                    uts: n.uts,
                    uas: n.uas,
                    rata_rata: n.rata_rata,
                })),
        }));

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET nilai satu siswa
exports.getNilaiBySiswa = async (req, res) => {
    const { siswa_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM nilai_siswa WHERE siswa_id = $1 ORDER BY nama_mapel ASC`,
            [siswa_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST input nilai siswa
exports.createNilai = async (req, res) => {
    const { siswa_id, kelas_id, nama_mapel, semester, tugas, uts, uas } = req.body;

    if (!siswa_id || !kelas_id || !nama_mapel) {
        return res.status(400).json({
            success: false,
            message: 'siswa_id, kelas_id, dan nama_mapel wajib diisi'
        });
    }

    try {
        const result = await pool.query(`
            INSERT INTO nilai_siswa (siswa_id, kelas_id, nama_mapel, semester, tugas, uts, uas)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `, [siswa_id, kelas_id, nama_mapel, semester || 'Ganjil',
            tugas || 0, uts || 0, uas || 0]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT update nilai siswa
exports.updateNilai = async (req, res) => {
    const { id } = req.params;
    const { nama_mapel, semester, tugas, uts, uas } = req.body;

    try {
        const result = await pool.query(`
            UPDATE nilai_siswa SET
                nama_mapel = $1, semester = $2,
                tugas = $3, uts = $4, uas = $5
            WHERE id = $6 RETURNING *
        `, [nama_mapel, semester || 'Ganjil',
            tugas || 0, uts || 0, uas || 0, id]);

        if (result.rowCount === 0)
            return res.status(404).json({ message: 'Data nilai tidak ditemukan' });

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE nilai
exports.deleteNilai = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM nilai_siswa WHERE id = $1', [id]
        );
        if (result.rowCount === 0)
            return res.status(404).json({ message: 'Data nilai tidak ditemukan' });

        res.json({ success: true, message: 'Data nilai berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};