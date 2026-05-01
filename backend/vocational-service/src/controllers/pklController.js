const db = require("../config/db");
const axios = require("axios");

// Helper: ambil data siswa dari academic service
const getSiswaFromAcademic = async (kelas_id, authToken) => {
  try {
    const url = `http://academic-service:3003/api/academic/siswa${
      kelas_id ? `?kelas_id=${kelas_id}` : ""
    }`;

    const headers = authToken ? { Authorization: authToken } : {};
    const resp = await axios.get(url, { headers, timeout: 5000 });
    const data = resp.data;

    return Array.isArray(data) ? data : data?.data || [];
  } catch (err) {
    console.error("[getSiswaFromAcademic]", err.message);
    return [];
  }
};

// Helper: ambil daftar kelas dari academic service
const getKelasFromAcademic = async (authToken) => {
  try {
    const resp = await axios.get(
      "http://academic-service:3003/api/academic/kelas",
      {
        headers: authToken ? { Authorization: authToken } : {},
        timeout: 5000,
      },
    );

    const data = resp.data;
    return Array.isArray(data) ? data : data?.data || [];
  } catch (err) {
    console.error("[getKelasFromAcademic]", err.message);
    return [];
  }
};

const toNumber = (value) => {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
};

const getPredikat = (nilai) => {
  const n = Number(nilai || 0);

  if (n >= 90) return "Sangat Baik";
  if (n >= 80) return "Baik";
  if (n >= 70) return "Cukup";
  return "Perlu Bimbingan";
};

// ── LOKASI PKL ────────────────────────────────────────────────────────────

