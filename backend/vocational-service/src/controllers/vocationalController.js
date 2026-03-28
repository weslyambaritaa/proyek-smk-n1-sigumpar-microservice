const pool = require("../config/db");

// --- VALIDASI & PERSETUJUAN PKL ---
exports.validateAndApprovePKL = async (req, res) => {
  const { id } = req.params;
  const { status_validasi, keterangan_layak } = req.body;

  try {
    // Jika divalidasi 'validated', maka otomatis status_persetujuan menjadi 'approved' (Logic Include)
    const statusPersetujuan =
      status_validasi === "validated" ? "approved" : "pending";

    const result = await pool.query(
      `UPDATE pkl_submissions 
             SET status_validasi = $1, keterangan_layak = $2, status_persetujuan = $3 
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

// --- MONITORING & PROGRES SISWA ---
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

// --- REKAPITULASI PKL ---
exports.getAllPKL = async (req, res) => {
  const { nama } = req.query; // Fitur pencarian nama
  try {
    let query = `SELECT ps.*, s.nama_lengkap FROM pkl_submissions ps 
                     JOIN siswa s ON ps.siswa_id = s.id`;
    const params = [];

    if (nama) {
      query += ` WHERE s.nama_lengkap ILIKE $1`;
      params.push(`%${nama}%`);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Penilaaian PKL ---
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

  // Logika Perhitungan Nilai Akhir (Contoh Bobot Rata-rata)
  const nilai_akhir = (
    (parseInt(disiplin) +
      parseInt(teknis) +
      parseInt(komunikasi) +
      parseInt(laporan) +
      parseInt(presentasi)) /
    5
  ).toFixed(2);

  // Logika Penentuan Grade
  let grade = "E";
  if (nilai_akhir >= 85) grade = "A";
  else if (nilai_akhir >= 75) grade = "B";
  else if (nilai_akhir >= 65) grade = "C";
  else if (nilai_akhir >= 50) grade = "D";

  try {
    const query = `
            INSERT INTO pkl_penilaian (submission_id, disiplin, teknis, komunikasi, laporan, presentasi, nilai_akhir, grade, catatan_guru, status_penilaian)
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
            RETURNING *;
        `;

    const result = await pool.query(query, [
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
    ]);

    res.json({
      success: true,
      message:
        status_penilaian === "Simpan"
          ? "Nilai berhasil difinalisasi"
          : "Draft nilai disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mendapatkan Statistik Ringkasan (Box di bagian atas Mockup)
exports.getPenilaianStats = async (req, res) => {
  try {
    const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_siswa,
                COUNT(CASE WHEN status_penilaian = 'Simpan' THEN 1 END) as nilai_sudah_diisi,
                COUNT(CASE WHEN status_penilaian = 'Draft' OR status_penilaian IS NULL THEN 1 END) as nilai_belum_diisi,
                AVG(nilai_akhir)::NUMERIC(10,2) as rata_rata_nilai
            FROM pkl_submissions ps
            LEFT JOIN pkl_penilaian pp ON ps.id = pp.submission_id
        `);
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
