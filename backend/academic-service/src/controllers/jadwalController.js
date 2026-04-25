const pool = require("../config/db");

// --- KONTROLLER JADWAL MENGAJAR ---

exports.getAllJadwal = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        jm.id,
        jm.guru_id,
        jm.guru_nama,
        jm.kelas_id,
        jm.mapel_id,
        jm.mata_pelajaran,
        jm.hari,
        jm.waktu_mulai,
        jm.waktu_berakhir,
        k.nama_kelas,
        k.tingkat,
        mp.nama_mapel
      FROM jadwal_mengajar jm
      LEFT JOIN kelas k ON k.id = jm.kelas_id
      LEFT JOIN mata_pelajaran mp ON mp.id = jm.mapel_id
      ORDER BY
        CASE jm.hari
          WHEN 'Senin' THEN 1
          WHEN 'Selasa' THEN 2
          WHEN 'Rabu' THEN 3
          WHEN 'Kamis' THEN 4
          WHEN 'Jumat' THEN 5
          WHEN 'Sabtu' THEN 6
          ELSE 7
        END,
        jm.waktu_mulai ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllJadwal error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createJadwal = async (req, res) => {
  const {
    guru_id,
    guru_nama,
    kelas_id,
    mapel_id,
    mata_pelajaran,
    hari,
    waktu_mulai,
    waktu_berakhir,
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO jadwal_mengajar (
        guru_id,
        guru_nama,
        kelas_id,
        mapel_id,
        mata_pelajaran,
        hari,
        waktu_mulai,
        waktu_berakhir
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        guru_id || null,
        guru_nama || null,
        kelas_id || null,
        mapel_id || null,
        mata_pelajaran || null,
        hari || null,
        waktu_mulai || null,
        waktu_berakhir || null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createJadwal error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateJadwal = async (req, res) => {
  const { id } = req.params;
  const {
    guru_id,
    guru_nama,
    kelas_id,
    mapel_id,
    mata_pelajaran,
    hari,
    waktu_mulai,
    waktu_berakhir,
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE jadwal_mengajar
      SET
        guru_id = $1,
        guru_nama = $2,
        kelas_id = $3,
        mapel_id = $4,
        mata_pelajaran = $5,
        hari = $6,
        waktu_mulai = $7,
        waktu_berakhir = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
      `,
      [
        guru_id || null,
        guru_nama || null,
        kelas_id || null,
        mapel_id || null,
        mata_pelajaran || null,
        hari || null,
        waktu_mulai || null,
        waktu_berakhir || null,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateJadwal error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJadwal = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM jadwal_mengajar WHERE id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("deleteJadwal error:", err);
    res.status(500).json({ error: err.message });
  }
};