exports.getAllLokasiPKL = async (req, res) => {
  const { kelas_id, siswa_id, tanggal_mulai, tanggal_selesai } = req.query;

  try {
    let query = `
      SELECT
        id,
        siswa_id,
        kelas_id,
        nama_kelas,
        nama_siswa,
        nisn,
        nama_perusahaan,
        alamat,
        posisi,
        deskripsi_pekerjaan,
        pembimbing_industri,
        kontak_pembimbing,
        tanggal,
        tanggal_selesai,
        foto_url,
        created_at,
        updated_at
      FROM laporan_lokasi_pkl
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;

    if (kelas_id) {
      query += ` AND kelas_id = $${idx++}`;
      params.push(Number(kelas_id));
    }

    if (siswa_id) {
      query += ` AND siswa_id = $${idx++}`;
      params.push(String(siswa_id));
    }

    if (tanggal_mulai) {
      query += ` AND tanggal >= $${idx++}`;
      params.push(tanggal_mulai);
    }

    if (tanggal_selesai) {
      query += ` AND tanggal <= $${idx++}`;
      params.push(tanggal_selesai);
    }

    query += ` ORDER BY created_at DESC, id DESC`;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getAllLokasiPKL]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createLokasiPKL = async (req, res) => {
  const {
    kelas_id,
    nama_kelas,
    siswa_id,
    nama_siswa,
    nisn,
    nama_perusahaan,
    alamat,
    posisi,
    deskripsi_pekerjaan,
    pembimbing_industri,
    kontak_pembimbing,
    tanggal,
    tanggal_selesai,
  } = req.body;

  if (!kelas_id) {
    return res.status(400).json({
      success: false,
      error: "Kelas wajib dipilih",
    });
  }

  if (!siswa_id) {
    return res.status(400).json({
      success: false,
      error: "Siswa wajib dipilih",
    });
  }

  if (!nama_perusahaan || !String(nama_perusahaan).trim()) {
    return res.status(400).json({
      success: false,
      error: "Nama perusahaan wajib diisi",
    });
  }

  let foto_url = null;
  if (req.file) {
    foto_url = `/api/vocational/uploads/${req.file.filename}`;
  }

  try {
    const result = await db.query(
      `
      INSERT INTO laporan_lokasi_pkl (
        kelas_id,
        nama_kelas,
        siswa_id,
        nama_siswa,
        nisn,
        nama_perusahaan,
        alamat,
        posisi,
        deskripsi_pekerjaan,
        pembimbing_industri,
        kontak_pembimbing,
        tanggal,
        tanggal_selesai,
        foto_url,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        Number(kelas_id),
        nama_kelas || null,
        String(siswa_id),
        nama_siswa || null,
        nisn || null,
        String(nama_perusahaan).trim(),
        alamat || null,
        posisi || null,
        deskripsi_pekerjaan || null,
        pembimbing_industri || null,
        kontak_pembimbing || null,
        tanggal || new Date().toISOString().slice(0, 10),
        tanggal_selesai || null,
        foto_url,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Lokasi PKL berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[createLokasiPKL]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateLokasiPKL = async (req, res) => {
  const { id } = req.params;

  const {
    kelas_id,
    nama_kelas,
    siswa_id,
    nama_siswa,
    nisn,
    nama_perusahaan,
    alamat,
    posisi,
    deskripsi_pekerjaan,
    pembimbing_industri,
    kontak_pembimbing,
    tanggal,
    tanggal_selesai,
    foto_url: existingFotoUrl,
  } = req.body;

  if (!kelas_id) {
    return res.status(400).json({
      success: false,
      error: "Kelas wajib dipilih",
    });
  }

  if (!siswa_id) {
    return res.status(400).json({
      success: false,
      error: "Siswa wajib dipilih",
    });
  }

  if (!nama_perusahaan || !String(nama_perusahaan).trim()) {
    return res.status(400).json({
      success: false,
      error: "Nama perusahaan wajib diisi",
    });
  }

  let foto_url = existingFotoUrl || null;
  if (req.file) {
    foto_url = `/api/vocational/uploads/${req.file.filename}`;
  }

  try {
    const result = await db.query(
      `
      UPDATE laporan_lokasi_pkl
      SET
        kelas_id = $1,
        nama_kelas = $2,
        siswa_id = $3,
        nama_siswa = $4,
        nisn = $5,
        nama_perusahaan = $6,
        alamat = $7,
        posisi = $8,
        deskripsi_pekerjaan = $9,
        pembimbing_industri = $10,
        kontak_pembimbing = $11,
        tanggal = $12,
        tanggal_selesai = $13,
        foto_url = COALESCE($14, foto_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
      `,
      [
        Number(kelas_id),
        nama_kelas || null,
        String(siswa_id),
        nama_siswa || null,
        nisn || null,
        String(nama_perusahaan).trim(),
        alamat || null,
        posisi || null,
        deskripsi_pekerjaan || null,
        pembimbing_industri || null,
        kontak_pembimbing || null,
        tanggal || new Date().toISOString().slice(0, 10),
        tanggal_selesai || null,
        foto_url,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Data lokasi PKL tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Lokasi PKL berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[updateLokasiPKL]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteLokasiPKL = async (req, res) => {
  try {
    const result = await db.query(
      `
      DELETE FROM laporan_lokasi_pkl
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Data lokasi PKL tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Lokasi PKL berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteLokasiPKL]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ── PROGRES PKL ───────────────────────────────────────────────────────────

exports.getAllProgresPKL = async (req, res) => {
  const { kelas_id, siswa_id } = req.query;

  try {
    let query = `
      SELECT
        id,
        siswa_id,
        kelas_id,
        nama_siswa,
        nisn,
        minggu_ke,
        deskripsi,
        created_at,
        updated_at
      FROM laporan_progres_pkl
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;

    if (kelas_id) {
      query += ` AND kelas_id = $${idx++}`;
      params.push(Number(kelas_id));
    }

    if (siswa_id) {
      query += ` AND siswa_id = $${idx++}`;
      params.push(Number(siswa_id));
    }

    query += `
      ORDER BY
        nama_siswa ASC NULLS LAST,
        siswa_id ASC,
        minggu_ke ASC,
        id ASC
    `;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getAllProgresPKL]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createProgresPKL = async (req, res) => {
  const { siswa_id, kelas_id, nama_siswa, nisn, minggu_ke, deskripsi } =
    req.body;

  if (!siswa_id) {
    return res.status(400).json({
      success: false,
      error: "siswa_id wajib diisi",
    });
  }

  if (!minggu_ke) {
    return res.status(400).json({
      success: false,
      error: "minggu_ke wajib diisi",
    });
  }

  const siswaId = Number(siswa_id);
  const kelasId = kelas_id ? Number(kelas_id) : null;
  const mingguKe = Number(minggu_ke);

  if (!Number.isInteger(siswaId)) {
    return res.status(400).json({
      success: false,
      error: "siswa_id harus berupa angka",
    });
  }

  if (kelas_id && !Number.isInteger(kelasId)) {
    return res.status(400).json({
      success: false,
      error: "kelas_id harus berupa angka",
    });
  }

  if (!Number.isInteger(mingguKe) || mingguKe < 1) {
    return res.status(400).json({
      success: false,
      error: "minggu_ke harus berupa angka minimal 1",
    });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO laporan_progres_pkl (
        siswa_id,
        kelas_id,
        nama_siswa,
        nisn,
        minggu_ke,
        deskripsi,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        siswaId,
        kelasId,
        nama_siswa || null,
        nisn || null,
        mingguKe,
        deskripsi || null,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Progres PKL berhasil disimpan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[createProgresPKL]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateProgresPKL = async (req, res) => {
  const { id } = req.params;

  const { siswa_id, kelas_id, nama_siswa, nisn, minggu_ke, deskripsi } =
    req.body;

  if (!siswa_id) {
    return res.status(400).json({
      success: false,
      error: "siswa_id wajib diisi",
    });
  }

  if (!minggu_ke) {
    return res.status(400).json({
      success: false,
      error: "minggu_ke wajib diisi",
    });
  }

  const siswaId = Number(siswa_id);
  const kelasId = kelas_id ? Number(kelas_id) : null;
  const mingguKe = Number(minggu_ke);

  if (!Number.isInteger(siswaId)) {
    return res.status(400).json({
      success: false,
      error: "siswa_id harus berupa angka",
    });
  }

  if (kelas_id && !Number.isInteger(kelasId)) {
    return res.status(400).json({
      success: false,
      error: "kelas_id harus berupa angka",
    });
  }

  if (!Number.isInteger(mingguKe) || mingguKe < 1) {
    return res.status(400).json({
      success: false,
      error: "minggu_ke harus berupa angka minimal 1",
    });
  }

  try {
    const result = await db.query(
      `
      UPDATE laporan_progres_pkl
      SET
        siswa_id = $1,
        kelas_id = $2,
        nama_siswa = $3,
        nisn = $4,
        minggu_ke = $5,
        deskripsi = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [
        siswaId,
        kelasId,
        nama_siswa || null,
        nisn || null,
        mingguKe,
        deskripsi || null,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Data progres PKL tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Progres PKL berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[updateProgresPKL]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteProgresPKL = async (req, res) => {
  try {
    const result = await db.query(
      `
      DELETE FROM laporan_progres_pkl
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Data progres PKL tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Progres PKL berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteProgresPKL]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ── NILAI PKL ─────────────────────────────────────────────────────────────

exports.getNilaiPKL = async (req, res) => {
  const { kelas_id, siswa_id } = req.query;

  try {
    let query = `
      SELECT 
        id,
        siswa_id,
        kelas_id,
        nama_siswa,
        nisn,
        nilai_praktik,
        nilai_sikap,
        nilai_laporan,
        nilai_akhir,
        predikat,
        catatan,
        created_by,
        created_at,
        updated_at
      FROM nilai_pkl
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;

    if (kelas_id) {
      query += ` AND kelas_id = $${idx++}`;
      params.push(Number(kelas_id));
    }

    if (siswa_id) {
      query += ` AND siswa_id = $${idx++}`;
      params.push(Number(siswa_id));
    }

    query += ` ORDER BY nama_siswa ASC, siswa_id ASC`;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("[getNilaiPKL]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.saveNilaiPKLBulk = async (req, res) => {
  const { kelas_id, bobot, data_nilai } = req.body;

  if (!kelas_id || !Array.isArray(data_nilai) || data_nilai.length === 0) {
    return res.status(400).json({
      success: false,
      error: "kelas_id dan data_nilai wajib diisi",
    });
  }

  const kelasId = Number(kelas_id);

  if (!Number.isInteger(kelasId)) {
    return res.status(400).json({
      success: false,
      error: "kelas_id harus berupa angka",
    });
  }

  const bobotPraktik = Number(bobot?.praktik ?? 50);
  const bobotSikap = Number(bobot?.sikap ?? 30);
  const bobotLaporan = Number(bobot?.laporan ?? 20);
  const totalBobot = bobotPraktik + bobotSikap + bobotLaporan;

  if (totalBobot !== 100) {
    return res.status(400).json({
      success: false,
      error: "Total bobot praktik, sikap, dan laporan harus 100%",
    });
  }

  const createdBy = req.user?.id || req.userId || null;
  const results = [];

  try {
    for (const item of data_nilai) {
      const siswaId = Number(item.siswa_id);

      if (!Number.isInteger(siswaId)) {
        throw new Error(`siswa_id tidak valid: ${item.siswa_id}`);
      }

      const praktik = toNumber(item.nilai_praktik);
      const sikap = toNumber(item.nilai_sikap);
      const laporan = toNumber(item.nilai_laporan);

      const nilaiAkhir =
        praktik * (bobotPraktik / 100) +
        sikap * (bobotSikap / 100) +
        laporan * (bobotLaporan / 100);

      const nilaiAkhirFixed = Number(nilaiAkhir.toFixed(2));
      const predikat = getPredikat(nilaiAkhirFixed);

      const result = await db.query(
        `
        INSERT INTO nilai_pkl (
          siswa_id,
          kelas_id,
          nama_siswa,
          nisn,
          nilai_praktik,
          nilai_sikap,
          nilai_laporan,
          nilai_akhir,
          predikat,
          catatan,
          created_by,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP)
        ON CONFLICT (siswa_id, kelas_id)
        DO UPDATE SET
          nama_siswa = EXCLUDED.nama_siswa,
          nisn = EXCLUDED.nisn,
          nilai_praktik = EXCLUDED.nilai_praktik,
          nilai_sikap = EXCLUDED.nilai_sikap,
          nilai_laporan = EXCLUDED.nilai_laporan,
          nilai_akhir = EXCLUDED.nilai_akhir,
          predikat = EXCLUDED.predikat,
          catatan = EXCLUDED.catatan,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [
          siswaId,
          kelasId,
          item.nama_siswa || item.nama_lengkap || "",
          item.nisn || null,
          praktik,
          sikap,
          laporan,
          nilaiAkhirFixed,
          predikat,
          item.catatan || "",
          createdBy,
        ],
      );

      results.push(result.rows[0]);
    }

    return res.json({
      success: true,
      message: "Nilai PKL berhasil disimpan",
      data: results,
    });
  } catch (err) {
    console.error("[saveNilaiPKLBulk]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteNilaiPKL = async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM nilai_pkl WHERE id=$1 RETURNING id",
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Data nilai PKL tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Nilai PKL berhasil dihapus",
    });
  } catch (err) {
    console.error("[deleteNilaiPKL]", err);
    return res.status(500).json({ error: err.message });
  }
};

// ── SISWA (proxy dari academic service untuk vokasi) ──────────────────────

exports.getSiswaForVokasi = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const { kelas_id } = req.query;

    const siswa = await getSiswaFromAcademic(kelas_id, token);

    return res.json({
      success: true,
      data: siswa,
    });
  } catch (err) {
    console.error("[getSiswaForVokasi]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ── KELAS (proxy dari academic service untuk vokasi) ──────────────────────

exports.getKelasForVokasi = async (req, res) => {
  try {
    const token = req.headers["authorization"];

    const kelas = await getKelasFromAcademic(token);

    return res.json({
      success: true,
      data: kelas,
    });
  } catch (err) {
    console.error("[getKelasForVokasi]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
