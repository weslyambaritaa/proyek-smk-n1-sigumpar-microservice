const db = require('../config/db'); // Sesuaikan dengan path database kamu

// --- MANAJEMEN REGU ---
exports.getAllRegu = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM regu_pramuka ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRegu = async (req, res) => {
    const { nama_regu } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO kelas_pramuka (nama_regu) VALUES ($1) RETURNING *',
            [nama_regu]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- MANAJEMEN ANGGOTA REGU ---
exports.getSiswaTersedia = async (req, res) => {
    try {
        // Mengambil siswa yang belum memiliki regu
        const result = await db.query(`
            SELECT id, nama, kelas 
            FROM siswa 
            WHERE id NOT IN (SELECT siswa_id FROM anggota_regu)
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignSiswaToRegu = async (req, res) => {
    const { regu_id, siswa_ids } = req.body;
    try {
        // Asumsi menggunakan transaksi atau looping untuk insert multi-data
        // Contoh sederhana menggunakan looping (disarankan pakai transaction jika data banyak)
        for (let siswa_id of siswa_ids) {
             await db.query(
                'INSERT INTO anggota_regu (regu_id, siswa_id) VALUES ($1, $2)',
                [regu_id, siswa_id]
            );
        }
        res.status(201).json({ message: "Siswa berhasil dimasukkan ke regu" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- ABSENSI ---
exports.getAllKelas = async (req, res) => {
    try {
        const result = await db.query('SELECT id, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSiswaPramukaByKelas = async (req, res) => {
    const { kelas_id } = req.params;
    try {
        // Ambil siswa berdasarkan kelas, beserta nama regunya (jika ada)
        const result = await db.query(`
            SELECT s.id, s.nama, rp.nama_regu
            FROM siswa s
            LEFT JOIN anggota_regu ar ON s.id = ar.siswa_id
            LEFT JOIN regu_pramuka rp ON ar.regu_id = rp.id
            WHERE s.kelas_id = $1
            ORDER BY s.nama ASC
        `, [kelas_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.submitAbsensiPramuka = async (req, res) => {
    const { kelas_id, tanggal, materi, data_absensi } = req.body;
    try {
        // Contoh insert absensi (disesuaikan dengan struktur tabel absensi kamu)
        // Looping untuk insert setiap data absensi siswa
        for (const absen of data_absensi) {
            await db.query(`
                INSERT INTO absensi_pramuka (siswa_id, kelas_id, tanggal, materi, status) 
                VALUES ($1, $2, $3, $4, $5)
            `, [absen.siswa_id, kelas_id, tanggal, materi, absen.status]);
        }
        res.status(201).json({ message: 'Absensi berhasil disimpan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};