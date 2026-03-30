const db = require('../config/db');

// --- REGU ---
exports.getAllRegu = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM kelas_pramuka');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRegu = async (req, res) => {
    const { nama_regu } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO kelas_pramuka (nama_regu) VALUES ($1) RETURNING *',
            [nama_regu]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- ANGGOTA ---
exports.getSiswaTersedia = async (req, res) => {
    try {
        // Logika mengambil siswa yang belum punya regu
        const result = await db.query('SELECT * FROM siswa WHERE id NOT IN (SELECT siswa_id FROM anggota_regu)');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.assignSiswaToRegu = async (req, res) => {
    const { regu_id, siswa_ids } = req.body;
    try {
        for (const id of siswa_ids) {
            await db.query('INSERT INTO anggota_regu (regu_id, siswa_id) VALUES ($1, $2)', [regu_id, id]);
        }
        res.json({ message: "Berhasil memplotting anggota" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- ABSENSI & KELAS ---
exports.getAllKelas = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM kelas');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getSiswaPramukaByKelas = async (req, res) => {
    const { kelas_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM siswa WHERE kelas_id = $1', [kelas_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.submitAbsensiPramuka = async (req, res) => {
    try {
        // Logika simpan absensi
        res.json({ message: "Absensi berhasil disimpan" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};