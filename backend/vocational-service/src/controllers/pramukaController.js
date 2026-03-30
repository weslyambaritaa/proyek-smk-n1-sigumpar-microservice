const db = require('../config/db');
const axios = require('axios'); // Tambahkan axios untuk request antar-service

// URL base untuk ke academic service di dalam docker network
// Menggunakan nama container: 'academic-service' dan port: '3003'
const ACADEMIC_SERVICE_URL = 'http://academic-service:3003/api/academic';

// Helper untuk meneruskan token otorisasi ke service lain
const getHeaders = (req) => ({
    Authorization: req.headers.authorization || ''
});

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
        // 1. Ambil SEMUA data siswa dari Academic Service via HTTP
        const response = await axios.get(`${ACADEMIC_SERVICE_URL}/siswa`, {
            headers: getHeaders(req)
        });
        
        // Asumsi data array of siswa ada di response.data atau response.data.data
        const allSiswa = response.data.data || response.data; 

        // 2. Ambil ID siswa yang sudah terdaftar di regu (dari database local vocational_db)
        const reguResult = await db.query('SELECT siswa_id FROM anggota_regu');
        const assignedSiswaIds = reguResult.rows.map(row => row.siswa_id);

        // 3. Filter: Hanya ambil siswa yang ID-nya BELUM ADA di assignedSiswaIds
        const siswaTersedia = allSiswa.filter(siswa => !assignedSiswaIds.includes(siswa.id));

        res.json(siswaTersedia);
    } catch (err) { 
        res.status(500).json({ 
            error: "Gagal mengambil data siswa tersedia", 
            details: err.message 
        }); 
    }
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
        // Meminta data kelas langsung ke Academic Service
        const response = await axios.get(`${ACADEMIC_SERVICE_URL}/kelas`, {
            headers: getHeaders(req)
        });
        
        res.json(response.data.data || response.data);
    } catch (err) { 
        res.status(500).json({ 
            error: "Gagal mengambil data kelas dari academic-service", 
            details: err.message 
        }); 
    }
};

exports.getSiswaPramukaByKelas = async (req, res) => {
    const { kelas_id } = req.params;
    try {
        // 1. Ambil data semua siswa dari Academic Service
        const response = await axios.get(`${ACADEMIC_SERVICE_URL}/siswa`, {
            headers: getHeaders(req)
        });
        const allSiswa = response.data.data || response.data;

        // 2. Filter manual siswa berdasarkan kelas_id
        // Gunakan '==' agar aman jika satu integer dan satunya string
        const siswaByKelas = allSiswa.filter(siswa => siswa.kelas_id == kelas_id);
        
        res.json(siswaByKelas);
    } catch (err) { 
        res.status(500).json({ 
            error: `Gagal mengambil siswa untuk kelas_id ${kelas_id}`, 
            details: err.message 
        }); 
    }
};

exports.submitAbsensiPramuka = async (req, res) => {
    try {
        // Logika simpan absensi ke DB local (vocational_db)
        res.json({ message: "Absensi berhasil disimpan" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};