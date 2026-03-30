const pool = require('../config/db');

// ==============================================
// --- KONTROLLER BERANDA WALI KELAS ---
// ==============================================

// GET /api/academic/walas/beranda?kelas_id=1
exports.getBerandaData = async (req, res) => {
    const { kelas_id } = req.query;

    if (!kelas_id) {
        return res.status(400).json({ message: 'kelas_id wajib diisi' });
    }

    try {
        // 1. Info kelas
        const kelasResult = await pool.query('SELECT * FROM kelas WHERE id = $1', [kelas_id]);
        if (kelasResult.rowCount === 0) {
            return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
        const kelas = kelasResult.rows[0];

        // 2. Total siswa di kelas ini
        const totalSiswaResult = await pool.query(
            'SELECT COUNT(*) AS total FROM siswa WHERE kelas_id = $1',
            [kelas_id]
        );
        const totalSiswa = parseInt(totalSiswaResult.rows[0].total);

        // 3. Pertemuan parenting bulan ini
        const parentingResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM parenting
            WHERE kelas_id = $1
              AND date_trunc('month', tanggal) = date_trunc('month', CURRENT_DATE)
        `, [kelas_id]);
        const totalParentingBulanIni = parseInt(parentingResult.rows[0].total);

        // 4. Status kebersihan terbaru bulan ini
        const kebersihanResult = await pool.query(`
            SELECT status_kebersihan, COUNT(*) AS jumlah
            FROM kebersihan_kelas
            WHERE kelas_id = $1
              AND date_trunc('month', tanggal_penilaian) = date_trunc('month', CURRENT_DATE)
            GROUP BY status_kebersihan
            ORDER BY jumlah DESC
            LIMIT 1
        `, [kelas_id]);
        const statusKebersihanTerbanyak = kebersihanResult.rows[0]?.status_kebersihan || null;

        // 5. Refleksi terbaru
        const refleksiResult = await pool.query(`
            SELECT * FROM refleksi_kelas
            WHERE kelas_id = $1
            ORDER BY tanggal DESC
            LIMIT 1
        `, [kelas_id]);
        const refleksiTerbaru = refleksiResult.rows[0] || null;

        // 6. Pengumuman terbaru (3 terakhir)
        const pengumumanResult = await pool.query(
            'SELECT * FROM pengumuman ORDER BY id DESC LIMIT 3'
        );

        // 7. Parenting terbaru (5 terakhir)
        const parentingTerbaruResult = await pool.query(`
            SELECT * FROM parenting
            WHERE kelas_id = $1
            ORDER BY tanggal DESC
            LIMIT 5
        `, [kelas_id]);

        res.json({
            success: true,
            data: {
                kelas,
                statistik: {
                    total_siswa: totalSiswa,
                    parenting_bulan_ini: totalParentingBulanIni,
                    status_kebersihan_terbanyak: statusKebersihanTerbanyak,
                },
                refleksi_terbaru: refleksiTerbaru,
                pengumuman_terbaru: pengumumanResult.rows,
                parenting_terbaru: parentingTerbaruResult.rows,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};