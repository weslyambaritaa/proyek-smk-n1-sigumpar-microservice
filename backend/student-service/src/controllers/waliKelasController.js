const {
  ParentingLog,
  Kelas,
  NilaiSiswa,
  Siswa,
  MataPelajaran,
  AbsensiSiswa,
} = require("../../../academic-service/src/models");
const {
  createError,
} = require("../../../academic-service/src/middleware/errorHandler");
const asyncHandler = require("../../../academic-service/src/utils/asyncHandler");
const sequelize = require("../../../academic-service/src/config/db");
const { QueryTypes } = require("sequelize");

// ─── PARENTING ─────────────────────────────────────────────────────────────

exports.getParenting = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.kelas_id) where.kelas_id = req.query.kelas_id;
  if (req.query.wali_id) where.wali_id = req.query.wali_id;

  const data = await ParentingLog.findAll({
    where,
    include: [
      {
        model: Kelas,
        foreignKey: "kelas_id",
        as: "kelas",
        attributes: ["nama_kelas"],
      },
    ],
    order: [
      ["tanggal", "DESC"],
      ["id", "DESC"],
    ],
  });
  res.json({ success: true, data });
});

exports.createParenting = asyncHandler(async (req, res) => {
  const { tanggal, kehadiran_ortu, agenda, ringkasan, kelas_id, wali_id } =
    req.body;
  if (!agenda) throw createError(400, "Field agenda wajib diisi");

  const foto_url = req.file
    ? `/api/academic/uploads/${req.file.filename}`
    : null;
  const data = await ParentingLog.create({
    kelas_id: kelas_id || null,
    wali_id: wali_id || null,
    tanggal: tanggal || new Date().toISOString().slice(0, 10),
    kehadiran_ortu: kehadiran_ortu || 0,
    agenda,
    ringkasan: ringkasan || "",
    foto_url,
  });
  res.status(201).json({ success: true, data });
});

// ─── KEBERSIHAN KELAS ─────────────────────────────────────────────────────

exports.getKebersihan = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.kelas_id) where.kelas_id = req.query.kelas_id;

  const { KebersijanKelas } = require("../../../academic-service/src/models"); // lazy require karena model belum ditambahkan
  // Fallback: raw query jika model belum ada
  const rows = await sequelize.query(
    `SELECT * FROM kebersihan_kelas ${req.query.kelas_id ? "WHERE kelas_id = :kelas_id" : ""} ORDER BY tanggal DESC, id DESC`,
    { replacements: { kelas_id: req.query.kelas_id }, type: QueryTypes.SELECT },
  );
  res.json({ success: true, data: rows });
});

exports.createKebersihan = asyncHandler(async (req, res) => {
  const { kelas_id, tanggal, penilaian, catatan } = req.body;
  const foto_url = req.file
    ? `/api/academic/uploads/${req.file.filename}`
    : null;

  const [rows] = await sequelize.query(
    `INSERT INTO kebersihan_kelas (kelas_id, tanggal, penilaian, catatan, foto_url)
     VALUES (:kelas_id, :tanggal, :penilaian::jsonb, :catatan, :foto_url) RETURNING *`,
    {
      replacements: {
        kelas_id: kelas_id || null,
        tanggal: tanggal || new Date().toISOString().slice(0, 10),
        penilaian: penilaian ? JSON.stringify(penilaian) : "{}",
        catatan: catatan || "",
        foto_url,
      },
      type: QueryTypes.SELECT,
    },
  );
  res.status(201).json({ success: true, data: rows });
});

// ─── REFLEKSI ──────────────────────────────────────────────────────────────

