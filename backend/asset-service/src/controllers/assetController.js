const pool = require("../config/db");

// ── PEMINJAMAN BARANG ────────────────────────────────────────────────────

exports.getAllPeminjaman = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM peminjaman_barang ORDER BY id DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPeminjaman = async (req, res) => {
  const { user_id, barang_id, tanggal_pinjam, keterangan } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO peminjaman_barang (user_id, barang_id, tanggal_pinjam, keterangan)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id || null, barang_id || null, tanggal_pinjam || new Date().toISOString().slice(0,10), keterangan || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePeminjaman = async (req, res) => {
  const { id } = req.params;
  const { status, keterangan } = req.body;
  try {
    const result = await pool.query(
      "UPDATE peminjaman_barang SET status=$1, keterangan=$2 WHERE id=$3 RETURNING *",
      [status || null, keterangan || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePeminjaman = async (req, res) => {
  try {
    await pool.query("DELETE FROM peminjaman_barang WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── PENGAJUAN ALAT/BARANG ────────────────────────────────────────────────

exports.getAllPengajuan = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pengajuan_alat_barang ORDER BY id DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPengajuan = async (req, res) => {
  const { user_id, nama_alat, jumlah, keterangan } = req.body;
  if (!nama_alat) return res.status(400).json({ error: "nama_alat wajib diisi" });
  try {
    const result = await pool.query(
      `INSERT INTO pengajuan_alat_barang (user_id, nama_alat, jumlah, keterangan)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id || null, nama_alat, jumlah || 1, keterangan || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePengajuan = async (req, res) => {
  const { id } = req.params;
  const { status, keterangan } = req.body;
  try {
    const result = await pool.query(
      "UPDATE pengajuan_alat_barang SET status=$1, keterangan=$2 WHERE id=$3 RETURNING *",
      [status || null, keterangan || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePengajuan = async (req, res) => {
  try {
    await pool.query("DELETE FROM pengajuan_alat_barang WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
