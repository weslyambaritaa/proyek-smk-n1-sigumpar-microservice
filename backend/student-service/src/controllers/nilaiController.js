const {
  NilaiSiswa,
  Siswa,
  MataPelajaran,
  Kelas,
} = require("../models");
const {
  createError,
} = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");
const sequelize = require("../config/db");
const { QueryTypes, Op } = require("sequelize");

exports.getNilai = asyncHandler(async (req, res) => {
  const { mapel_id, kelas_id, tahun_ajar, search } = req.query;
  const where = {};
  if (mapel_id) where.mapel_id = mapel_id;
  if (kelas_id) where.kelas_id = kelas_id;
  if (tahun_ajar) where.tahun_ajar = tahun_ajar;

  const siswaWhere = search
    ? { nama_lengkap: { [Op.iLike]: `%${search}%` } }
    : undefined;

  const data = await NilaiSiswa.findAll({
    where,
    include: [
      {
        model: Siswa,
        as: "siswa",
        attributes: ["nisn", "nama_lengkap"],
        where: siswaWhere,
      },
      { model: MataPelajaran, as: "mapel", attributes: ["nama_mapel"] },
      { model: Kelas, as: "kelas", attributes: ["nama_kelas"] },
    ],
    order: [[{ model: Siswa, as: "siswa" }, "nama_lengkap", "ASC"]],
  });

  // Hitung nilai_akhir di JS (lebih portable daripada raw SQL ROUND)
  const enriched = data.map((n) => ({
    ...n.toJSON(),
    nilai_akhir: +(
      n.nilai_tugas * 0.15 +
      n.nilai_kuis * 0.15 +
      n.nilai_uts * 0.2 +
      n.nilai_uas * 0.3 +
      n.nilai_praktik * 0.2
    ).toFixed(2),
  }));

  res.json({ success: true, data: enriched });
});

