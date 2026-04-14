const pool = require('../config/db');

// ─── ANGGARAN ──────────────────────────────────────────────────────────────
exports.getAllAnggaran = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM anggaran ORDER BY tahun DESC, kategori');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createAnggaran = async (req, res) => {
  const { tahun, kategori, sub_kategori, jumlah_anggaran, deskripsi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO anggaran (tahun, kategori, sub_kategori, jumlah_anggaran, deskripsi) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tahun, kategori, sub_kategori, jumlah_anggaran, deskripsi]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAnggaran = async (req, res) => {
  const { id } = req.params;
  const { kategori, sub_kategori, jumlah_anggaran, jumlah_terpakai, deskripsi } = req.body;
  try {
    const result = await pool.query(
      'UPDATE anggaran SET kategori = $1, sub_kategori = $2, jumlah_anggaran = $3, jumlah_terpakai = $4, deskripsi = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [kategori, sub_kategori, jumlah_anggaran, jumlah_terpakai, deskripsi, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Anggaran not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteAnggaran = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM anggaran WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Anggaran not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};