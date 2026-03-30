const pool = require('../config/db');

// ============================================================
// PKL SUBMISSIONS
// ============================================================

exports.getAllPKL = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ps.*,
        pk.nama_program,
        pk.kode_program
      FROM pkl_submissions ps
      LEFT JOIN program_keahlian pk ON ps.program_keahlian_id = pk.id
      ORDER BY ps.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPKLById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        ps.*,
        pk.nama_program,
        pk.kode_program
      FROM pkl_submissions ps
      LEFT JOIN program_keahlian pk ON ps.program_keahlian_id = pk.id
      WHERE ps.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data PKL tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPKL = async (req, res) => {
  const {
    siswa_id, nama_siswa, kelas, program_keahlian_id,
    nama_perusahaan, alamat_perusahaan, kontak_perusahaan,
    bidang_pekerjaan, tanggal_mulai, tanggal_selesai
  } = req.body;

  const guru_id = req.user?.sub || null;
  const nama_guru = req.user?.name || req.user?.preferred_username || null;

  try {
    const result = await pool.query(`
      INSERT INTO pkl_submissions 
        (siswa_id, nama_siswa, kelas, program_keahlian_id, nama_perusahaan,
         alamat_perusahaan, kontak_perusahaan, bidang_pekerjaan,
         tanggal_mulai, tanggal_selesai, guru_pembimbing_id, nama_guru)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [siswa_id, nama_siswa, kelas, program_keahlian_id || null,
        nama_perusahaan, alamat_perusahaan, kontak_perusahaan,
        bidang_pekerjaan, tanggal_mulai, tanggal_selesai, guru_id, nama_guru]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePKL = async (req, res) => {
  const { id } = req.params;
  const {
    nama_siswa, kelas, program_keahlian_id,
    nama_perusahaan, alamat_perusahaan, kontak_perusahaan,
    bidang_pekerjaan, tanggal_mulai, tanggal_selesai
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE pkl_submissions SET
        nama_siswa = $1, kelas = $2, program_keahlian_id = $3,
        nama_perusahaan = $4, alamat_perusahaan = $5, kontak_perusahaan = $6,
        bidang_pekerjaan = $7, tanggal_mulai = $8, tanggal_selesai = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `, [nama_siswa, kelas, program_keahlian_id || null,
        nama_perusahaan, alamat_perusahaan, kontak_perusahaan,
        bidang_pekerjaan, tanggal_mulai, tanggal_selesai, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data PKL tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePKL = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM pkl_submissions WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data PKL tidak ditemukan' });
    }
    res.json({ success: true, message: 'Data PKL berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// VALIDASI / APPROVE PKL
// ============================================================

exports.approvePKL = async (req, res) => {
  const { pkl_id, status_kelayakan, status_approval, catatan_guru } = req.body;

  if (!pkl_id) {
    return res.status(400).json({ success: false, message: 'pkl_id wajib diisi' });
  }

  try {
    const result = await pool.query(`
      UPDATE pkl_submissions SET
        status_kelayakan = COALESCE($1, status_kelayakan),
        status_approval  = COALESCE($2, status_approval),
        catatan_guru     = COALESCE($3, catatan_guru),
        updated_at       = NOW()
      WHERE id = $4
      RETURNING *
    `, [status_kelayakan, status_approval, catatan_guru, pkl_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data PKL tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0], message: 'Status PKL berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// MONITORING PKL
// ============================================================

exports.getAllMonitoring = async (req, res) => {
  const { pkl_id } = req.query;
  try {
    const query = pkl_id
      ? 'SELECT * FROM pkl_monitoring WHERE pkl_id = $1 ORDER BY tanggal_kunjungan DESC'
      : 'SELECT m.*, p.nama_siswa, p.nama_perusahaan FROM pkl_monitoring m LEFT JOIN pkl_submissions p ON m.pkl_id = p.id ORDER BY m.tanggal_kunjungan DESC';

    const result = pkl_id
      ? await pool.query(query, [pkl_id])
      : await pool.query(query);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addMonitoring = async (req, res) => {
  const { pkl_id, catatan, progres_saat_kunjungan } = req.body;
  const petugas_id = req.user?.sub || null;
  const nama_petugas = req.user?.name || req.user?.preferred_username || null;

  if (!pkl_id || !catatan) {
    return res.status(400).json({ success: false, message: 'pkl_id dan catatan wajib diisi' });
  }

  try {
    // Insert record monitoring
    const monResult = await pool.query(`
      INSERT INTO pkl_monitoring (pkl_id, catatan, progres_saat_kunjungan, petugas_id, nama_petugas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [pkl_id, catatan, progres_saat_kunjungan || 0, petugas_id, nama_petugas]);

    // Update progres di tabel pkl_submissions
    if (progres_saat_kunjungan !== undefined) {
      await pool.query(`
        UPDATE pkl_submissions SET progres_terakhir = $1, updated_at = NOW() WHERE id = $2
      `, [progres_saat_kunjungan, pkl_id]);
    }

    res.status(201).json({ success: true, data: monResult.rows[0], message: 'Monitoring berhasil dicatat' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// INPUT NILAI PKL
// ============================================================

exports.inputNilai = async (req, res) => {
  const { pkl_id, nilai_akhir, predikat, keterangan_nilai } = req.body;

  if (!pkl_id || nilai_akhir === undefined) {
    return res.status(400).json({ success: false, message: 'pkl_id dan nilai_akhir wajib diisi' });
  }

  // Auto-hitung predikat jika tidak diisi
  let finalPredikat = predikat;
  if (!finalPredikat) {
    if (nilai_akhir >= 90) finalPredikat = 'A';
    else if (nilai_akhir >= 80) finalPredikat = 'B';
    else if (nilai_akhir >= 70) finalPredikat = 'C';
    else if (nilai_akhir >= 60) finalPredikat = 'D';
    else finalPredikat = 'E';
  }

  try {
    const result = await pool.query(`
      UPDATE pkl_submissions SET
        nilai_akhir     = $1,
        predikat        = $2,
        keterangan_nilai= $3,
        updated_at      = NOW()
      WHERE id = $4
      RETURNING *
    `, [nilai_akhir, finalPredikat, keterangan_nilai, pkl_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data PKL tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0], message: 'Nilai PKL berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// PROGRAM KEAHLIAN
// ============================================================

exports.getAllProgramKeahlian = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM program_keahlian ORDER BY nama_program');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// STATISTIK DASHBOARD VOKASI
// ============================================================

exports.getStatistik = async (req, res) => {
  try {
    const [totalPKL, statusPKL, avgNilai, totalProyek] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM pkl_submissions'),
      pool.query(`
        SELECT 
          status_approval,
          COUNT(*) AS jumlah
        FROM pkl_submissions
        GROUP BY status_approval
      `),
      pool.query(`
        SELECT ROUND(AVG(nilai_akhir), 2) AS rata_rata
        FROM pkl_submissions 
        WHERE nilai_akhir IS NOT NULL
      `),
      pool.query('SELECT COUNT(*) AS total FROM proyek_vokasi'),
    ]);

    const statusMap = {};
    statusPKL.rows.forEach(r => { statusMap[r.status_approval] = parseInt(r.jumlah); });

    res.json({
      success: true,
      data: {
        total_pkl: parseInt(totalPKL.rows[0].total),
        pkl_disetujui: statusMap['disetujui'] || 0,
        pkl_pending: statusMap['pending'] || 0,
        pkl_ditolak: statusMap['ditolak'] || 0,
        rata_rata_nilai: parseFloat(avgNilai.rows[0].rata_rata) || 0,
        total_proyek: parseInt(totalProyek.rows[0].total),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
