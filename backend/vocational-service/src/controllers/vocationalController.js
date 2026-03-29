const pool = require("../config/db");

// ============================================================
// REKAPITULASI / GET ALL PKL (dengan fitur pencarian)
// ============================================================
exports.getAllPKL = async (req, res) => {
  const { nama } = req.query;
  try {
    let query = `
      SELECT 
        ps.*, 
        s.nama_lengkap,
        s.nisn,
        s.kelas,
        pp.nilai_akhir,
        pp.grade,
        pp.status_penilaian
      FROM pkl_submissions ps
      JOIN siswa s ON ps.siswa_id = s.id
      LEFT JOIN pkl_penilaian pp ON ps.id = pp.submission_id
    `;
    const params = [];
    if (nama) {
      query += ` WHERE s.nama_lengkap ILIKE $1`;
      params.push(`%${nama}%`);
    }
    query += ` ORDER BY ps.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// VALIDASI & PERSETUJUAN PKL
// ============================================================
exports.validateAndApprovePKL = async (req, res) => {
  const { id } = req.params;
  const { status_validasi, keterangan_layak } = req.body;

  try {
    // Jika divalidasi → otomatis approved (logic include)
    const statusPersetujuan =
      status_validasi === "validated" ? "approved" : "pending";

    const result = await pool.query(
      `UPDATE pkl_submissions 
       SET status_validasi = $1, keterangan_layak = $2, status_persetujuan = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [status_validasi, keterangan_layak, statusPersetujuan, id],
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data PKL tidak ditemukan" });

    res.json({
      success: true,
      message: "Validasi dan Persetujuan berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// MONITORING & PROGRES SISWA
// ============================================================
exports.createMonitoring = async (req, res) => {
  const {
    submission_id,
    catatan_monitoring,
    progres_siswa,
    tanggal_kunjungan,
  } = req.body;
  const file_laporan = req.file ? req.file.path : null;

  try {
    const result = await pool.query(
      `INSERT INTO pkl_monitoring (submission_id, tanggal_kunjungan, catatan_monitoring, progres_siswa, file_laporan)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        submission_id,
        tanggal_kunjungan,
        catatan_monitoring,
        progres_siswa,
        file_laporan,
      ],
    );
    res.status(201).json({
      success: true,
      message: "Laporan monitoring dan progres berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMonitoring = async (req, res) => {
  const { submission_id } = req.query;
  try {
    let query = `
      SELECT pm.*, s.nama_lengkap, ps.nama_perusahaan 
      FROM pkl_monitoring pm
      JOIN pkl_submissions ps ON pm.submission_id = ps.id
      JOIN siswa s ON ps.siswa_id = s.id
    `;
    const params = [];
    if (submission_id) {
      query += ` WHERE pm.submission_id = $1`;
      params.push(submission_id);
    }
    query += ` ORDER BY pm.tanggal_kunjungan DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// PENILAIAN PKL — STATS (DIPERBAIKI: tidak lagi nested)
// ============================================================
exports.getPenilaianStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(ps.id) AS total_siswa,
        COUNT(CASE WHEN pp.status_penilaian = 'Simpan' THEN 1 END) AS nilai_sudah_diisi,
        COUNT(CASE WHEN pp.status_penilaian IS NULL OR pp.status_penilaian = 'Draft' THEN 1 END) AS nilai_belum_diisi,
        COALESCE(AVG(pp.nilai_akhir), 0)::NUMERIC(10,2) AS rata_rata_nilai
      FROM pkl_submissions ps
      LEFT JOIN pkl_penilaian pp ON ps.id = pp.submission_id
    `);
    res.json({ success: true, data: stats.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// PENILAIAN PKL — UPSERT (DIPERBAIKI: tidak lagi nested)
// ============================================================
exports.upsertPenilaian = async (req, res) => {
  const {
    submission_id,
    disiplin,
    teknis,
    komunikasi,
    laporan,
    presentasi,
    catatan_guru,
    status_penilaian,
  } = req.body;

  // Logika Perhitungan Nilai Akhir dengan bobot
  const komponen = [
    Number(disiplin) * 0.15,
    Number(teknis) * 0.35,
    Number(komunikasi) * 0.15,
    Number(laporan) * 0.2,
    Number(presentasi) * 0.15,
  ];
  const nilai_akhir = komponen.reduce((a, b) => a + b, 0).toFixed(2);

  // Penentuan Grade otomatis
  let grade = "E";
  if (nilai_akhir >= 85) grade = "A";
  else if (nilai_akhir >= 75) grade = "B";
  else if (nilai_akhir >= 65) grade = "C";
  else if (nilai_akhir >= 50) grade = "D";

  try {
    const result = await pool.query(
      `INSERT INTO pkl_penilaian (
          submission_id, disiplin, teknis, komunikasi, laporan, presentasi,
          nilai_akhir, grade, catatan_guru, status_penilaian
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (submission_id)
       DO UPDATE SET
          disiplin = EXCLUDED.disiplin,
          teknis = EXCLUDED.teknis,
          komunikasi = EXCLUDED.komunikasi,
          laporan = EXCLUDED.laporan,
          presentasi = EXCLUDED.presentasi,
          nilai_akhir = EXCLUDED.nilai_akhir,
          grade = EXCLUDED.grade,
          catatan_guru = EXCLUDED.catatan_guru,
          status_penilaian = EXCLUDED.status_penilaian,
          updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        submission_id,
        disiplin,
        teknis,
        komunikasi,
        laporan,
        presentasi,
        nilai_akhir,
        grade,
        catatan_guru,
        status_penilaian,
      ],
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GET PENILAIAN BY SUBMISSION ID
// ============================================================
exports.getPenilaianById = async (req, res) => {
  const { submission_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT pp.*, s.nama_lengkap, ps.nama_perusahaan
       FROM pkl_penilaian pp
       JOIN pkl_submissions ps ON pp.submission_id = ps.id
       JOIN siswa s ON ps.siswa_id = s.id
       WHERE pp.submission_id = $1`,
      [submission_id],
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ message: "Data penilaian tidak ditemukan" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
