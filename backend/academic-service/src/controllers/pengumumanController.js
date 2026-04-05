const pool = require("../config/db");

// ==========================================
// --- KONTROLLER PENGUMUMAN ---
// ==========================================

// Get All Pengumuman
exports.getAllPengumuman = async (req, res) => {
  try {
    // Mengambil data pengumuman dan mengurutkannya dari yang paling baru
    const result = await pool.query(
      "SELECT * FROM pengumuman ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Pengumuman
exports.createPengumuman = async (req, res) => {
  const { judul, isi } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO pengumuman (judul, isi) VALUES ($1, $2) RETURNING *",
      [judul, isi],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Pengumuman
exports.updatePengumuman = async (req, res) => {
  const { id } = req.params;
  const { judul, isi } = req.body;
  try {
    const result = await pool.query(
      "UPDATE pengumuman SET judul = $1, isi = $2 WHERE id = $3 RETURNING *",
      [judul, isi, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Pengumuman tidak ditemukan" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Pengumuman
exports.deletePengumuman = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM pengumuman WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Pengumuman tidak ditemukan" });
    }

    res.json({ message: "Pengumuman berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
