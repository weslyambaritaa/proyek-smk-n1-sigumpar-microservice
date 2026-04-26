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
                const oldFilePath = path.join(__dirname, '../../uploads', path.basename(oldData.rows[0].file_url));
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
            const filePath = path.join(__dirname, '../../uploads', path.basename(arsip.rows[0].file_url));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ message: "Arsip surat beserta file berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Preview Arsip Surat — stream file ke browser (inline)
exports.previewArsipSurat = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM arsip_surat WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dokumen tidak ditemukan' });

    const arsip = result.rows[0];
    // Coba dari file_data (jika disimpan sebagai bytea)
    if (arsip.file_data) {
      const mime = arsip.file_mime || arsip.jenis_file || 'application/octet-stream';
      res.set('Content-Type', mime);
      res.set('Content-Disposition', `inline; filename="${arsip.nama_file || 'dokumen'}"`);
      return res.send(arsip.file_data);
    }
    // Fallback: dari path file di disk
    if (arsip.file_url || arsip.file_path) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(arsip.file_url || arsip.file_path));
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
        res.set('Content-Type', mimeMap[ext] || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
        return fs.createReadStream(filePath).pipe(res);
      }
    }
    return res.status(404).json({ error: 'File tidak ditemukan di server' });
  } catch (err) {
    console.error('[previewArsipSurat]', err);
    res.status(500).json({ error: err.message });
  }
};