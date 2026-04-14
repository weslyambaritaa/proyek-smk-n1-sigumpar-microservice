const pool = require('../config/db');

// ─── INFORMASI PENGAJUAN ───────────────────────────────────────────────────
exports.getInformasiPengajuan = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM informasi_pengajuan ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createInformasiPengajuan = async (req, res) => {
  const { judul, deskripsi, pengaju_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO informasi_pengajuan (judul, deskripsi, pengaju_id) VALUES ($1, $2, $3) RETURNING *',
      [judul, deskripsi, pengaju_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PEMINJAMAN BARANG ─────────────────────────────────────────────────────
exports.getPeminjamanBarang = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM peminjaman_barang ORDER BY tanggal_pinjam DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPeminjamanBarang = async (req, res) => {
  const { barang_id, peminjam_id, tanggal_pinjam, tanggal_kembali, jumlah } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO peminjaman_barang (barang_id, peminjam_id, tanggal_pinjam, tanggal_kembali, jumlah) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [barang_id, peminjam_id, tanggal_pinjam, tanggal_kembali, jumlah]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PENGAJUAN ALAT/BARANG ─────────────────────────────────────────────────
exports.getPengajuanAlatBarang = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pengajuan_alat_barang ORDER BY tanggal_pengajuan DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPengajuanAlatBarang = async (req, res) => {
  const { nama_barang, jumlah, alasan, pengaju_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pengajuan_alat_barang (nama_barang, jumlah, alasan, pengaju_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nama_barang, jumlah, alasan, pengaju_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── RESPON PEMINJAMAN (Approval) ──────────────────────────────────────────
exports.getResponPeminjaman = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM respon_peminjaman ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createResponPeminjaman = async (req, res) => {
  const { peminjaman_id, approver_id, status, catatan } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO respon_peminjaman (peminjaman_id, approver_id, status, catatan) VALUES ($1, $2, $3, $4) RETURNING *',
      [peminjaman_id, approver_id, status, catatan]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── RESPON PENGAJUAN BENDAHARA ────────────────────────────────────────────
exports.getResponPengajuanBendahara = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM respon_pengajuan_bendahara ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createResponPengajuanBendahara = async (req, res) => {
  const { pengajuan_id, bendahara_id, status, catatan } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO respon_pengajuan_bendahara (pengajuan_id, bendahara_id, status, catatan) VALUES ($1, $2, $3, $4) RETURNING *',
      [pengajuan_id, bendahara_id, status, catatan]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── RESPON PENGAJUAN KEPSEK ───────────────────────────────────────────────
exports.getResponPengajuanKepsek = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM respon_pengajuan_kepsek ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createResponPengajuanKepsek = async (req, res) => {
  const { pengajuan_id, kepsek_id, status, catatan } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO respon_pengajuan_kepsek (pengajuan_id, kepsek_id, status, catatan) VALUES ($1, $2, $3, $4) RETURNING *',
      [pengajuan_id, kepsek_id, status, catatan]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── INVENTORY ─────────────────────────────────────────────────────────────
exports.getInventory = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createInventory = async (req, res) => {
  const { nama_barang, kategori, jumlah, kondisi, lokasi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO inventory (nama_barang, kategori, jumlah, kondisi, lokasi) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nama_barang, kategori, jumlah, kondisi, lokasi]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  const { id } = req.params;
  const { nama_barang, kategori, jumlah, kondisi, lokasi } = req.body;
  try {
    const result = await pool.query(
      'UPDATE inventory SET nama_barang = $1, kategori = $2, jumlah = $3, kondisi = $4, lokasi = $5 WHERE id = $6 RETURNING *',
      [nama_barang, kategori, jumlah, kondisi, lokasi, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};