exports.getRefleksi = asyncHandler(async (req, res) => {
  const conditions = [];
  const replacements = {};
  if (req.query.kelas_id) {
    conditions.push("kelas_id = :kelas_id");
    replacements.kelas_id = req.query.kelas_id;
  }
  if (req.query.wali_id) {
    conditions.push("wali_id = :wali_id");
    replacements.wali_id = req.query.wali_id;
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await sequelize.query(
    `SELECT * FROM refleksi_wali_kelas ${where} ORDER BY tanggal DESC, id DESC`,
    { replacements, type: QueryTypes.SELECT },
  );
  res.json({ success: true, data: rows });
});

exports.createRefleksi = asyncHandler(async (req, res) => {
  const { kelas_id, wali_id, tanggal, capaian, tantangan, rencana } = req.body;
  if (!capaian && !tantangan && !rencana)
    throw createError(
      400,
      "Minimal satu dari capaian, tantangan, atau rencana harus diisi",
    );

  const [rows] = await sequelize.query(
    `INSERT INTO refleksi_wali_kelas (kelas_id, wali_id, tanggal, capaian, tantangan, rencana)
     VALUES (:kelas_id, :wali_id, :tanggal, :capaian, :tantangan, :rencana) RETURNING *`,
    {
      replacements: {
        kelas_id: kelas_id || null,
        wali_id: wali_id || null,
        tanggal: tanggal || new Date().toISOString().slice(0, 10),
        capaian: capaian || "",
        tantangan: tantangan || "",
        rencana: rencana || "",
      },
      type: QueryTypes.SELECT,
    },
  );
  res.status(201).json({ success: true, data: rows });
});

// ─── REKAP NILAI & ABSENSI (raw query tetap — kompleks) ───────────────────

exports.getRekapNilaiWali = asyncHandler(async (req, res) => {
  const { kelas_id, mapel_id, tahun_ajar } = req.query;
  if (!kelas_id) throw createError(400, "kelas_id wajib diisi");

  const rows = await sequelize.query(
    `SELECT s.id AS siswa_id, s.nisn, s.nama_lengkap, k.nama_kelas, m.nama_mapel,
       n.mapel_id, n.tahun_ajar,
       COALESCE(n.nilai_tugas,0) AS nilai_tugas, COALESCE(n.nilai_kuis,0) AS nilai_kuis,
       COALESCE(n.nilai_uts,0) AS nilai_uts, COALESCE(n.nilai_uas,0) AS nilai_uas,
       COALESCE(n.nilai_praktik,0) AS nilai_praktik,
       CASE WHEN n.id IS NOT NULL THEN
         ROUND((n.nilai_tugas*0.15+n.nilai_kuis*0.15+n.nilai_uts*0.20+n.nilai_uas*0.30+n.nilai_praktik*0.20)::numeric,2)
       ELSE 0 END AS nilai_akhir
     FROM siswa s JOIN kelas k ON s.kelas_id=k.id
     LEFT JOIN nilai_siswa n ON n.siswa_id=s.id AND n.kelas_id=:kelas_id
       AND (:mapel_id::INTEGER IS NULL OR n.mapel_id=:mapel_id::INTEGER)
       AND (:tahun_ajar::VARCHAR IS NULL OR n.tahun_ajar=:tahun_ajar)
     LEFT JOIN mata_pelajaran m ON n.mapel_id=m.id
     WHERE s.kelas_id=:kelas_id ORDER BY s.nama_lengkap ASC, m.nama_mapel ASC`,
    {
      replacements: {
        kelas_id,
        mapel_id: mapel_id || null,
        tahun_ajar: tahun_ajar || null,
      },
      type: QueryTypes.SELECT,
    },
  );
  res.json({ success: true, data: rows });
});

exports.getRekapAbsensiWali = asyncHandler(async (req, res) => {
  const { kelas_id, bulan, tahun } = req.query;
  if (!kelas_id) throw createError(400, "kelas_id wajib diisi");

  const rows = await sequelize.query(
    `SELECT s.id AS siswa_id, s.nisn, s.nama_lengkap, k.nama_kelas,
       COUNT(CASE WHEN ab.status='hadir'     THEN 1 END) AS hadir,
       COUNT(CASE WHEN ab.status='sakit'     THEN 1 END) AS sakit,
       COUNT(CASE WHEN ab.status='izin'      THEN 1 END) AS izin,
       COUNT(CASE WHEN ab.status='alpa'      THEN 1 END) AS alpa,
       COUNT(CASE WHEN ab.status='terlambat' THEN 1 END) AS terlambat,
       COUNT(ab.id) AS total_pertemuan
     FROM siswa s JOIN kelas k ON s.kelas_id=k.id
     LEFT JOIN absensi_siswa ab ON ab.siswa_id=s.id
       AND (:bulan::INTEGER IS NULL OR EXTRACT(MONTH FROM ab.tanggal)=:bulan)
       AND (:tahun::INTEGER IS NULL OR EXTRACT(YEAR  FROM ab.tanggal)=:tahun)
     WHERE s.kelas_id=:kelas_id
     GROUP BY s.id, s.nisn, s.nama_lengkap, k.nama_kelas ORDER BY s.nama_lengkap ASC`,
    {
      replacements: {
        kelas_id,
        bulan: bulan ? +bulan : null,
        tahun: tahun ? +tahun : null,
      },
      type: QueryTypes.SELECT,
    },
  );
  res.json({ success: true, data: rows });
});
