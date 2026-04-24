const axios = require("axios");
const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");

const ACADEMIC_SERVICE_URL =
  process.env.ACADEMIC_SERVICE_URL || "http://academic-service:3003";

const getAuthHeaders = (req) => ({
  Authorization: req.headers.authorization || "",
});

const getAcademicData = async (req, endpoint, params = {}) => {
  const response = await axios.get(`${ACADEMIC_SERVICE_URL}${endpoint}`, {
    headers: getAuthHeaders(req),
    params,
    timeout: 10000,
  });
  const body = response.data;
  return Array.isArray(body) ? body : body?.data || [];
};

const getAcademicById = async (req, endpoint, id) => {
  const response = await axios.get(`${ACADEMIC_SERVICE_URL}${endpoint}/${id}`, {
    headers: getAuthHeaders(req),
    timeout: 10000,
  });
  return response.data?.data || response.data;
};

// ===== LOOKUP UNTUK STUDENT SERVICE =====

exports.getKelasLookup = async (req, res, next) => {
  try {
    const data = await getAcademicData(req, "/api/academic/kelas", req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getSiswaLookup = async (req, res, next) => {
  try {
    const data = await getAcademicData(req, "/api/academic/siswa", req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ===== PARENTING =====

exports.getParenting = async (req, res, next) => {
  try {
    const { kelas_id, wali_id } = req.query;
    let query = `SELECT * FROM parenting WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (kelas_id) {
      query += ` AND kelas_id = $${idx++}`;
      params.push(kelas_id);
    }
    if (wali_id) {
      query += ` AND wali_id = $${idx++}`;
      params.push(wali_id);
    }

    query += ` ORDER BY tanggal DESC, id DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.createParenting = async (req, res, next) => {
  try {
    const { kelas_id, wali_id, tanggal, kehadiran_ortu, agenda, ringkasan } =
      req.body;
    if (!kelas_id) throw createError(400, "kelas_id wajib diisi");
    if (!agenda) throw createError(400, "agenda wajib diisi");

    const foto_url = req.file
      ? `/api/student/uploads/${req.file.filename}`
      : null;

    const result = await pool.query(
      `INSERT INTO parenting
       (kelas_id, wali_id, tanggal, kehadiran_ortu, agenda, ringkasan, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        kelas_id,
        wali_id || null,
        tanggal || new Date().toISOString().slice(0, 10),
        kehadiran_ortu || 0,
        agenda,
        ringkasan || "",
        foto_url,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.updateParenting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { kelas_id, wali_id, tanggal, kehadiran_ortu, agenda, ringkasan } =
      req.body;
    const foto_url = req.file
      ? `/api/student/uploads/${req.file.filename}`
      : req.body.foto_url || null;

    const result = await pool.query(
      `UPDATE parenting SET
         kelas_id = $1,
         wali_id = $2,
         tanggal = $3,
         kehadiran_ortu = $4,
         agenda = $5,
         ringkasan = $6,
         foto_url = COALESCE($7, foto_url),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        kelas_id,
        wali_id || null,
        tanggal,
        kehadiran_ortu || 0,
        agenda,
        ringkasan || "",
        foto_url,
        id,
      ],
    );

    if (result.rowCount === 0)
      throw createError(404, "Data parenting tidak ditemukan");
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.deleteParenting = async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM parenting WHERE id = $1 RETURNING *`,
      [req.params.id],
    );
    if (result.rowCount === 0)
      throw createError(404, "Data parenting tidak ditemukan");
    res.json({ success: true, message: "Data parenting berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};

// ===== KEBERSIHAN KELAS =====

exports.getKebersihan = async (req, res, next) => {
  try {
    const { kelas_id, wali_id } = req.query;
    let query = `SELECT * FROM kebersihan_kelas WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (kelas_id) {
      query += ` AND kelas_id = $${idx++}`;
      params.push(kelas_id);
    }
    if (wali_id) {
      query += ` AND wali_id = $${idx++}`;
      params.push(wali_id);
    }

    query += ` ORDER BY tanggal DESC, id DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.createKebersihan = async (req, res, next) => {
  try {
    const { kelas_id, wali_id, tanggal, penilaian, catatan } = req.body;
    if (!kelas_id) throw createError(400, "kelas_id wajib diisi");

    const foto_url = req.file
      ? `/api/student/uploads/${req.file.filename}`
      : null;
    let parsedPenilaian = {};

    try {
      parsedPenilaian =
        typeof penilaian === "string"
          ? JSON.parse(penilaian || "{}")
          : penilaian || {};
    } catch {
      throw createError(400, "Format penilaian tidak valid");
    }

    const result = await pool.query(
      `INSERT INTO kebersihan_kelas
       (kelas_id, wali_id, tanggal, penilaian, catatan, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        kelas_id,
        wali_id || null,
        tanggal || new Date().toISOString().slice(0, 10),
        JSON.stringify(parsedPenilaian),
        catatan || "",
        foto_url,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.updateKebersihan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { kelas_id, wali_id, tanggal, penilaian, catatan } = req.body;
    const foto_url = req.file
      ? `/api/student/uploads/${req.file.filename}`
      : req.body.foto_url || null;

    let parsedPenilaian = {};
    try {
      parsedPenilaian =
        typeof penilaian === "string"
          ? JSON.parse(penilaian || "{}")
          : penilaian || {};
    } catch {
      throw createError(400, "Format penilaian tidak valid");
    }

    const result = await pool.query(
      `UPDATE kebersihan_kelas SET
         kelas_id = $1,
         wali_id = $2,
         tanggal = $3,
         penilaian = $4,
         catatan = $5,
         foto_url = COALESCE($6, foto_url),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        kelas_id,
        wali_id || null,
        tanggal,
        JSON.stringify(parsedPenilaian),
        catatan || "",
        foto_url,
        id,
      ],
    );

    if (result.rowCount === 0)
      throw createError(404, "Data kebersihan tidak ditemukan");
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.deleteKebersihan = async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM kebersihan_kelas WHERE id = $1 RETURNING *`,
      [req.params.id],
    );
    if (result.rowCount === 0)
      throw createError(404, "Data kebersihan tidak ditemukan");
    res.json({ success: true, message: "Data kebersihan berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};

// ===== REFLEKSI =====

exports.getRefleksi = async (req, res, next) => {
  try {
    const { kelas_id, wali_id } = req.query;
    let query = `SELECT * FROM refleksi_wali_kelas WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (kelas_id) {
      query += ` AND kelas_id = $${idx++}`;
      params.push(kelas_id);
    }
    if (wali_id) {
      query += ` AND wali_id = $${idx++}`;
      params.push(wali_id);
    }

    query += ` ORDER BY tanggal DESC, id DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.createRefleksi = async (req, res, next) => {
  try {
    const { kelas_id, wali_id, tanggal, capaian, tantangan, rencana } =
      req.body;
    if (!kelas_id) throw createError(400, "kelas_id wajib diisi");

    const result = await pool.query(
      `INSERT INTO refleksi_wali_kelas
       (kelas_id, wali_id, tanggal, capaian, tantangan, rencana)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        kelas_id,
        wali_id || null,
        tanggal || new Date().toISOString().slice(0, 10),
        capaian || "",
        tantangan || "",
        rencana || "",
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.updateRefleksi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { kelas_id, wali_id, tanggal, capaian, tantangan, rencana } =
      req.body;

    const result = await pool.query(
      `UPDATE refleksi_wali_kelas SET
         kelas_id = $1,
         wali_id = $2,
         tanggal = $3,
         capaian = $4,
         tantangan = $5,
         rencana = $6,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        kelas_id,
        wali_id || null,
        tanggal,
        capaian || "",
        tantangan || "",
        rencana || "",
        id,
      ],
    );

    if (result.rowCount === 0)
      throw createError(404, "Data refleksi tidak ditemukan");
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.deleteRefleksi = async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM refleksi_wali_kelas WHERE id = $1 RETURNING *`,
      [req.params.id],
    );
    if (result.rowCount === 0)
      throw createError(404, "Data refleksi tidak ditemukan");
    res.json({ success: true, message: "Data refleksi berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};

// ===== SURAT PANGGILAN SISWA =====

exports.getSuratPanggilan = async (req, res, next) => {
  try {
    const { siswa_id, kelas_id, status } = req.query;

    let query = `SELECT * FROM surat_panggilan_siswa WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (siswa_id) {
      query += ` AND siswa_id = $${idx++}`;
      params.push(siswa_id);
    }
    if (kelas_id) {
      query += ` AND kelas_id = $${idx++}`;
      params.push(kelas_id);
    }
    if (status) {
      query += ` AND status = $${idx++}`;
      params.push(status);
    }

    query += ` ORDER BY tanggal DESC, id DESC`;
    const result = await pool.query(query, params);

    const siswaList = await getAcademicData(req, "/api/academic/siswa");
    const siswaMap = new Map(siswaList.map((item) => [String(item.id), item]));

    const data = result.rows.map((row) => {
      const siswa = siswaMap.get(String(row.siswa_id));
      return {
        ...row,
        nama_siswa: siswa?.nama_lengkap || null,
        nisn: siswa?.nisn || null,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createSuratPanggilan = async (req, res, next) => {
  try {
    const {
      siswa_id,
      kelas_id,
      wali_id,
      nomor_surat,
      tanggal,
      alasan,
      tindak_lanjut,
      status,
    } = req.body;
    if (!siswa_id) throw createError(400, "siswa_id wajib diisi");
    if (!alasan) throw createError(400, "alasan wajib diisi");

    await getAcademicById(req, "/api/academic/siswa", siswa_id);

    const result = await pool.query(
      `INSERT INTO surat_panggilan_siswa
       (siswa_id, kelas_id, wali_id, nomor_surat, tanggal, alasan, tindak_lanjut, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        siswa_id,
        kelas_id || null,
        wali_id || null,
        nomor_surat || null,
        tanggal || new Date().toISOString().slice(0, 10),
        alasan,
        tindak_lanjut || "",
        status || "draft",
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.updateSuratPanggilan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      siswa_id,
      kelas_id,
      wali_id,
      nomor_surat,
      tanggal,
      alasan,
      tindak_lanjut,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE surat_panggilan_siswa SET
         siswa_id = $1,
         kelas_id = $2,
         wali_id = $3,
         nomor_surat = $4,
         tanggal = $5,
         alasan = $6,
         tindak_lanjut = $7,
         status = $8,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        siswa_id,
        kelas_id || null,
        wali_id || null,
        nomor_surat || null,
        tanggal,
        alasan,
        tindak_lanjut || "",
        status || "draft",
        id,
      ],
    );

    if (result.rowCount === 0)
      throw createError(404, "Surat panggilan tidak ditemukan");
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.deleteSuratPanggilan = async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM surat_panggilan_siswa WHERE id = $1 RETURNING *`,
      [req.params.id],
    );
    if (result.rowCount === 0)
      throw createError(404, "Surat panggilan tidak ditemukan");
    res.json({ success: true, message: "Surat panggilan berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};

// ===== REKAP KEHADIRAN & NILAI (AMBIL DARI ACADEMIC SERVICE) =====

exports.getRekapKehadiran = async (req, res, next) => {
  try {
    const { kelas_id, bulan, tahun } = req.query;
    if (!kelas_id) throw createError(400, "kelas_id wajib diisi");

    const data = await getAcademicData(req, "/api/academic/absensi-siswa", {
      kelas_id,
    });

    const filtered = data.filter((item) => {
      if (!item?.tanggal) return false;
      const date = new Date(item.tanggal);
      const monthOk = bulan ? Number(bulan) === date.getMonth() + 1 : true;
      const yearOk = tahun ? Number(tahun) === date.getFullYear() : true;
      return monthOk && yearOk;
    });

    const grouped = {};
    for (const row of filtered) {
      if (!grouped[row.siswa_id]) {
        grouped[row.siswa_id] = {
          siswa_id: row.siswa_id,
          nama_lengkap: row.nama_lengkap,
          nisn: row.nisn,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpa: 0,
          terlambat: 0,
          total_pertemuan: 0,
        };
      }
      const status = String(row.status || "").toLowerCase();
      if (grouped[row.siswa_id][status] !== undefined)
        grouped[row.siswa_id][status] += 1;
      grouped[row.siswa_id].total_pertemuan += 1;
    }

    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    next(err);
  }
};

exports.getRekapNilai = async (req, res, next) => {
  try {
    const { kelas_id, mapel_id, tahun_ajar } = req.query;
    if (!kelas_id) throw createError(400, "kelas_id wajib diisi");

    const data = await getAcademicData(req, "/api/academic/nilai", {
      kelas_id,
      mapel_id,
      tahun_ajar,
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
