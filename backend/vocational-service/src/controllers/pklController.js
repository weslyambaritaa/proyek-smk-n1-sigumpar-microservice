const db = require('../config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const runUpload = (field) => (req, res) => new Promise((resolve, reject) => {
  upload.single(field)(req, res, (err) => (err ? reject(err) : resolve()));
});

exports.getLokasiPkl = async (_req, res) => {
  const result = await db.query('SELECT * FROM penempatan_pkl ORDER BY id DESC');
  res.json({ success: true, data: result.rows });
};
exports.createLokasiPkl = async (req, res) => {
  await runUpload('file')(req, res);
  const { nama_siswa, nama_perusahaan, alamat, posisi, deskripsi, pembimbing_industri, kontak_pembimbing, tanggal } = req.body;
  const result = await db.query(`INSERT INTO penempatan_pkl (nama_siswa,nama_perusahaan,alamat,posisi,deskripsi,pembimbing_industri,kontak_pembimbing,tanggal,foto_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [nama_siswa,nama_perusahaan,alamat,posisi,deskripsi,pembimbing_industri,kontak_pembimbing,tanggal || new Date().toISOString().slice(0,10), req.file?.originalname || null]);
  res.status(201).json({ success: true, data: result.rows[0] });
};
exports.getProgresPkl = async (_req, res) => {
  const result = await db.query('SELECT * FROM progres_pkl ORDER BY id DESC');
  res.json({ success: true, data: result.rows });
};
exports.createProgresPkl = async (req, res) => {
  await runUpload('file')(req, res);
  const { nama_siswa, tanggal, judul_pekerjaan, deskripsi, nilai_progress } = req.body;
  const result = await db.query(`INSERT INTO progres_pkl (nama_siswa,tanggal,judul_pekerjaan,deskripsi,nilai_progress,foto_bukti_url)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [nama_siswa, tanggal || new Date().toISOString().slice(0,10), judul_pekerjaan, deskripsi, nilai_progress || 0, req.file?.originalname || null]);
  res.status(201).json({ success: true, data: result.rows[0] });
};
exports.getDashboardPkl = async (_req, res) => {
  const [lokasi, progres] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS total FROM penempatan_pkl'),
    db.query('SELECT COUNT(*)::int AS total, COALESCE(ROUND(AVG(COALESCE(nilai_progress,0))),0)::int AS rata FROM progres_pkl'),
  ]);
  res.json({ success: true, data: { totalLokasi: lokasi.rows[0].total, totalLaporan: progres.rows[0].total, rataNilai: progres.rows[0].rata } });
};
