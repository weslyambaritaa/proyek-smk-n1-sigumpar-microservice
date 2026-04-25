const pool = require("../config/db");

// --- KONTROLLER JADWAL PIKET ---

exports.getAllPiket = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        tanggal,
        user_id,
        user_nama,
        keterangan,
        created_at,
        updated_at
      FROM jadwal_piket
      ORDER BY tanggal DESC, id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllPiket error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createPiket = async (req, res) => {
  const { tanggal, user_id, user_nama, keterangan } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO jadwal_piket (
        tanggal,
        user_id,
        user_nama,
        keterangan
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [tanggal, user_id || null, user_nama || null, keterangan || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createPiket error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updatePiket = async (req, res) => {
  const { id } = req.params;
  const { tanggal, user_id, user_nama, keterangan } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE jadwal_piket
      SET
        tanggal = $1,
        user_id = $2,
        user_nama = $3,
        keterangan = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [tanggal, user_id || null, user_nama || null, keterangan || null, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updatePiket error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deletePiket = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM jadwal_piket WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Jadwal piket tidak ditemukan" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("deletePiket error:", err);
    res.status(500).json({ error: err.message });
  }
};
