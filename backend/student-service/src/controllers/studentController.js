const pool = require("../config/db");
const axios = require("axios");

const ACADEMIC_SERVICE_URL =
  process.env.ACADEMIC_SERVICE_URL || "http://academic-service:3003";

const getUserId = (req) => req.user?.sub || req.user?.id || null;

const getUserRoles = (req) => {
  const realmRoles = req.user?.realm_access?.roles || [];
  const resourceRoles = Object.values(req.user?.resource_access || {}).flatMap(
    (client) => client.roles || [],
  );

  return [...new Set([...realmRoles, ...resourceRoles])];
};

const assertWaliOwnsKelas = async (req, kelasId) => {
  const userId = getUserId(req);
  const roles = getUserRoles(req);

  if (!userId) {
    const err = new Error("User tidak valid");
    err.statusCode = 401;
    throw err;
  }

  if (!roles.includes("wali-kelas")) {
    const err = new Error("Hanya wali-kelas yang boleh mengisi presensi kelas");
    err.statusCode = 403;
    throw err;
  }

  const response = await axios.get(
    `${ACADEMIC_SERVICE_URL}/api/academic/kelas/wali/${userId}`,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  const kelasList = response.data?.data || [];
  const allowed = kelasList.some(
    (kelas) => String(kelas.id) === String(kelasId),
  );

  if (!allowed) {
    const err = new Error(
      "Kelas ini bukan kelas yang di-assign kepada wali-kelas tersebut",
    );
    err.statusCode = 403;
    throw err;
  }
};

const getSiswaIdsByKelas = async (req, kelasId) => {
  const response = await axios.get(
    `${ACADEMIC_SERVICE_URL}/api/academic/siswa`,
    {
      params: { kelas_id: kelasId },
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  const siswa = response.data?.data || [];
  return siswa.map((item) => Number(item.id));
};

// ─── KEBERSIHAN KELAS ─────────────────────────────────────────────

exports.getKebersihan = async (req, res) => {
  try {
    const { kelas_id } = req.query;
    const params = [];
    let where = "";

    if (kelas_id) {
      params.push(kelas_id);
      where = "WHERE kelas_id = $1";
    }

    const result = await pool.query(
      `
      SELECT *
      FROM kebersihan_kelas
      ${where}
      ORDER BY tanggal DESC, id DESC
      `,
      params,
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getKebersihan error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createKebersihan = async (req, res) => {
  try {
    const { kelas_id, tanggal, penilaian, catatan, foto_url } = req.body;

    const result = await pool.query(
      `
      INSERT INTO kebersihan_kelas (
        kelas_id, tanggal, penilaian, catatan, foto_url, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        kelas_id || null,
        tanggal || new Date(),
        penilaian || {},
        catatan || null,
        foto_url || null,
        getUserId(req),
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("createKebersihan error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateKebersihan = async (req, res) => {
  try {
    const { id } = req.params;
    const { kelas_id, tanggal, penilaian, catatan, foto_url } = req.body;

    const result = await pool.query(
      `
      UPDATE kebersihan_kelas
      SET
        kelas_id = $1,
        tanggal = $2,
        penilaian = $3,
        catatan = $4,
        foto_url = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        kelas_id || null,
        tanggal || new Date(),
        penilaian || {},
        catatan || null,
        foto_url || null,
        id,
      ],
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("updateKebersihan error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteKebersihan = async (req, res) => {
  try {
    await pool.query("DELETE FROM kebersihan_kelas WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteKebersihan error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PARENTING ───────────────────────────────────────────────────

exports.getParenting = async (req, res) => {
  try {
    const { kelas_id, siswa_id } = req.query;
    const params = [];
    const filters = [];

    if (kelas_id) {
      params.push(kelas_id);
      filters.push(`kelas_id = $${params.length}`);
    }

    if (siswa_id) {
      params.push(siswa_id);
      filters.push(`siswa_id = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(
      `
      SELECT *
      FROM catatan_parenting
      ${where}
      ORDER BY tanggal DESC, id DESC
      `,
      params,
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getParenting error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createParenting = async (req, res) => {
  try {
    const {
      siswa_id,
      kelas_id,
      tanggal,
      kehadiran_ortu,
      agenda,
      ringkasan,
      foto_url,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO catatan_parenting (
        siswa_id, kelas_id, wali_id, tanggal, kehadiran_ortu, agenda, ringkasan, foto_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        siswa_id || null,
        kelas_id || null,
        getUserId(req),
        tanggal || new Date(),
        kehadiran_ortu || 0,
        agenda || null,
        ringkasan || null,
        foto_url || null,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("createParenting error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateParenting = async (req, res) => {
  try {
    const {
      siswa_id,
      kelas_id,
      tanggal,
      kehadiran_ortu,
      agenda,
      ringkasan,
      foto_url,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE catatan_parenting
      SET
        siswa_id = $1,
        kelas_id = $2,
        tanggal = $3,
        kehadiran_ortu = $4,
        agenda = $5,
        ringkasan = $6,
        foto_url = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      [
        siswa_id || null,
        kelas_id || null,
        tanggal || new Date(),
        kehadiran_ortu || 0,
        agenda || null,
        ringkasan || null,
        foto_url || null,
        req.params.id,
      ],
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("updateParenting error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteParenting = async (req, res) => {
  try {
    await pool.query("DELETE FROM catatan_parenting WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteParenting error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── REFLEKSI WALI KELAS ─────────────────────────────────────────

exports.getRefleksi = async (req, res) => {
  try {
    const { kelas_id } = req.query;
    const params = [];
    let where = "";

    if (kelas_id) {
      params.push(kelas_id);
      where = "WHERE kelas_id = $1";
    }

    const result = await pool.query(
      `
      SELECT *
      FROM refleksi_wali_kelas
      ${where}
      ORDER BY tanggal DESC, id DESC
      `,
      params,
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getRefleksi error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createRefleksi = async (req, res) => {
  try {
    const { kelas_id, tanggal, capaian, tantangan, rencana } = req.body;

    const result = await pool.query(
      `
      INSERT INTO refleksi_wali_kelas (
        kelas_id, wali_id, tanggal, capaian, tantangan, rencana
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        kelas_id || null,
        getUserId(req),
        tanggal || new Date(),
        capaian || null,
        tantangan || null,
        rencana || null,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("createRefleksi error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateRefleksi = async (req, res) => {
  try {
    const { kelas_id, tanggal, capaian, tantangan, rencana } = req.body;

    const result = await pool.query(
      `
      UPDATE refleksi_wali_kelas
      SET
        kelas_id = $1,
        tanggal = $2,
        capaian = $3,
        tantangan = $4,
        rencana = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        kelas_id || null,
        tanggal || new Date(),
        capaian || null,
        tantangan || null,
        rencana || null,
        req.params.id,
      ],
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("updateRefleksi error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRefleksi = async (req, res) => {
  try {
    await pool.query("DELETE FROM refleksi_wali_kelas WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteRefleksi error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── SURAT PANGGILAN SISWA ───────────────────────────────────────

exports.getSuratPanggilan = async (req, res) => {
  try {
    const { kelas_id, siswa_id } = req.query;
    const params = [];
    const filters = [];

    if (kelas_id) {
      params.push(kelas_id);
      filters.push(`kelas_id = $${params.length}`);
    }

    if (siswa_id) {
      params.push(siswa_id);
      filters.push(`siswa_id = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(
      `
      SELECT *
      FROM surat_panggilan_siswa
      ${where}
      ORDER BY tanggal DESC, id DESC
      `,
      params,
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getSuratPanggilan error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createSuratPanggilan = async (req, res) => {
  try {
    const { siswa_id, kelas_id, tanggal, alasan, tindak_lanjut, status } =
      req.body;

    const result = await pool.query(
      `
      INSERT INTO surat_panggilan_siswa (
        siswa_id, kelas_id, wali_id, tanggal, alasan, tindak_lanjut, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        siswa_id || null,
        kelas_id || null,
        getUserId(req),
        tanggal || new Date(),
        alasan || null,
        tindak_lanjut || null,
        status || "draft",
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("createSuratPanggilan error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateSuratPanggilan = async (req, res) => {
  try {
    const { siswa_id, kelas_id, tanggal, alasan, tindak_lanjut, status } =
      req.body;

    const result = await pool.query(
      `
      UPDATE surat_panggilan_siswa
      SET
        siswa_id = $1,
        kelas_id = $2,
        tanggal = $3,
        alasan = $4,
        tindak_lanjut = $5,
        status = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [
        siswa_id || null,
        kelas_id || null,
        tanggal || new Date(),
        alasan || null,
        tindak_lanjut || null,
        status || "draft",
        req.params.id,
      ],
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("updateSuratPanggilan error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSuratPanggilan = async (req, res) => {
  try {
    await pool.query("DELETE FROM surat_panggilan_siswa WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteSuratPanggilan error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── REKAP KEHADIRAN SISWA ─────────────────────────────────────

exports.getRekapKehadiran = async (req, res) => {
  try {
    const { kelas_id, tanggal, tanggal_mulai, tanggal_akhir } = req.query;

    if (!kelas_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id wajib diisi",
      });
    }

    await assertWaliOwnsKelas(req, kelas_id);

    if (tanggal) {
      const result = await pool.query(
        `
        SELECT
          id,
          siswa_id,
          kelas_id,
          tanggal,
          status,
          keterangan,
          created_at,
          updated_at
        FROM absensi_siswa
        WHERE kelas_id = $1
          AND tanggal = $2
        ORDER BY siswa_id ASC
        `,
        [kelas_id, tanggal],
      );

      return res.json({
        success: true,
        data: result.rows,
      });
    }

    const params = [kelas_id];
    const filters = ["kelas_id = $1"];

    if (tanggal_mulai) {
      params.push(tanggal_mulai);
      filters.push(`tanggal >= $${params.length}`);
    }

    if (tanggal_akhir) {
      params.push(tanggal_akhir);
      filters.push(`tanggal <= $${params.length}`);
    }

    const result = await pool.query(
      `
      SELECT
        siswa_id,
        COUNT(*) FILTER (WHERE status = 'hadir') AS hadir,
        COUNT(*) FILTER (WHERE status = 'izin') AS izin,
        COUNT(*) FILTER (WHERE status = 'sakit') AS sakit,
        COUNT(*) FILTER (WHERE status = 'alpa') AS alpa,
        COUNT(*) FILTER (WHERE status = 'terlambat') AS terlambat
      FROM absensi_siswa
      WHERE ${filters.join(" AND ")}
      GROUP BY siswa_id
      ORDER BY siswa_id ASC
      `,
      params,
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getRekapKehadiran error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createRekapKehadiran = async (req, res) => {
  try {
    const { kelas_id, tanggal, data_absensi } = req.body;

    if (!kelas_id || !tanggal || !Array.isArray(data_absensi)) {
      return res.status(400).json({
        success: false,
        message: "kelas_id, tanggal, dan data_absensi wajib diisi",
      });
    }

    await assertWaliOwnsKelas(req, kelas_id);

    const siswaIds = await getSiswaIdsByKelas(req, kelas_id);
    const invalidSiswa = data_absensi.find(
      (item) => item.siswa_id && !siswaIds.includes(Number(item.siswa_id)),
    );

    if (invalidSiswa) {
      return res.status(400).json({
        success: false,
        message: `Siswa ID ${invalidSiswa.siswa_id} tidak terdaftar di kelas ini`,
      });
    }

    const allowed = ["hadir", "izin", "sakit", "alpa", "terlambat"];
    const results = [];

    for (const item of data_absensi) {
      if (!item.siswa_id) continue;

      let status = String(item.status || "hadir").toLowerCase();

      if (!allowed.includes(status)) {
        status = "hadir";
      }

      const result = await pool.query(
        `
        INSERT INTO absensi_siswa (
          siswa_id,
          kelas_id,
          tanggal,
          status,
          keterangan
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (siswa_id, tanggal)
        DO UPDATE SET
          kelas_id = EXCLUDED.kelas_id,
          status = EXCLUDED.status,
          keterangan = EXCLUDED.keterangan,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [item.siswa_id, kelas_id, tanggal, status, item.keterangan || ""],
      );

      results.push(result.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: "Presensi berhasil disimpan",
      data: results,
    });
  } catch (err) {
    console.error("createRekapKehadiran error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
    });
  }
};
