const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createError } = require('../middleware/errorHandler');

const DATA_FILE = path.join(__dirname, '../data/kebersihanKelas.json');

const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

/**
 * GET /api/students/kebersihan-kelas
 * Query params:
 *   - search    : cari berdasarkan catatanKondisi
 *   - startDate : filter mulai tanggal (YYYY-MM-DD)
 *   - endDate   : filter sampai tanggal (YYYY-MM-DD)
 */
exports.getAllKebersihanKelas = (req, res, next) => {
  try {
    let data = readData();
    const { search, startDate, endDate } = req.query;

    // Wali kelas hanya melihat data miliknya
    const userId = req.user?.sub;
    if (userId) {
      data = data.filter((d) => d.user_id === userId);
    }

    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter((d) =>
        d.catatanKondisi.toLowerCase().includes(keyword)
      );
    }
    if (startDate) {
      data = data.filter((d) => d.tanggal >= startDate);
    }
    if (endDate) {
      data = data.filter((d) => d.tanggal <= endDate);
    }

    // Urutkan dari yang terbaru
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/kebersihan-kelas/:id
 */
exports.getKebersihanKelasById = (req, res, next) => {
  try {
    const data = readData();
    const item = data.find((d) => d.id_kebersihanKelas === req.params.id);

    if (!item) {
      throw createError(404, `Data kebersihan dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/kebersihan-kelas
 * Body: { tanggal, catatanKondisi, foto? }
 */
exports.createKebersihanKelas = (req, res, next) => {
  try {
    const { tanggal, catatanKondisi, foto } = req.body;

    if (!tanggal || !catatanKondisi) {
      throw createError(400, 'Field tanggal dan catatanKondisi wajib diisi');
    }

    const data = readData();
    const now = new Date().toISOString();

    // Cek apakah sudah ada catatan untuk tanggal yang sama oleh user yang sama
    const userId = req.user?.sub || 'unknown';
    const sudahAda = data.some((d) => d.tanggal === tanggal && d.user_id === userId);
    if (sudahAda) {
      throw createError(409, `Catatan kebersihan untuk tanggal ${tanggal} sudah ada`);
    }

    const newItem = {
      id_kebersihanKelas: uuidv4(),
      user_id: userId,
      tanggal,
      catatanKondisi,
      foto: foto || null,
      created_at: now,
      updated_at: now,
    };

    data.push(newItem);
    writeData(data);

    res.status(201).json({
      success: true,
      message: 'Catatan kebersihan kelas berhasil ditambahkan',
      data: newItem,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/kebersihan-kelas/:id
 * Body: { tanggal?, catatanKondisi?, foto? }
 */
exports.updateKebersihanKelas = (req, res, next) => {
  try {
    const data = readData();
    const index = data.findIndex((d) => d.id_kebersihanKelas === req.params.id);

    if (index === -1) {
      throw createError(404, `Data kebersihan dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const { tanggal, catatanKondisi, foto } = req.body;

    data[index] = {
      ...data[index],
      ...(tanggal && { tanggal }),
      ...(catatanKondisi && { catatanKondisi }),
      ...(foto !== undefined && { foto }),
      updated_at: new Date().toISOString(),
    };

    writeData(data);
    res.json({
      success: true,
      message: 'Catatan kebersihan kelas berhasil diperbarui',
      data: data[index],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/kebersihan-kelas/:id
 */
exports.deleteKebersihanKelas = (req, res, next) => {
  try {
    const data = readData();
    const index = data.findIndex((d) => d.id_kebersihanKelas === req.params.id);

    if (index === -1) {
      throw createError(404, `Data kebersihan dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const deleted = data.splice(index, 1)[0];
    writeData(data);

    res.json({
      success: true,
      message: 'Catatan kebersihan kelas berhasil dihapus',
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};