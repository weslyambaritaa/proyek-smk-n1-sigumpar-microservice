const pool = require('../config/db');

// ============================================================
// NILAI KOMPETENSI KEJURUAN
// ============================================================

exports.getAllNilai = async (req, res) => {
  const { tahun_ajaran, semester, program_keahlian_id } = req.query;

  try {
    let query = `
      SELECT nk.*, pk.nama_program, pk.kode_program
      FROM nilai_kompetensi nk
      LEFT JOIN program_keahlian pk ON nk.program_keahlian_id = pk.id
      WHERE 1=1
    `;
    const params = [];

    if (tahun_ajaran) {
      params.push(tahun_ajaran);
      query += ` AND nk.tahun_ajaran = $${params.length}`;
    }
    if (semester) {
      params.push(semester);
      query += ` AND nk.semester = $${params.length}`;
    }
    if (program_keahlian_id) {
      params.push(program_keahlian_id);
      query += ` AND nk.program_keahlian_id = $${params.length}`;
    }

    query += ' ORDER BY nk.nama_siswa';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getNilaiById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT nk.*, pk.nama_program 
      FROM nilai_kompetensi nk
      LEFT JOIN program_keahlian pk ON nk.program_keahlian_id = pk.id
      WHERE nk.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data nilai tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createNilai = async (req, res) => {
  const {
    siswa_id, nama_siswa, program_keahlian_id, kelas,
    tahun_ajaran, semester, aspek_teori, aspek_praktik,
    aspek_sikap, catatan
  } = req.body;

  const guru_id = req.user?.sub || null;
  const nama_guru = req.user?.name || req.user?.preferred_username || null;

  if (!nama_siswa) {
    return res.status(400).json({ success: false, message: 'Nama siswa wajib diisi' });
  }

  // Auto-hitung predikat berdasarkan nilai akhir yang di-generate DB
  const nilaiAkhirCalc = (aspek_teori * 0.3) + (aspek_praktik * 0.5) + (aspek_sikap * 0.2);
  let predikat = 'E';
  if (nilaiAkhirCalc >= 90) predikat = 'A';
  else if (nilaiAkhirCalc >= 80) predikat = 'B';
  else if (nilaiAkhirCalc >= 70) predikat = 'C';
  else if (nilaiAkhirCalc >= 60) predikat = 'D';

  try {
    const result = await pool.query(`
      INSERT INTO nilai_kompetensi 
        (siswa_id, nama_siswa, program_keahlian_id, kelas, tahun_ajaran,
         semester, aspek_teori, aspek_praktik, aspek_sikap, predikat,
         catatan, guru_id, nama_guru)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `, [siswa_id, nama_siswa, program_keahlian_id || null, kelas,
        tahun_ajaran, semester, aspek_teori || 0, aspek_praktik || 0,
        aspek_sikap || 0, predikat, catatan, guru_id, nama_guru]);

    res.status(201).json({ success: true, data: result.rows[0], message: 'Nilai berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateNilai = async (req, res) => {
  const { id } = req.params;
  const {
    aspek_teori, aspek_praktik, aspek_sikap, catatan,
    tahun_ajaran, semester
  } = req.body;

  const nilaiAkhirCalc = (aspek_teori * 0.3) + (aspek_praktik * 0.5) + (aspek_sikap * 0.2);
  let predikat = 'E';
  if (nilaiAkhirCalc >= 90) predikat = 'A';
  else if (nilaiAkhirCalc >= 80) predikat = 'B';
  else if (nilaiAkhirCalc >= 70) predikat = 'C';
  else if (nilaiAkhirCalc >= 60) predikat = 'D';

  try {
    const result = await pool.query(`
      UPDATE nilai_kompetensi SET
        aspek_teori  = $1,
        aspek_praktik= $2,
        aspek_sikap  = $3,
        predikat     = $4,
        catatan      = $5,
        tahun_ajaran = $6,
        semester     = $7,
        updated_at   = NOW()
      WHERE id = $8
      RETURNING *
    `, [aspek_teori, aspek_praktik, aspek_sikap, predikat, catatan, tahun_ajaran, semester, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data nilai tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteNilai = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM nilai_kompetensi WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Data nilai tidak ditemukan' });
    }
    res.json({ success: true, message: 'Data nilai berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
