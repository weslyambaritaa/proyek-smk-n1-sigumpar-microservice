const pool = require('../config/db');
const multer = require('multer');

// ── Multer setup: simpan file di memory buffer ─────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // maks 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF dan DOCX yang diperbolehkan'));
    }
  },
});

// Wrapper agar multer kompatibel dengan Express 5 (async error handling)
const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

// ============================================================
// PERANGKAT PEMBELAJARAN
// ============================================================

// GET /api/learning/perangkat
exports.getAllPerangkat = async (req, res) => {
  const guruId = req.user.sub;
  try {
    const result = await pool.query(
      `SELECT id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
              to_char(tanggal_upload, 'YYYY-MM-DD') AS tanggal_upload
       FROM perangkat_pembelajaran
       WHERE guru_id = $1
       ORDER BY tanggal_upload DESC`,
      [guruId]
    );
    // Keep this structure as frontend expects res.data.data
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[getAllPerangkat]', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/learning/perangkat  (multipart/form-data)
exports.uploadPerangkat = async (req, res) => {
  const guruId = req.user.sub;

  // Jalankan multer dulu (kompatibel Express 5)
  try {
    await runMulter(req, res);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const { nama_dokumen, jenis_dokumen } = req.body;

  if (!nama_dokumen || !jenis_dokumen) {
    return res.status(400).json({ success: false, message: 'Nama dokumen dan jenis dokumen wajib diisi' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File wajib diunggah (PDF/DOCX)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO perangkat_pembelajaran
         (guru_id, nama_dokumen, jenis_dokumen, file_name, file_data, file_mime)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, guru_id, nama_dokumen, jenis_dokumen, file_name, file_mime,
                 to_char(tanggal_upload, 'YYYY-MM-DD') AS tanggal_upload`,
      [
        guruId,
        nama_dokumen.trim(),
        jenis_dokumen,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[uploadPerangkat]', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/learning/perangkat/:id/download
exports.downloadPerangkat = async (req, res) => {
  const guruId = req.user.sub;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT file_name, file_data, file_mime, guru_id FROM perangkat_pembelajaran WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }
    const doc = result.rows[0];
    if (doc.guru_id !== guruId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    res.set('Content-Type', doc.file_mime);
    res.set('Content-Disposition', `attachment; filename="${doc.file_name}"`);
    res.send(doc.file_data);
  } catch (err) {
    console.error('[downloadPerangkat]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/learning/perangkat/:id
exports.deletePerangkat = async (req, res) => {
  const guruId = req.user.sub;
  const { id } = req.params;
  try {
    const check = await pool.query(
      'SELECT guru_id FROM perangkat_pembelajaran WHERE id = $1',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }
    if (check.rows[0].guru_id !== guruId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    await pool.query('DELETE FROM perangkat_pembelajaran WHERE id = $1', [id]);
    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (err) {
    console.error('[deletePerangkat]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// NILAI SISWA
// ============================================================

// GET /api/learning/nilai?kelas_id=&mata_pelajaran=&tahun_ajar=
exports.getNilai = async (req, res) => {
  const guruId = req.user.sub;
  const { kelas_id, mata_pelajaran, tahun_ajar } = req.query;

  if (!kelas_id || !mata_pelajaran || !tahun_ajar) {
    return res.status(400).json({
      success: false,
      message: 'Parameter kelas_id, mata_pelajaran, dan tahun_ajar wajib diisi',
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM nilai_siswa
       WHERE guru_id = $1 AND kelas_id = $2 AND mata_pelajaran = $3 AND tahun_ajar = $4
       ORDER BY nama_siswa ASC`,
      [guruId, kelas_id, mata_pelajaran, tahun_ajar]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[getNilai]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/learning/nilai/batch
exports.saveNilaiBatch = async (req, res) => {
  const guruId = req.user.sub;
  const { kelas_id, nama_kelas, mata_pelajaran, tahun_ajar, nilai } = req.body;

  if (!kelas_id || !mata_pelajaran || !tahun_ajar || !Array.isArray(nilai)) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const n of nilai) {
      const nilaiAkhir = hitungNilaiAkhir(n);
      await client.query(
        `INSERT INTO nilai_siswa
           (guru_id, siswa_id, nama_siswa, nis, kelas_id, nama_kelas,
            mata_pelajaran, tahun_ajar, nilai_tugas, nilai_kuis, nilai_uts,
            nilai_uas, nilai_praktik, nilai_akhir, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, NOW())
         ON CONFLICT (guru_id, siswa_id, mata_pelajaran, tahun_ajar)
         DO UPDATE SET
           nilai_tugas   = EXCLUDED.nilai_tugas,
           nilai_kuis    = EXCLUDED.nilai_kuis,
           nilai_uts     = EXCLUDED.nilai_uts,
           nilai_uas     = EXCLUDED.nilai_uas,
           nilai_praktik = EXCLUDED.nilai_praktik,
           nilai_akhir   = EXCLUDED.nilai_akhir,
           updated_at    = NOW()`,
        [
          guruId, n.siswa_id, n.nama_siswa, n.nis, kelas_id, nama_kelas,
          mata_pelajaran, tahun_ajar,
          n.nilai_tugas || 0, n.nilai_kuis || 0, n.nilai_uts || 0,
          n.nilai_uas || 0, n.nilai_praktik || 0, nilaiAkhir,
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `${nilai.length} nilai berhasil disimpan` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[saveNilaiBatch]', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// Rumus: 20% tugas + 10% kuis + 30% UTS + 30% UAS + 10% praktik
function hitungNilaiAkhir(n) {
  const t   = parseFloat(n.nilai_tugas)   || 0;
  const q   = parseFloat(n.nilai_kuis)    || 0;
  const uts = parseFloat(n.nilai_uts)     || 0;
  const uas = parseFloat(n.nilai_uas)     || 0;
  const p   = parseFloat(n.nilai_praktik) || 0;
  return parseFloat((t * 0.2 + q * 0.1 + uts * 0.3 + uas * 0.3 + p * 0.1).toFixed(2));
}
