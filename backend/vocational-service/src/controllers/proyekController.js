const pool = require('../config/db');

// ============================================================
// PROYEK VOKASI
// ============================================================

exports.getAllProyek = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pv.*,
        pk.nama_program,
        pk.kode_program,
        COUNT(pa.id) AS jumlah_anggota
      FROM proyek_vokasi pv
      LEFT JOIN program_keahlian pk ON pv.program_keahlian_id = pk.id
      LEFT JOIN proyek_anggota pa ON pv.id = pa.proyek_id
      GROUP BY pv.id, pk.nama_program, pk.kode_program
      ORDER BY pv.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProyekById = async (req, res) => {
  const { id } = req.params;
  try {
    const [proyek, anggota] = await Promise.all([
      pool.query(`
        SELECT pv.*, pk.nama_program, pk.kode_program
        FROM proyek_vokasi pv
        LEFT JOIN program_keahlian pk ON pv.program_keahlian_id = pk.id
        WHERE pv.id = $1
      `, [id]),
      pool.query('SELECT * FROM proyek_anggota WHERE proyek_id = $1 ORDER BY id', [id]),
    ]);

    if (proyek.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Proyek tidak ditemukan' });
    }

    res.json({
      success: true,
      data: { ...proyek.rows[0], anggota: anggota.rows }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createProyek = async (req, res) => {
  const {
    judul_proyek, deskripsi, program_keahlian_id,
    tahun_ajaran, semester, anggota
  } = req.body;

  const guru_id = req.user?.sub || null;
  const nama_guru = req.user?.name || req.user?.preferred_username || null;

  if (!judul_proyek) {
    return res.status(400).json({ success: false, message: 'Judul proyek wajib diisi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const proyekResult = await client.query(`
      INSERT INTO proyek_vokasi 
        (judul_proyek, deskripsi, program_keahlian_id, tahun_ajaran, semester, guru_pembimbing_id, nama_guru)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [judul_proyek, deskripsi, program_keahlian_id || null,
        tahun_ajaran, semester, guru_id, nama_guru]);

    const proyekId = proyekResult.rows[0].id;

    // Tambah anggota jika ada
    if (anggota && Array.isArray(anggota) && anggota.length > 0) {
      for (const a of anggota) {
        await client.query(`
          INSERT INTO proyek_anggota (proyek_id, siswa_id, nama_siswa, peran)
          VALUES ($1, $2, $3, $4)
        `, [proyekId, a.siswa_id, a.nama_siswa, a.peran || 'Anggota']);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: proyekResult.rows[0], message: 'Proyek berhasil dibuat' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

exports.updateProyek = async (req, res) => {
  const { id } = req.params;
  const { judul_proyek, deskripsi, program_keahlian_id, tahun_ajaran, semester, status } = req.body;

  try {
    const result = await pool.query(`
      UPDATE proyek_vokasi SET
        judul_proyek = $1, deskripsi = $2, program_keahlian_id = $3,
        tahun_ajaran = $4, semester = $5, status = COALESCE($6, status),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [judul_proyek, deskripsi, program_keahlian_id || null,
        tahun_ajaran, semester, status, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Proyek tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteProyek = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM proyek_vokasi WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Proyek tidak ditemukan' });
    }
    res.json({ success: true, message: 'Proyek berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// ANGGOTA PROYEK
// ============================================================

exports.getAnggotaProyek = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM proyek_anggota WHERE proyek_id = $1 ORDER BY id',
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addAnggotaProyek = async (req, res) => {
  const { id } = req.params;
  const { siswa_id, nama_siswa, peran } = req.body;

  if (!nama_siswa) {
    return res.status(400).json({ success: false, message: 'Nama siswa wajib diisi' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO proyek_anggota (proyek_id, siswa_id, nama_siswa, peran)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, siswa_id, nama_siswa, peran || 'Anggota']);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteAnggotaProyek = async (req, res) => {
  const { anggotaId } = req.params;
  try {
    await pool.query('DELETE FROM proyek_anggota WHERE id = $1', [anggotaId]);
    res.json({ success: true, message: 'Anggota berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
