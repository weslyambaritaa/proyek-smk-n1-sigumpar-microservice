const db = require("../config/db");
const multer = require("multer");

// ── Upload middleware ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowed.includes(file.mimetype)) cb(null, true);
    else
      cb(new Error("Hanya file PDF, DOCX/DOC, dan gambar yang diperbolehkan"));
  },
});

const runMulter = (field) => (req, res) =>
  new Promise((resolve, reject) => {
    upload.single(field)(req, res, (err) => (err ? reject(err) : resolve()));
  });

// ── ABSENSI PRAMUKA ─────────────────────────────────────────────

exports.submitAbsensiPramuka = async (req, res) => {
  const { kelas_id, tanggal, deskripsi, file_url, data_absensi } = req.body;

  if (!kelas_id || !tanggal || !Array.isArray(data_absensi)) {
    return res.status(400).json({
      success: false,
      error: "kelas_id, tanggal, dan data_absensi wajib diisi",
    });
  }

  const kelasId = Number(kelas_id);

  if (!Number.isInteger(kelasId)) {
    return res.status(400).json({
      success: false,
      error: "kelas_id harus berupa angka",
    });
  }

  const createdBy = req.user?.id || req.userId || null;

  try {
    await db.query(
      `
      INSERT INTO laporan_pramuka 
        (kelas_id, tanggal, deskripsi, file_url, created_by)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [kelasId, tanggal, deskripsi || "", file_url || "", createdBy],
    );

    for (const item of data_absensi) {
      const { siswa_id, nama_lengkap, nisn, status, keterangan } = item;

      const siswaId = Number(siswa_id);
      const cleanStatus = String(status || "").toLowerCase();

      if (!Number.isInteger(siswaId)) {
        throw new Error(`siswa_id tidak valid: ${siswa_id}`);
      }

      if (!["hadir", "izin", "sakit", "alpa"].includes(cleanStatus)) {
        throw new Error(
          `Status absensi siswa ${nama_lengkap || siswa_id} belum valid`,
        );
      }

      await db.query(
        `
        INSERT INTO absensi_pramuka 
          (
            kelas_id,
            siswa_id,
            tanggal,
            status,
            nama_lengkap,
            nisn,
            keterangan,
            created_by,
            updated_at
          )
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (kelas_id, siswa_id, tanggal)
        DO UPDATE SET
          status = EXCLUDED.status,
          nama_lengkap = EXCLUDED.nama_lengkap,
          nisn = EXCLUDED.nisn,
          keterangan = EXCLUDED.keterangan,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          kelasId,
          siswaId,
          tanggal,
          cleanStatus,
          nama_lengkap || "",
          nisn || null,
          keterangan || "",
          createdBy,
        ],
      );
    }

    return res.status(200).json({
      success: true,
      message: "Absensi pramuka berhasil disimpan",
    });
  } catch (err) {
    console.error("[submitAbsensiPramuka]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getAbsensiPramuka = async (req, res) => {
  const { kelas_id, tanggal, tanggal_mulai, tanggal_akhir } = req.query;

  try {
    let query = `
      SELECT 
        ap.id,
        ap.kelas_id,
        ap.siswa_id,
        ap.nama_lengkap,
        ap.nisn,
        ap.tanggal,
        ap.status,
        ap.keterangan,
        ap.created_by,
        ap.created_at,
        ap.updated_at
      FROM absensi_pramuka ap
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;

    if (kelas_id) {
      query += ` AND ap.kelas_id = $${idx++}`;
      params.push(Number(kelas_id));
    }

    if (tanggal) {
      query += ` AND ap.tanggal = $${idx++}`;
      params.push(tanggal);
    }

    if (tanggal_mulai) {
      query += ` AND ap.tanggal >= $${idx++}`;
      params.push(tanggal_mulai);
    }

    if (tanggal_akhir) {
      query += ` AND ap.tanggal <= $${idx++}`;
      params.push(tanggal_akhir);
    }

    query += ` ORDER BY ap.tanggal DESC, ap.nama_lengkap ASC, ap.id ASC`;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getAbsensiPramuka]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getRekapAbsensiPramuka = async (req, res) => {
  const { kelas_id, tanggal_mulai, tanggal_akhir } = req.query;

  if (!kelas_id) {
    return res.status(400).json({
      success: false,
      error: "kelas_id wajib diisi",
    });
  }

  try {
    const result = await db.query(
      `
      SELECT
        ap.siswa_id,
        MAX(ap.nama_lengkap) AS nama_lengkap,
        MAX(ap.nisn) AS nisn,
        COUNT(CASE WHEN ap.status = 'hadir' THEN 1 END)::INT AS hadir,
        COUNT(CASE WHEN ap.status = 'izin' THEN 1 END)::INT AS izin,
        COUNT(CASE WHEN ap.status = 'sakit' THEN 1 END)::INT AS sakit,
        COUNT(CASE WHEN ap.status = 'alpa' THEN 1 END)::INT AS alpa,
        COUNT(ap.id)::INT AS total
      FROM absensi_pramuka ap
      WHERE ap.kelas_id = $1
        AND ($2::DATE IS NULL OR ap.tanggal >= $2)
        AND ($3::DATE IS NULL OR ap.tanggal <= $3)
      GROUP BY ap.siswa_id
      ORDER BY MAX(ap.nama_lengkap) ASC
      `,
      [Number(kelas_id), tanggal_mulai || null, tanggal_akhir || null],
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getRekapAbsensiPramuka]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ── SILABUS / PERANGKAT KEGIATAN PRAMUKA ─────────────────────────────

exports.getAllSilabus = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        id,
        kelas_id,
        nama_kelas,
        judul_kegiatan,
        tanggal,
        file_nama,
        file_mime,
        created_by,
        to_char(created_at, 'YYYY-MM-DD') AS created_at,
        to_char(updated_at, 'YYYY-MM-DD') AS updated_at
      FROM silabus_pramuka
      ORDER BY tanggal DESC, id DESC
      `,
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getAllSilabus]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createSilabus = async (req, res) => {
  try {
    await runMulter("file")(req, res);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  const { kelas_id, nama_kelas, judul_kegiatan, tanggal } = req.body;

  if (!kelas_id) {
    return res.status(400).json({
      success: false,
      error: "Kelas wajib dipilih",
    });
  }

  if (!judul_kegiatan || !String(judul_kegiatan).trim()) {
    return res.status(400).json({
      success: false,
      error: "judul_kegiatan wajib diisi",
    });
  }

  const kelasId = Number(kelas_id);

  if (!Number.isInteger(kelasId)) {
    return res.status(400).json({
      success: false,
      error: "kelas_id harus berupa angka",
    });
  }

  const fileData = req.file ? req.file.buffer : null;
  const fileMime = req.file ? req.file.mimetype : null;
  const fileNama = req.file ? req.file.originalname : null;
  const createdBy = req.user?.id || req.userId || null;

  try {
    const result = await db.query(
      `
      INSERT INTO silabus_pramuka (
        kelas_id,
        nama_kelas,
        judul_kegiatan,
        tanggal,
        file_data,
        file_mime,
        file_nama,
        created_by,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        kelas_id,
        nama_kelas,
        judul_kegiatan,
        tanggal,
        file_nama,
        file_mime,
        created_by,
        to_char(created_at, 'YYYY-MM-DD') AS created_at,
        to_char(updated_at, 'YYYY-MM-DD') AS updated_at
      `,
      [
        kelasId,
        nama_kelas || null,
        String(judul_kegiatan).trim(),
        tanggal || new Date().toISOString().slice(0, 10),
        fileData,
        fileMime,
        fileNama,
        createdBy,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Silabus/perangkat kegiatan berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[createSilabus]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.downloadSilabus = async (req, res) => {
  const isView = req.path.endsWith("/view");

  try {
    const result = await db.query(
      `
      SELECT file_nama, file_data, file_mime
      FROM silabus_pramuka
      WHERE id = $1
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Silabus/perangkat kegiatan tidak ditemukan",
      });
    }

    const doc = result.rows[0];

    if (!doc.file_data) {
      return res.status(404).json({
        success: false,
        error: "File tidak tersedia",
      });
    }

    const mime = doc.file_mime || "application/octet-stream";
    const fileName = doc.file_nama || "silabus";

    const inlineTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    const disposition =
      isView && inlineTypes.includes(mime) ? "inline" : "attachment";

    res.setHeader("Content-Type", mime);
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${encodeURIComponent(fileName)}"`,
    );

    res.send(doc.file_data);
  } catch (err) {
    console.error("[downloadSilabus]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteSilabus = async (req, res) => {
  try {
    const result = await db.query(
      `
      DELETE FROM silabus_pramuka
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Silabus/perangkat kegiatan tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Silabus/perangkat kegiatan berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteSilabus]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ── LAPORAN KEGIATAN PRAMUKA ───────────────────────────────────

exports.getAllLaporanKegiatan = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        id,
        judul,
        deskripsi,
        tanggal,
        file_nama,
        file_mime,
        created_by,
        to_char(created_at, 'YYYY-MM-DD') AS created_at,
        to_char(updated_at, 'YYYY-MM-DD') AS updated_at
      FROM laporan_kegiatan
      ORDER BY tanggal DESC, id DESC
      `,
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getAllLaporanKegiatan]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createLaporanKegiatan = async (req, res) => {
  try {
    await runMulter("file_laporan")(req, res);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  const { judul, deskripsi, tanggal } = req.body;

  if (!judul || !String(judul).trim()) {
    return res.status(400).json({
      success: false,
      error: "Judul laporan wajib diisi",
    });
  }

  const fileData = req.file ? req.file.buffer : null;
  const fileMime = req.file ? req.file.mimetype : null;
  const fileNama = req.file ? req.file.originalname : null;
  const createdBy = req.user?.id || req.userId || null;

  try {
    const result = await db.query(
      `
      INSERT INTO laporan_kegiatan (
        judul,
        deskripsi,
        tanggal,
        file_data,
        file_mime,
        file_nama,
        created_by,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        judul,
        deskripsi,
        tanggal,
        file_nama,
        file_mime,
        created_by,
        to_char(created_at, 'YYYY-MM-DD') AS created_at,
        to_char(updated_at, 'YYYY-MM-DD') AS updated_at
      `,
      [
        String(judul).trim(),
        deskripsi || "",
        tanggal || new Date().toISOString().slice(0, 10),
        fileData,
        fileMime,
        fileNama,
        createdBy,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Laporan kegiatan berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[createLaporanKegiatan]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.downloadLaporanKegiatan = async (req, res) => {
  const isView = req.path.endsWith("/view");

  try {
    const result = await db.query(
      `
      SELECT file_nama, file_data, file_mime
      FROM laporan_kegiatan
      WHERE id = $1
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Laporan kegiatan tidak ditemukan",
      });
    }

    const doc = result.rows[0];

    if (!doc.file_data) {
      return res.status(404).json({
        success: false,
        error: "File tidak tersedia",
      });
    }

    const mime = doc.file_mime || "application/octet-stream";
    const fileName = doc.file_nama || "laporan-kegiatan";

    const inlineTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    const disposition =
      isView && inlineTypes.includes(mime) ? "inline" : "attachment";

    res.setHeader("Content-Type", mime);
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${encodeURIComponent(fileName)}"`,
    );

    res.send(doc.file_data);
  } catch (err) {
    console.error("[downloadLaporanKegiatan]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteLaporanKegiatan = async (req, res) => {
  try {
    const result = await db.query(
      `
      DELETE FROM laporan_kegiatan
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Laporan kegiatan tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Laporan kegiatan berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteLaporanKegiatan]", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ── LAPORAN KEGIATAN PRAMUKA ───────────────────────────────────

exports.getAllLaporanKegiatan = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, judul, deskripsi, tanggal, file_nama, file_mime,
              to_char(created_at, 'YYYY-MM-DD') AS created_at
       FROM laporan_kegiatan ORDER BY tanggal DESC, id DESC`,
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLaporanKegiatan = async (req, res) => {
  try {
    await runMulter("file_laporan")(req, res);
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }

  const { judul, deskripsi, tanggal } = req.body;

  if (!judul) {
    return res.status(400).json({ error: "Judul wajib diisi" });
  }

  const fileData = req.file ? req.file.buffer : null;
  const fileMime = req.file ? req.file.mimetype : null;
  const fileNama = req.file ? req.file.originalname : null;

  try {
    const result = await db.query(
      `INSERT INTO laporan_kegiatan 
        (judul, deskripsi, tanggal, file_data, file_mime, file_nama)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, judul, deskripsi, tanggal, file_nama, file_mime,
                 to_char(created_at, 'YYYY-MM-DD') AS created_at`,
      [
        judul,
        deskripsi || "",
        tanggal || new Date().toISOString().slice(0, 10),
        fileData,
        fileMime,
        fileNama,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadLaporanKegiatan = async (req, res) => {
  const isView = req.path.endsWith("/view");

  try {
    const result = await db.query(
      "SELECT file_nama, file_data, file_mime FROM laporan_kegiatan WHERE id = $1",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Laporan tidak ditemukan" });
    }

    const doc = result.rows[0];

    if (!doc.file_data) {
      return res.status(404).json({ error: "File tidak tersedia" });
    }

    const mime = doc.file_mime || "application/octet-stream";

    const inlineTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    const disposition =
      isView && inlineTypes.includes(mime) ? "inline" : "attachment";

    res.set("Content-Type", mime);
    res.set(
      "Content-Disposition",
      `${disposition}; filename="${doc.file_nama}"`,
    );

    res.send(doc.file_data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLaporanKegiatan = async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM laporan_kegiatan WHERE id = $1 RETURNING *",
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Laporan tidak ditemukan" });
    }

    res.json({
      success: true,
      message: "Laporan berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