exports.getSiswaByKelas = asyncHandler(async (req, res) => {
  const { kelas_id, mapel_id, tahun_ajar } = req.query;
  if (!kelas_id) throw createError(400, "kelas_id wajib diisi");

  // Tetap raw query karena LEFT JOIN kondisional + COALESCE kompleks
  const rows = await sequelize.query(
    `SELECT
       s.id AS siswa_id, s.nisn, s.nama_lengkap, k.nama_kelas,
       COALESCE(n.id, NULL)         AS nilai_id,
       COALESCE(n.mapel_id, NULL)   AS mapel_id,
       COALESCE(n.tahun_ajar, :tahun_ajar) AS tahun_ajar,
       COALESCE(n.nilai_tugas,   0) AS nilai_tugas,
       COALESCE(n.nilai_kuis,    0) AS nilai_kuis,
       COALESCE(n.nilai_uts,     0) AS nilai_uts,
       COALESCE(n.nilai_uas,     0) AS nilai_uas,
       COALESCE(n.nilai_praktik, 0) AS nilai_praktik,
       CASE WHEN n.id IS NOT NULL THEN
         ROUND((n.nilai_tugas*0.15 + n.nilai_kuis*0.15 + n.nilai_uts*0.20 + n.nilai_uas*0.30 + n.nilai_praktik*0.20)::numeric, 2)
       ELSE 0 END AS nilai_akhir
     FROM siswa s
     JOIN kelas k ON s.kelas_id = k.id
     LEFT JOIN nilai_siswa n
       ON n.siswa_id = s.id AND n.kelas_id = :kelas_id
       AND (:mapel_id::INTEGER IS NULL OR n.mapel_id = :mapel_id::INTEGER)
       AND (:tahun_ajar::VARCHAR IS NULL OR n.tahun_ajar = :tahun_ajar)
     WHERE s.kelas_id = :kelas_id
     ORDER BY s.nama_lengkap ASC`,
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

exports.saveNilaiBulk = asyncHandler(async (req, res) => {
  const { mapel_id, kelas_id, tahun_ajar, nilai } = req.body;
  if (!mapel_id || !kelas_id || !tahun_ajar || !Array.isArray(nilai)) {
    throw createError(
      400,
      "mapel_id, kelas_id, tahun_ajar, dan nilai[] wajib diisi",
    );
  }

  const results = await sequelize.transaction(async (t) => {
    const saved = [];
    for (const item of nilai) {
      const {
        siswa_id,
        nilai_tugas,
        nilai_kuis,
        nilai_uts,
        nilai_uas,
        nilai_praktik,
      } = item;
      const [row] = await sequelize.query(
        `INSERT INTO nilai_siswa (siswa_id, mapel_id, kelas_id, tahun_ajar, nilai_tugas, nilai_kuis, nilai_uts, nilai_uas, nilai_praktik, updated_at)
         VALUES (:siswa_id,:mapel_id,:kelas_id,:tahun_ajar,:nt,:nk,:nuts,:nuas,:np,NOW())
         ON CONFLICT (siswa_id, mapel_id, kelas_id, tahun_ajar)
         DO UPDATE SET nilai_tugas=EXCLUDED.nilai_tugas, nilai_kuis=EXCLUDED.nilai_kuis,
           nilai_uts=EXCLUDED.nilai_uts, nilai_uas=EXCLUDED.nilai_uas,
           nilai_praktik=EXCLUDED.nilai_praktik, updated_at=NOW()
         RETURNING *`,
        {
          replacements: {
            siswa_id,
            mapel_id,
            kelas_id,
            tahun_ajar,
            nt: +nilai_tugas || 0,
            nk: +nilai_kuis || 0,
            nuts: +nilai_uts || 0,
            nuas: +nilai_uas || 0,
            np: +nilai_praktik || 0,
          },
          type: QueryTypes.SELECT,
          transaction: t,
        },
      );
      saved.push(row);
    }
    return saved;
  });

  res.json({
    success: true,
    message: "Nilai berhasil disimpan",
    data: results,
  });
});

exports.updateNilai = asyncHandler(async (req, res) => {
  const { nilai_tugas, nilai_kuis, nilai_uts, nilai_uas, nilai_praktik } =
    req.body;
  if (
    [nilai_tugas, nilai_kuis, nilai_uts, nilai_uas, nilai_praktik].every(
      (v) => v === undefined,
    )
  ) {
    throw createError(400, "Minimal satu field nilai harus diisi");
  }

  const nilai = await NilaiSiswa.findByPk(req.params.id);
  if (!nilai) throw createError(404, "Nilai tidak ditemukan");

  await nilai.update({
    nilai_tugas,
    nilai_kuis,
    nilai_uts,
    nilai_uas,
    nilai_praktik,
    updated_at: new Date(),
  });
  res.json({ success: true, data: nilai });
});

exports.deleteNilai = asyncHandler(async (req, res) => {
  const nilai = await NilaiSiswa.findByPk(req.params.id);
  if (!nilai) throw createError(404, "Nilai tidak ditemukan");
  await nilai.destroy();
  res.json({ success: true, message: "Nilai berhasil dihapus" });
});

exports.exportNilaiExcel = asyncHandler(async (req, res) => {
  const { kelas_id, mapel_id, tahun_ajar } = req.query;

  const where = {};
  if (kelas_id) where.kelas_id = kelas_id;
  if (mapel_id) where.mapel_id = mapel_id;
  if (tahun_ajar) where.tahun_ajar = tahun_ajar;

  const rows = await NilaiSiswa.findAll({
    where,
    include: [
      { model: Siswa, as: "siswa", attributes: ["nisn", "nama_lengkap"] },
      { model: Kelas, as: "kelas", attributes: ["nama_kelas"] },
      { model: MataPelajaran, as: "mapel", attributes: ["nama_mapel"] },
    ],
    order: [[{ model: Siswa, as: "siswa" }, "nama_lengkap", "ASC"]],
  });

  const header = [
    "NISN",
    "Nama Siswa",
    "Kelas",
    "Mata Pelajaran",
    "Tahun Ajar",
    "Tugas",
    "Kuis",
    "UTS",
    "UAS",
    "Praktik",
    "Nilai Akhir",
  ];
  const csvRows = [header.join(",")];
  rows.forEach((n) => {
    const akhir = +(
      n.nilai_tugas * 0.15 +
      n.nilai_kuis * 0.15 +
      n.nilai_uts * 0.2 +
      n.nilai_uas * 0.3 +
      n.nilai_praktik * 0.2
    ).toFixed(2);
    csvRows.push(
      [
        n.siswa?.nisn,
        n.siswa?.nama_lengkap,
        n.kelas?.nama_kelas,
        n.mapel?.nama_mapel,
        n.tahun_ajar,
        n.nilai_tugas,
        n.nilai_kuis,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_praktik,
        akhir,
      ]
        .map((v) => `"${v ?? ""}"`)
        .join(","),
    );
  });

  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set(
    "Content-Disposition",
    `attachment; filename="rekap-nilai-${Date.now()}.csv"`,
  );
  res.send("\ufeff" + csvRows.join("\n"));
});
