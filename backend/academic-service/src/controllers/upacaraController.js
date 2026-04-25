const pool = require("../config/db");

// --- KONTROLLER JADWAL UPACARA ---

exports.getAllUpacara = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        tanggal,
        user_id,
        user_nama,
        tugas,
        keterangan,
        created_at,
        updated_at
      FROM jadwal_upacara
      ORDER BY tanggal DESC, id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllUpacara error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createUpacara = async (req, res) => {
  const { tanggal, user_id, user_nama, tugas, keterangan } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO jadwal_upacara (
        tanggal,
        user_id,
        user_nama,
        tugas,
        keterangan
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        tanggal,
        user_id || null,
        user_nama || null,
        tugas || null,
        keterangan || null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createUpacara error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateUpacara = async (req, res) => {
  const { id } = req.params;
  const { tanggal, user_id, user_nama, tugas, keterangan } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE jadwal_upacara
      SET
        tanggal = $1,
        user_id = $2,
        user_nama = $3,
        tugas = $4,
        keterangan = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        tanggal,
        user_id || null,
        user_nama || null,
        tugas || null,
        keterangan || null,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Jadwal upacara tidak ditemukan" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("updateUpacara error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUpacara = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM jadwal_upacara WHERE id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Jadwal upacara tidak ditemukan" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("deleteUpacara error:", err);
    res.status(500).json({ error: err.message });
  }
};
