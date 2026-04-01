const db = require('../config/db');
const axios = require('axios');

const ACADEMIC_SERVICE_URL = 'http://api-gateway/api/academic';

const getHeaders = (req) => ({
    Authorization: req.headers.authorization || ''
});

// --- REGU & PLOTTING ---
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

exports.getSiswaTersedia = async (req, res) => {
    try {
        const response = await axios.get(`${ACADEMIC_SERVICE_URL}/siswa`, { headers: getHeaders(req) });
        const allSiswa = response.data.data || response.data; 

        const reguResult = await db.query('SELECT siswa_id FROM anggota_regu');
        const assignedSiswaIds = reguResult.rows.map(row => row.siswa_id);

        const siswaTersedia = allSiswa.filter(siswa => !assignedSiswaIds.includes(siswa.id));
        res.json(siswaTersedia);
    } catch (err) { 
        res.status(500).json({ error: "Gagal mengambil data siswa", details: err.message }); 
    }
};

exports.assignSiswaToRegu = async (req, res) => {
    const { regu_id, siswa_ids } = req.body;
    try {
        // Looping untuk memasukkan setiap siswa ke tabel anggota_regu
        for (const id of siswa_ids) {
            await db.query('INSERT INTO anggota_regu (regu_id, siswa_id) VALUES ($1, $2)', [regu_id, id]);
        }
        res.json({ message: "Berhasil memplotting anggota" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- ABSENSI & SISWA PER REGU ---

// Fungsi BARU: Mengambil siswa yang terdaftar di regu tertentu (untuk absen)
exports.getSiswaByRegu = async (req, res) => {
    const { regu_id } = req.params;
    try {
        // 1. Ambil ID siswa yang tergabung di regu ini
        const dbResult = await db.query('SELECT siswa_id FROM anggota_regu WHERE regu_id = $1', [regu_id]);
        const siswaIds = dbResult.rows.map(row => row.siswa_id);

        if (siswaIds.length === 0) return res.json([]);

        // 2. Ambil data detail siswa dari academic-service
        const response = await axios.get(`${ACADEMIC_SERVICE_URL}/siswa`, { headers: getHeaders(req) });
        const allSiswa = response.data.data || response.data;

        // 3. Filter hanya siswa yang ada di regu ini
        const siswaRegu = allSiswa.filter(siswa => siswaIds.includes(siswa.id));
        res.json(siswaRegu);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil data siswa regu", details: err.message });
    }
};

exports.submitAbsensiPramuka = async (req, res) => {
    const { regu_id, tanggal, data_absensi } = req.body;
    try {
        // data_absensi adalah array of object: [{ siswa_id: 1, status: 'Hadir' }, ...]
        for (const absen of data_absensi) {
            await db.query(
                'INSERT INTO absensi_pramuka (regu_id, siswa_id, tanggal, status) VALUES ($1, $2, $3, $4)',
                [regu_id, absen.siswa_id, tanggal, absen.status]
            );
        }
        res.json({ message: "Absensi berhasil disimpan" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
// Update Regu
exports.updateRegu = async (req, res) => {
    const { id } = req.params;
    const { nama_regu } = req.body;
    try {
        const result = await db.query(
            'UPDATE kelas_pramuka SET nama_regu = $1 WHERE id = $2 RETURNING *',
            [nama_regu, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Regu tidak ditemukan' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Delete Regu
exports.deleteRegu = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM kelas_pramuka WHERE id = $1', [id]);
        res.json({ message: 'Regu berhasil dihapus' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
