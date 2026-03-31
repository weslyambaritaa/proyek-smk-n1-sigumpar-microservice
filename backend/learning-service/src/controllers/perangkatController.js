const pool = require("../config/db");

// 🪄 Fungsi untuk memastikan tabel ada (Mencegah error //sudah be di init.sql)
const ensureTableExists = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perangkat_pembelajaran (
        id SERIAL PRIMARY KEY, 
        guru_id UUID, 
        nama_perangkat VARCHAR(150), 
        file_url TEXT
      );
    `);
  } catch (err) {
    console.error("Gagal sinkronisasi tabel perangkat:", err.message);
  }
};

// Helper: Memetakan kolom DB lama ke format yang dibutuhkan Frontend
const mapRowToFrontend = (row) => {
  const [namaMapel, kelas] = (row.nama_perangkat || "||").split("||");
  let files = {};
  try { if (row.file_url) files = JSON.parse(row.file_url); } catch (e) {}

  return {
    id: row.id,
    id_perangkatPembelajaran: row.id,
    user_id: row.guru_id,
    namaMapel: namaMapel || row.nama_perangkat || "-",
    kelas: kelas || "-",
    uploadSilabus: files.uploadSilabus || null,
    uploadRPP: files.uploadRPP || null,
    modulAjar: files.modulAjar || null,
    created_at: new Date().toISOString()
  };
};

const getDashboardWakasek = async (req, res) => {
  await ensureTableExists();
  try {
    const result = await pool.query(`SELECT * FROM perangkat_pembelajaran ORDER BY id DESC`);
    const teachers = new Set(result.rows.map(r => r.guru_id));
    const mappedTerbaru = result.rows.slice(0, 5).map(mapRowToFrontend);

    res.json({
      success: true,
      data: {
        total_guru: teachers.size,
        unggahan_lengkap: 0, // Logic kelengkapan bisa ditambah nanti
        unggahan_belum_lengkap: teachers.size,
        unggahan_terbaru: mappedTerbaru,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDaftarGuruStatus = async (req, res) => {
  await ensureTableExists();
  try {
    const result = await pool.query(`SELECT DISTINCT guru_id FROM perangkat_pembelajaran`);
    const data = result.rows.map(row => ({
      user_id: row.guru_id,
      status_unggahan: "Check Detail"
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDetailGuruById = async (req, res) => {
  await ensureTableExists();
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT * FROM perangkat_pembelajaran WHERE guru_id = $1 ORDER BY id DESC`, 
      [userId]
    );
    res.json({
      success: true,
      data: {
        user_id: userId,
        data: result.rows.map(mapRowToFrontend)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ... Tambahkan fungsi CRUD Guru (create/delete) jika diperlukan ...

module.exports = { 
  getDashboardWakasek, 
  getDaftarGuruStatus, 
  getDetailGuruById 
};