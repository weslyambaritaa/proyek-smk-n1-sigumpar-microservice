const axios = require('axios');
const { QueryTypes } = require('sequelize');
const {
  sequelize,
  LaporanLokasiPKL,
  LaporanProgresPKL,
  NilaiPKL,
} = require('../models');
const { createError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ── Helper: ambil data dari academic-service ──────────────────────────────

const getSiswaFromAcademic = async (kelas_id, authToken) => {
  try {
    const url  = `http://academic-service:3003/api/academic/siswa${kelas_id ? `?kelas_id=${kelas_id}` : ''}`;
    const resp = await axios.get(url, {
      headers: authToken ? { Authorization: authToken } : {},
      timeout: 5000,
    });
    const data = resp.data;
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error('[getSiswaFromAcademic]', err.message);
    return [];
  }
};

const getKelasFromAcademic = async (authToken) => {
  try {
    const resp = await axios.get('http://academic-service:3003/api/academic/kelas', {
      headers: authToken ? { Authorization: authToken } : {},
      timeout: 5000,
    });
    const data = resp.data;
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error('[getKelasFromAcademic]', err.message);
    return [];
  }
};

// ── LOKASI PKL ────────────────────────────────────────────────────────────

exports.getAllLokasiPKL = asyncHandler(async (req, res) => {
  const data = await LaporanLokasiPKL.findAll({
    order: [['created_at', 'DESC'], ['id', 'ASC']],
  });
  res.json({ success: true, data });
});

exports.createLokasiPKL = asyncHandler(async (req, res) => {
  const {
    siswa_id, nama_siswa, nama_perusahaan, alamat, posisi,
    deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal,
  } = req.body;
  if (!nama_perusahaan) throw createError(400, 'nama_perusahaan wajib diisi');

  const foto_url = req.file ? `/api/vocational/uploads/${req.file.filename}` : null;

  const data = await LaporanLokasiPKL.create({
    siswa_id:            siswa_id ? String(siswa_id) : null,
    nama_siswa:          nama_siswa          || null,
    nama_perusahaan,
    alamat:              alamat              || null,
    posisi:              posisi              || null,
    deskripsi_pekerjaan: deskripsi_pekerjaan || null,
    pembimbing_industri: pembimbing_industri || null,
    kontak_pembimbing:   kontak_pembimbing   || null,
    tanggal:             tanggal             || new Date().toISOString().slice(0, 10),
    foto_url,
  });
  res.status(201).json({ success: true, data });
});

exports.updateLokasiPKL = asyncHandler(async (req, res) => {
  const {
    nama_siswa, nama_perusahaan, alamat, posisi,
    deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal,
  } = req.body;
  if (!nama_perusahaan) throw createError(400, 'nama_perusahaan wajib diisi');

  const lokasi = await LaporanLokasiPKL.findByPk(req.params.id);
  if (!lokasi) throw createError(404, 'Data PKL tidak ditemukan');

  const foto_url = req.file
    ? `/api/vocational/uploads/${req.file.filename}`
    : req.body.foto_url || lokasi.foto_url;

  await lokasi.update({
    nama_siswa, nama_perusahaan, alamat, posisi,
    deskripsi_pekerjaan, pembimbing_industri, kontak_pembimbing, tanggal, foto_url,
  });
  res.json({ success: true, data: lokasi });
});

exports.deleteLokasiPKL = asyncHandler(async (req, res) => {
  const lokasi = await LaporanLokasiPKL.findByPk(req.params.id);
  if (!lokasi) throw createError(404, 'Data PKL tidak ditemukan');
  await lokasi.destroy();
  res.json({ success: true, message: 'Data berhasil dihapus' });
});

// ── PROGRES PKL ───────────────────────────────────────────────────────────

exports.getAllProgresPKL = asyncHandler(async (req, res) => {
  const data = await LaporanProgresPKL.findAll({
    order: [['siswa_id', 'ASC'], ['minggu_ke', 'ASC']],
  });
  res.json({ success: true, data });
});

exports.createProgresPKL = asyncHandler(async (req, res) => {
  const { siswa_id, minggu_ke, deskripsi } = req.body;
  if (!siswa_id || !minggu_ke) throw createError(400, 'siswa_id dan minggu_ke wajib diisi');

  const data = await LaporanProgresPKL.create({ siswa_id, minggu_ke, deskripsi: deskripsi || null });
  res.status(201).json({ success: true, data });
});

exports.updateProgresPKL = asyncHandler(async (req, res) => {
  const { minggu_ke, deskripsi } = req.body;
  if (!minggu_ke) throw createError(400, 'minggu_ke wajib diisi');

  const progres = await LaporanProgresPKL.findByPk(req.params.id);
  if (!progres) throw createError(404, 'Data progres tidak ditemukan');

  await progres.update({ minggu_ke, deskripsi });
  res.json({ success: true, data: progres });
});

exports.deleteProgresPKL = asyncHandler(async (req, res) => {
  const progres = await LaporanProgresPKL.findByPk(req.params.id);
  if (!progres) throw createError(404, 'Data progres tidak ditemukan');
  await progres.destroy();
  res.json({ success: true, message: 'Data progres berhasil dihapus' });
});

// ── NILAI PKL ─────────────────────────────────────────────────────────────

exports.getNilaiPKL = asyncHandler(async (req, res) => {
  const { kelas_id, siswa_id } = req.query;
  const where = {};
  if (kelas_id) where.kelas_id = kelas_id;
  if (siswa_id) where.siswa_id = siswa_id;

  const nilaiRows = await NilaiPKL.findAll({ where, order: [['siswa_id', 'ASC']] });

  let siswaList = [];
  if (kelas_id) {
    siswaList = await getSiswaFromAcademic(kelas_id, req.headers['authorization']);
  }

  const merged = nilaiRows.map(n => {
    const siswa = siswaList.find(s => String(s.id) === String(n.siswa_id));
    return {
      ...n.toJSON(),
      nama_siswa: siswa?.nama_lengkap || n.nama_siswa || '-',
      nisn:       siswa?.nisn         || '-',
    };
  });

  res.json({ success: true, data: merged });
});

exports.saveNilaiPKLBulk = asyncHandler(async (req, res) => {
  const { kelas_id, nilai } = req.body;
  if (!Array.isArray(nilai) || !nilai.length) {
    throw createError(400, 'Data nilai wajib diisi');
  }

  const results = await sequelize.transaction(async (t) => {
    const saved = [];
    for (const item of nilai) {
      const { siswa_id, nama_siswa, nilai_praktik, nilai_sikap, nilai_laporan } = item;
      if (!siswa_id) continue;

      // Raw query diperlukan karena ON CONFLICT merujuk composite unique index
      const [row] = await sequelize.query(
        `INSERT INTO nilai_pkl (siswa_id, kelas_id, nama_siswa, nilai_praktik, nilai_sikap, nilai_laporan, updated_at)
         VALUES (:siswa_id, :kelas_id, :nama_siswa, :nilai_praktik, :nilai_sikap, :nilai_laporan, NOW())
         ON CONFLICT (siswa_id, kelas_id)
         DO UPDATE SET
           nama_siswa    = EXCLUDED.nama_siswa,
           nilai_praktik = EXCLUDED.nilai_praktik,
           nilai_sikap   = EXCLUDED.nilai_sikap,
           nilai_laporan = EXCLUDED.nilai_laporan,
           updated_at    = NOW()
         RETURNING *`,
        {
          replacements: {
            siswa_id,
            kelas_id:      kelas_id   || null,
            nama_siswa:    nama_siswa || null,
            nilai_praktik: Number(nilai_praktik) || 0,
            nilai_sikap:   Number(nilai_sikap)   || 0,
            nilai_laporan: Number(nilai_laporan) || 0,
          },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );
      saved.push(row);
    }
    return saved;
  });

  res.json({ success: true, message: 'Nilai PKL berhasil disimpan', data: results });
});

exports.deleteNilaiPKL = asyncHandler(async (req, res) => {
  const nilai = await NilaiPKL.findByPk(req.params.id);
  if (!nilai) throw createError(404, 'Data nilai tidak ditemukan');
  await nilai.destroy();
  res.json({ success: true, message: 'Nilai PKL berhasil dihapus' });
});

// ── PROXY SISWA & KELAS dari academic-service ─────────────────────────────

exports.getSiswaForVokasi = asyncHandler(async (req, res) => {
  const siswa = await getSiswaFromAcademic(req.query.kelas_id, req.headers['authorization']);
  res.json({ success: true, data: siswa });
});

exports.getKelasForVokasi = asyncHandler(async (req, res) => {
  const kelas = await getKelasFromAcademic(req.headers['authorization']);
  res.json({ success: true, data: kelas });
});