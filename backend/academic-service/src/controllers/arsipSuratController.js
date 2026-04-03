const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

//--------------------------------------------
//----------ARSIP SURAT ---------------------
//--------------------------------------------
// GET semua data
// Get All Arsip Surat
exports.getAllArsipSurat = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM arsip_surat ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Arsip Surat
exports.createArsipSurat = async (req, res) => {
    const { nomor_surat } = req.body;
    const file = req.file; // Diambil dari multer middleware

    if (!file) {
        return res.status(400).json({ message: "File surat harus diunggah" });
    }

    const fileUrl = `/api/academic/uploads/${file.filename}`;

    try {
        const result = await pool.query(
            "INSERT INTO arsip_surat (nomor_surat, file_url) VALUES ($1, $2) RETURNING *",
            [nomor_surat, fileUrl]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Arsip Surat
exports.updateArsipSurat = async (req, res) => {
    const { id } = req.params;
    const { nomor_surat } = req.body;
    const file = req.file;

    try {
        // Cek file_url lama untuk dihapus jika ada file baru
        const oldData = await pool.query("SELECT file_url FROM arsip_surat WHERE id = $1", [id]);
        if (oldData.rowCount === 0) {
            return res.status(404).json({ message: "Arsip surat tidak ditemukan" });
        }

        let query, params;

        if (file) {
            // Jika user upload file baru
            const fileUrl = `/api/academic/uploads/${file.filename}`;
            query = "UPDATE arsip_surat SET nomor_surat = $1, file_url = $2 WHERE id = $3 RETURNING *";
            params = [nomor_surat, fileUrl, id];

            // Hapus file lama dari storage
            if (oldData.rows[0].file_url) {
                const oldFilePath = path.join(__dirname, '../../', oldData.rows[0].file_url);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            }
        } else {
            // Jika user hanya update nomor surat tanpa ganti file
            query = "UPDATE arsip_surat SET nomor_surat = $1 WHERE id = $2 RETURNING *";
            params = [nomor_surat, id];
        }

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Arsip Surat
exports.deleteArsipSurat = async (req, res) => {
    const { id } = req.params;
    try {
        const arsip = await pool.query("SELECT file_url FROM arsip_surat WHERE id = $1", [id]);
        
        if (arsip.rowCount === 0) {
            return res.status(404).json({ message: "Arsip surat tidak ditemukan" });
        }

        // Hapus data dari DB
        await pool.query("DELETE FROM arsip_surat WHERE id = $1", [id]);

        // Hapus file fisik dari folder uploads
        if (arsip.rows[0].file_url) {
            const filePath = path.join(__dirname, '../../', arsip.rows[0].file_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ message: "Arsip surat beserta file berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};