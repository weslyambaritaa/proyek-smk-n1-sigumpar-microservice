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
      catatan,
      dokumentasi,
    } = req.body;

    if (!kelas_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id wajib diisi",
      });
    }

    if (!agenda || !agenda.trim()) {
      return res.status(400).json({
        success: false,
        message: "Agenda wajib diisi",
      });
    }

    const foto_url = req.file
      ? `/api/student/uploads/parenting/${req.file.filename}`
      : null;

    const result = await pool.query(
      `
      INSERT INTO catatan_parenting (
        siswa_id, kelas_id, wali_id, tanggal,
        kehadiran_ortu, agenda, ringkasan,
        catatan, dokumentasi, foto_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        siswa_id || null,
        kelas_id,
        getUserId(req),
        tanggal || new Date(),
        Number(kehadiran_ortu || 0),
        agenda.trim(),
        ringkasan || null,
        catatan || ringkasan || null,
        dokumentasi || null,
        foto_url,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Catatan parenting berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createParenting error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateParenting = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      siswa_id,
      kelas_id,
      tanggal,
      kehadiran_ortu,
      agenda,
      ringkasan,
      catatan,
      dokumentasi,
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
        catatan = $7,
        dokumentasi = $8,
        foto_url = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
      `,
      [
        siswa_id || null,
        kelas_id || null,
        tanggal || new Date(),
        Number(kehadiran_ortu || 0),
        agenda || null,
        ringkasan || null,
        catatan || ringkasan || null,
        dokumentasi || foto_url || null,
        foto_url || dokumentasi || null,
        id,
      ],
    );

    return res.json({
      success: true,
      message: "Catatan parenting berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateParenting error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
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

const normalizeHari = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

const getHariIndonesiaFromDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00+07:00`);
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return hari[date.getDay()];
};

const getMapelAssignmentsGuruMapel = async (req) => {
  const userId = getUserId(req);
  const roles = getUserRoles(req);

  if (!userId) {
    const err = new Error("User tidak valid");
    err.statusCode = 401;
    throw err;
  }

  if (!roles.includes("guru-mapel")) {
    const err = new Error(
      "Hanya guru-mapel yang boleh mengakses rekap absensi mapel",
    );
    err.statusCode = 403;
    throw err;
  }

  const response = await axios.get(
    `${ACADEMIC_SERVICE_URL}/api/academic/mapel/guru/${userId}`,
    {
      headers: { Authorization: req.headers.authorization },
    },
  );

  const rows = Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];

  return rows.map((item) => ({
    kelas_id: item.kelas_id,
    mapel_id: item.mapel_id || item.id,
    nama_kelas: item.nama_kelas,
    tingkat: item.tingkat,
    nama_mapel: item.nama_mapel,
    guru_mapel_id: item.guru_mapel_id,
    guru_mapel_nama: item.guru_mapel_nama,
  }));
};

const findOwnedMapelAssignment = async (req, kelasId, mapelId) => {
  const assignments = await getMapelAssignmentsGuruMapel(req);

  const found = assignments.find(
    (item) =>
      String(item.kelas_id) === String(kelasId) &&
      String(item.mapel_id) === String(mapelId),
  );

  if (!found) {
    const err = new Error(
      "Kelas/mapel ini bukan assignment guru-mapel tersebut",
    );
    err.statusCode = 403;
    throw err;
  }

  return found;
};

exports.getAbsensiMapelAssignments = async (req, res) => {
  try {
    const data = await getMapelAssignmentsGuruMapel(req);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getAbsensiMapelAssignments error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const getJadwalGuruMapel = async (req) => {
  const userId = getUserId(req);
  const roles = getUserRoles(req);

  if (!userId) {
    const err = new Error("User tidak valid");
    err.statusCode = 401;
    throw err;
  }

  if (!roles.includes("guru-mapel")) {
    const err = new Error(
      "Hanya guru-mapel yang boleh mengakses absensi mapel",
    );
    err.statusCode = 403;
    throw err;
  }

  const response = await axios.get(
    `${ACADEMIC_SERVICE_URL}/api/academic/jadwal`,
    {
      headers: { Authorization: req.headers.authorization },
    },
  );

  const rows = Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];

  return rows.filter((item) => String(item.guru_id) === String(userId));
};

const findOwnedJadwal = async (req, jadwalId) => {
  const jadwalList = await getJadwalGuruMapel(req);
  const jadwal = jadwalList.find(
    (item) => String(item.id) === String(jadwalId),
  );

  if (!jadwal) {
    const err = new Error(
      "Jadwal ini bukan jadwal yang di-assign kepada guru-mapel tersebut",
    );
    err.statusCode = 403;
    throw err;
  }

  return jadwal;
};

exports.getAbsensiMapelJadwal = async (req, res) => {
  try {
    const jadwalList = await getJadwalGuruMapel(req);

    return res.json({
      success: true,
      data: jadwalList,
    });
  } catch (err) {
    console.error("getAbsensiMapelJadwal error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAbsensiMapelSiswa = async (req, res) => {
  try {
    const { jadwal_id } = req.query;

    if (!jadwal_id) {
      return res.status(400).json({
        success: false,
        message: "jadwal_id wajib diisi",
      });
    }

    const jadwal = await findOwnedJadwal(req, jadwal_id);
    const siswaResponse = await axios.get(
      `${ACADEMIC_SERVICE_URL}/api/academic/siswa`,
      {
        params: { kelas_id: jadwal.kelas_id },
        headers: { Authorization: req.headers.authorization },
      },
    );

    const siswa = siswaResponse.data?.data || siswaResponse.data || [];

    return res.json({
      success: true,
      jadwal,
      data: siswa,
    });
  } catch (err) {
    console.error("getAbsensiMapelSiswa error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAbsensiMapel = async (req, res) => {
  try {
    const { jadwal_id, tanggal, tanggal_mulai, tanggal_akhir } = req.query;

    if (!jadwal_id) {
      return res.status(400).json({
        success: false,
        message: "jadwal_id wajib diisi",
      });
    }

    const jadwal = await findOwnedJadwal(req, jadwal_id);

    const params = [jadwal_id];
    const filters = ["a.jadwal_id = $1"];

    if (tanggal) {
      params.push(tanggal);
      filters.push(`a.tanggal = $${params.length}`);
    }

    if (tanggal_mulai) {
      params.push(tanggal_mulai);
      filters.push(`a.tanggal >= $${params.length}`);
    }

    if (tanggal_akhir) {
      params.push(tanggal_akhir);
      filters.push(`a.tanggal <= $${params.length}`);
    }

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.siswa_id,
        a.kelas_id,
        a.mapel_id,
        a.jadwal_id,
        a.guru_id,
        a.tanggal,
        a.status,
        a.keterangan,
        a.created_at,
        a.updated_at
      FROM absensi_siswa a
      WHERE ${filters.join(" AND ")}
      ORDER BY a.tanggal DESC, a.siswa_id ASC
      `,
      params,
    );

    return res.json({
      success: true,
      jadwal,
      data: result.rows,
    });
  } catch (err) {
    console.error("getAbsensiMapel error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createAbsensiMapel = async (req, res) => {
  try {
    const { jadwal_id, tanggal, data_absensi } = req.body;
    const guru_id = getUserId(req);

    if (!jadwal_id || !tanggal || !Array.isArray(data_absensi)) {
      return res.status(400).json({
        success: false,
        message: "jadwal_id, tanggal, dan data_absensi wajib diisi",
      });
    }

    const jadwal = await findOwnedJadwal(req, jadwal_id);

    const hariTanggal = getHariIndonesiaFromDate(tanggal);
    if (normalizeHari(hariTanggal) !== normalizeHari(jadwal.hari)) {
      return res.status(400).json({
        success: false,
        message: `Tanggal ${tanggal} adalah hari ${hariTanggal}, bukan jadwal ${jadwal.hari}`,
      });
    }

    const siswaIds = await getSiswaIdsByKelas(req, jadwal.kelas_id);
    const invalidSiswa = data_absensi.find(
      (item) => item.siswa_id && !siswaIds.includes(Number(item.siswa_id)),
    );

    if (invalidSiswa) {
      return res.status(400).json({
        success: false,
        message: `Siswa ID ${invalidSiswa.siswa_id} tidak terdaftar di kelas jadwal ini`,
      });
    }

    const allowed = ["hadir", "izin", "sakit", "alpa", "terlambat"];
    const results = [];

    for (const item of data_absensi) {
      if (!item.siswa_id) continue;

      let status = String(item.status || "hadir").toLowerCase();
      if (!allowed.includes(status)) status = "hadir";

      const result = await pool.query(
        `
        INSERT INTO absensi_siswa (
          siswa_id,
          kelas_id,
          mapel_id,
          jadwal_id,
          guru_id,
          tanggal,
          status,
          keterangan,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $5)
        ON CONFLICT (siswa_id, tanggal, jadwal_id)
        DO UPDATE SET
          kelas_id = EXCLUDED.kelas_id,
          mapel_id = EXCLUDED.mapel_id,
          guru_id = EXCLUDED.guru_id,
          status = EXCLUDED.status,
          keterangan = EXCLUDED.keterangan,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [
          item.siswa_id,
          jadwal.kelas_id,
          jadwal.mapel_id,
          jadwal.id,
          guru_id,
          tanggal,
          status,
          item.keterangan || "",
        ],
      );

      results.push(result.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: "Absensi mapel berhasil disimpan",
      jadwal,
      data: results,
    });
  } catch (err) {
    console.error("createAbsensiMapel error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getRekapAbsensiMapel = async (req, res) => {
  try {
    const { kelas_id, mapel_id, tanggal_mulai, tanggal_akhir } = req.query;

    if (!kelas_id || !mapel_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id dan mapel_id wajib diisi",
      });
    }

    const assignment = await findOwnedMapelAssignment(req, kelas_id, mapel_id);

    const params = [kelas_id, mapel_id];
    const filters = ["kelas_id = $1", "mapel_id = $2"];

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
        COUNT(*) FILTER (WHERE status = 'terlambat') AS terlambat,
        COUNT(*) AS total
      FROM absensi_siswa
      WHERE ${filters.join(" AND ")}
      GROUP BY siswa_id
      ORDER BY siswa_id ASC
      `,
      params,
    );

    return res.json({
      success: true,
      assignment,
      data: result.rows,
    });
  } catch (err) {
    console.error("getRekapAbsensiMapel error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getRekapAbsensiKepalaSekolah = async (req, res) => {
  try {
    const { kelas_id, mapel_id, tanggal_mulai, tanggal_akhir } = req.query;

    if (!kelas_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id wajib diisi",
      });
    }

    const params = [kelas_id];
    const filters = ["kelas_id = $1"];

    // Jika mapel dipilih, ambil absensi guru-mapel sesuai mapel.
    // Jika mapel tidak dipilih, ambil seluruh absensi mapel di kelas tersebut.
    filters.push("jadwal_id IS NOT NULL");

    if (mapel_id) {
      params.push(mapel_id);
      filters.push(`mapel_id = $${params.length}`);
    }

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
        COUNT(*) FILTER (WHERE status = 'terlambat') AS terlambat,
        COUNT(*) AS total
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
    console.error("getRekapAbsensiKepalaSekolah error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

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
    AND jadwal_id IS NULL
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
    const filters = ["kelas_id = $1", "jadwal_id IS NULL"];

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

const hitungNilaiAkhir = ({
  tugas = 0,
  kuis = 0,
  uts = 0,
  uas = 0,
  praktik = 0,
  bobot_tugas = 20,
  bobot_kuis = 10,
  bobot_uts = 25,
  bobot_uas = 30,
  bobot_praktik = 15,
}) => {
  return Number(
    (
      (Number(tugas) * Number(bobot_tugas)) / 100 +
      (Number(kuis) * Number(bobot_kuis)) / 100 +
      (Number(uts) * Number(bobot_uts)) / 100 +
      (Number(uas) * Number(bobot_uas)) / 100 +
      (Number(praktik) * Number(bobot_praktik)) / 100
    ).toFixed(2),
  );
};

exports.getGuruMapelAssignments = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User guru-mapel tidak terbaca",
      });
    }

    const response = await axios.get(
      `${ACADEMIC_SERVICE_URL}/api/academic/mapel/guru/${userId}`,
      {
        headers: { Authorization: req.headers.authorization },
      },
    );

    const assignments = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : [];

    return res.json({ success: true, data: assignments });
  } catch (err) {
    console.error(
      "getGuruMapelAssignments error:",
      err.response?.data || err.message,
    );
    return res.status(err.response?.status || 500).json({
      success: false,
      message:
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal mengambil assignment guru-mapel",
    });
  }
};

