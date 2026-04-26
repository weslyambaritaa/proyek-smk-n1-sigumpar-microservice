const pool = require("../config/db");

// --- KONTROLLER KELAS ---

exports.getAllKelas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nama_kelas,
        tingkat,
        wali_kelas_id,
        wali_kelas_nama
      FROM kelas
      ORDER BY tingkat, nama_kelas
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllKelas error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getKelasById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        nama_kelas,
        tingkat,
        wali_kelas_id,
        wali_kelas_nama
      FROM kelas
      WHERE id = $1
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getKelasById error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createKelas = async (req, res) => {
  const { nama_kelas, tingkat, wali_kelas_id, wali_kelas_nama } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO kelas (
        nama_kelas,
        tingkat,
        wali_kelas_id,
        wali_kelas_nama
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [nama_kelas, tingkat, wali_kelas_id || null, wali_kelas_nama || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createKelas error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateKelas = async (req, res) => {
  const { id } = req.params;
  const { nama_kelas, tingkat, wali_kelas_id, wali_kelas_nama } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE kelas
      SET
        nama_kelas = $1,
        tingkat = $2,
        wali_kelas_id = $3,
        wali_kelas_nama = $4
      WHERE id = $5
      RETURNING *
      `,
      [nama_kelas, tingkat, wali_kelas_id || null, wali_kelas_nama || null, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateKelas error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getKelasByWali = async (req, res) => {
  const { waliId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        nama_kelas,
        tingkat,
        wali_kelas_id
      FROM kelas
      WHERE wali_kelas_id = $1
      ORDER BY tingkat ASC, nama_kelas ASC
      `,
      [waliId],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getKelasByWali error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteKelas = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM kelas WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("deleteKelas error:", err);
    res.status(500).json({ error: err.message });
  }
};
