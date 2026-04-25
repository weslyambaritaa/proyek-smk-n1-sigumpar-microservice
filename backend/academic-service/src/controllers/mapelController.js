const pool = require("../config/db");

// --- KONTROLLER MATA PELAJARAN ---

exports.getAllMapel = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        mp.id,
        mp.nama_mapel,
        mp.kelas_id,
        mp.guru_mapel_id,
        mp.guru_mapel_nama,
        k.nama_kelas,
        k.tingkat
      FROM mata_pelajaran mp
      LEFT JOIN kelas k ON k.id = mp.kelas_id
      ORDER BY mp.nama_mapel ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllMapel error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createMapel = async (req, res) => {
  const { nama_mapel, kelas_id, guru_mapel_id, guru_mapel_nama } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO mata_pelajaran (
        nama_mapel,
        kelas_id,
        guru_mapel_id,
        guru_mapel_nama
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        nama_mapel,
        kelas_id || null,
        guru_mapel_id || null,
        guru_mapel_nama || null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createMapel error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateMapel = async (req, res) => {
  const { id } = req.params;
  const { nama_mapel, kelas_id, guru_mapel_id, guru_mapel_nama } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE mata_pelajaran
      SET
        nama_mapel = $1,
        kelas_id = $2,
        guru_mapel_id = $3,
        guru_mapel_nama = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        nama_mapel,
        kelas_id || null,
        guru_mapel_id || null,
        guru_mapel_nama || null,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Mata pelajaran tidak ditemukan" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateMapel error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMapelByGuru = async (req, res) => {
  const { guruId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        mp.id AS mapel_id,
        mp.nama_mapel,
        mp.kelas_id,
        mp.guru_mapel_id,
        mp.guru_mapel_nama,
        k.nama_kelas,
        k.tingkat
      FROM mata_pelajaran mp
      LEFT JOIN kelas k ON k.id = mp.kelas_id
      WHERE mp.guru_mapel_id = $1
      ORDER BY k.tingkat, k.nama_kelas, mp.nama_mapel
      `,
      [guruId],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getMapelByGuru error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMapel = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM mata_pelajaran WHERE id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Mata pelajaran tidak ditemukan" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("deleteMapel error:", err);
    res.status(500).json({ error: err.message });
  }
};