exports.getSiswaUntukInputNilai = async (req, res) => {
  try {
    const { kelas_id, mapel_id } = req.query;

    if (!kelas_id || !mapel_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id dan mapel_id wajib diisi",
      });
    }

    await assertGuruMapelOwnsAssignment(req, kelas_id, mapel_id);

    const response = await axios.get(
      `${ACADEMIC_SERVICE_URL}/api/academic/siswa`,
      {
        params: { kelas_id },
        headers: { Authorization: req.headers.authorization },
      },
    );

    const siswa = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : [];

    return res.json({ success: true, data: siswa });
  } catch (err) {
    console.error(
      "getSiswaUntukInputNilai error:",
      err.response?.data || err.message,
    );
    return res.status(err.statusCode || err.response?.status || 500).json({
      success: false,
      message:
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal mengambil siswa untuk input nilai",
    });
  }
};

exports.getNilaiSiswa = async (req, res) => {
  try {
    const {
      kelas_id,
      mapel_id,
      tahun_ajar = "2024/2025",
      semester = "ganjil",
    } = req.query;

    if (!kelas_id || !mapel_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id dan mapel_id wajib diisi",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM nilai_siswa
      WHERE kelas_id = $1
        AND mapel_id = $2
        AND tahun_ajar = $3
        AND semester = $4
      ORDER BY siswa_id ASC
      `,
      [kelas_id, mapel_id, tahun_ajar, semester],
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getNilaiSiswa error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const assertGuruMapelOwnsAssignment = async (req, kelasId, mapelId) => {
  const userId = getUserId(req);
  const roles = getUserRoles(req);

  if (!userId) {
    const err = new Error("User tidak valid");
    err.statusCode = 401;
    throw err;
  }

  if (!roles.includes("guru-mapel")) {
    const err = new Error("Hanya guru-mapel yang boleh menginput nilai");
    err.statusCode = 403;
    throw err;
  }

  const response = await axios.get(
    `${ACADEMIC_SERVICE_URL}/api/academic/mapel/guru/${userId}`,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  const assignments = response.data?.data || response.data || [];

  const allowed = assignments.some((item) => {
    const itemKelasId = item.kelas_id || item.id_kelas;
    const itemMapelId = item.mapel_id || item.id_mapel || item.id;

    return (
      String(itemKelasId) === String(kelasId) &&
      String(itemMapelId) === String(mapelId)
    );
  });

  if (!allowed) {
    const err = new Error(
      "Guru-mapel tidak diassign ke kelas dan mapel tersebut",
    );
    err.statusCode = 403;
    throw err;
  }
};

exports.createOrUpdateNilaiSiswa = async (req, res) => {
  try {
    const {
      kelas_id,
      mapel_id,
      tahun_ajar = "2024/2025",
      semester = "ganjil",
      bobot,
      data_nilai,
    } = req.body;

    const guru_id = getUserId(req);

    if (!kelas_id || !mapel_id || !guru_id || !Array.isArray(data_nilai)) {
      return res.status(400).json({
        success: false,
        message: "kelas_id, mapel_id, dan data_nilai wajib diisi",
      });
    }

    await assertGuruMapelOwnsAssignment(req, kelas_id, mapel_id);

    const siswaIds = await getSiswaIdsByKelas(req, kelas_id);

    const invalidSiswa = data_nilai.find(
      (item) => !siswaIds.includes(Number(item.siswa_id)),
    );

    if (invalidSiswa) {
      return res.status(400).json({
        success: false,
        message: `Siswa ID ${invalidSiswa.siswa_id} tidak terdaftar di kelas ini`,
      });
    }

    const totalBobot =
      Number(bobot?.tugas || 0) +
      Number(bobot?.kuis || 0) +
      Number(bobot?.uts || 0) +
      Number(bobot?.uas || 0) +
      Number(bobot?.praktik || 0);

    if (totalBobot !== 100) {
      return res.status(400).json({
        success: false,
        message: "Total bobot harus 100%",
      });
    }

    const results = [];

    for (const item of data_nilai) {
      const tugas = Number(item.tugas || 0);
      const kuis = Number(item.kuis || 0);
      const uts = Number(item.uts || 0);
      const uas = Number(item.uas || 0);
      const praktik = Number(item.praktik || 0);

      const payload = {
        tugas,
        kuis,
        uts,
        uas,
        praktik,
        bobot_tugas: Number(bobot.tugas),
        bobot_kuis: Number(bobot.kuis),
        bobot_uts: Number(bobot.uts),
        bobot_uas: Number(bobot.uas),
        bobot_praktik: Number(bobot.praktik),
      };

      const nilaiAkhir = hitungNilaiAkhir(payload);

      const result = await pool.query(
        `
        INSERT INTO nilai_siswa (
          siswa_id,
          kelas_id,
          mapel_id,
          guru_id,
          tahun_ajar,
          semester,
          tugas,
          kuis,
          uts,
          uas,
          praktik,
          bobot_tugas,
          bobot_kuis,
          bobot_uts,
          bobot_uas,
          bobot_praktik,
          nilai_akhir
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17
        )
        ON CONFLICT (siswa_id, kelas_id, mapel_id, tahun_ajar, semester)
        DO UPDATE SET
          guru_id = EXCLUDED.guru_id,
          tugas = EXCLUDED.tugas,
          kuis = EXCLUDED.kuis,
          uts = EXCLUDED.uts,
          uas = EXCLUDED.uas,
          praktik = EXCLUDED.praktik,
          bobot_tugas = EXCLUDED.bobot_tugas,
          bobot_kuis = EXCLUDED.bobot_kuis,
          bobot_uts = EXCLUDED.bobot_uts,
          bobot_uas = EXCLUDED.bobot_uas,
          bobot_praktik = EXCLUDED.bobot_praktik,
          nilai_akhir = EXCLUDED.nilai_akhir,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [
          item.siswa_id,
          kelas_id,
          mapel_id,
          guru_id,
          tahun_ajar,
          semester,
          tugas,
          kuis,
          uts,
          uas,
          praktik,
          Number(bobot.tugas),
          Number(bobot.kuis),
          Number(bobot.uts),
          Number(bobot.uas),
          Number(bobot.praktik),
          nilaiAkhir,
        ],
      );

      results.push(result.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: "Nilai berhasil disimpan",
      data: results,
    });
  } catch (err) {
    console.error("createOrUpdateNilaiSiswa error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getNilaiSiswa = async (req, res) => {
  try {
    const {
      kelas_id,
      mapel_id,
      tahun_ajar = "2024/2025",
      semester = "ganjil",
    } = req.query;

    if (!kelas_id || !mapel_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id dan mapel_id wajib diisi",
      });
    }

    await assertGuruMapelOwnsAssignment(req, kelas_id, mapel_id);

    const result = await pool.query(
      `
      SELECT *
      FROM nilai_siswa
      WHERE kelas_id = $1
        AND mapel_id = $2
        AND tahun_ajar = $3
        AND semester = $4
      ORDER BY siswa_id ASC
      `,
      [kelas_id, mapel_id, tahun_ajar, semester],
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getNilaiSiswa error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getRekapNilai = async (req, res) => {
  try {
    const {
      kelas_id,
      mapel_id,
      tahun_ajar = "2024/2025",
      semester = "ganjil",
    } = req.query;

    if (!kelas_id) {
      return res.status(400).json({
        success: false,
        message: "kelas_id wajib diisi",
      });
    }

    if (mapel_id) {
      await assertGuruMapelOwnsAssignment(req, kelas_id, mapel_id);
    }

    const params = [kelas_id, tahun_ajar, semester];
    const filters = ["kelas_id = $1", "tahun_ajar = $2", "semester = $3"];

    if (mapel_id) {
      params.push(mapel_id);
      filters.push(`mapel_id = $${params.length}`);
    }

    const result = await pool.query(
      `
      SELECT *
      FROM nilai_siswa
      WHERE ${filters.join(" AND ")}
      ORDER BY siswa_id ASC, mapel_id ASC
      `,
      params,
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getRekapNilai error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createRekapKehadiran = async (req, res) => {
  try {
    const { kelas_id, tanggal, data_absensi } = req.body;
    const wali_id = getUserId(req);

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
      if (!allowed.includes(status)) status = "hadir";

      const result = await pool.query(
        `
        INSERT INTO absensi_siswa (
          siswa_id,
          kelas_id,
          mapel_id,
          jadwal_id,
          guru_id,
          tanggal,
          status,
          keterangan,
          created_by
        )
        VALUES ($1, $2, NULL, NULL, NULL, $3, $4, $5, $6)
        ON CONFLICT (siswa_id, tanggal)
        WHERE jadwal_id IS NULL
        DO UPDATE SET
          kelas_id = EXCLUDED.kelas_id,
          status = EXCLUDED.status,
          keterangan = EXCLUDED.keterangan,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [
          item.siswa_id,
          kelas_id,
          tanggal,
          status,
          item.keterangan || "",
          wali_id,
        ],
      );

      results.push(result.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: "Presensi kelas berhasil disimpan",
      data: results,
    });
  } catch (err) {
    console.error("createRekapKehadiran error:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};
