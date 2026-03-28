const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createError } = require('../middleware/errorHandler');

const DATA_FILE = path.join(__dirname, '../data/refleksi.json');

const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

/**
 * GET /api/students/refleksi
 * Query params:
 *   - search: cari berdasarkan perkembanganSiswa atau masalahKelas
 */
exports.getAllRefleksi = (req, res, next) => {
  try {
    let data = readData();
    const { search } = req.query;

    // Wali kelas hanya melihat data miliknya
    const userId = req.user?.sub;
    if (userId) {
      data = data.filter((d) => d.user_id === userId);
    }

    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.perkembanganSiswa.toLowerCase().includes(keyword) ||
          d.masalahKelas.toLowerCase().includes(keyword)
      );
    }

    // Urutkan dari yang terbaru (created_at)
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/refleksi/:id
 */
exports.getRefleksiById = (req, res, next) => {
  try {
    const data = readData();
    const item = data.find((d) => d.id_refleksi === req.params.id);

    if (!item) {
      throw createError(404, `Data refleksi dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/refleksi
 * Body: { perkembanganSiswa, masalahKelas }
 */
exports.createRefleksi = (req, res, next) => {
  try {
    const { perkembanganSiswa, masalahKelas } = req.body;

    if (!perkembanganSiswa || !masalahKelas) {
      throw createError(400, 'Field perkembanganSiswa dan masalahKelas wajib diisi');
    }

    const data = readData();
    const now = new Date().toISOString();

    const newItem = {
      id_refleksi: uuidv4(),
      user_id: req.user?.sub || 'unknown',
      perkembanganSiswa,
      masalahKelas,
      created_at: now,
      updated_at: now,
    };

    data.push(newItem);
    writeData(data);

    res.status(201).json({
      success: true,
      message: 'Data refleksi berhasil ditambahkan',
      data: newItem,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/refleksi/:id
 * Body: { perkembanganSiswa?, masalahKelas? }
 */
exports.updateRefleksi = (req, res, next) => {
  try {
    const data = readData();
    const index = data.findIndex((d) => d.id_refleksi === req.params.id);

    if (index === -1) {
      throw createError(404, `Data refleksi dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const { perkembanganSiswa, masalahKelas } = req.body;

    if (!perkembanganSiswa && !masalahKelas) {
      throw createError(400, 'Minimal satu field (perkembanganSiswa atau masalahKelas) harus diisi');
    }

    data[index] = {
      ...data[index],
      ...(perkembanganSiswa && { perkembanganSiswa }),
      ...(masalahKelas && { masalahKelas }),
      updated_at: new Date().toISOString(),
    };

    writeData(data);
    res.json({
      success: true,
      message: 'Data refleksi berhasil diperbarui',
      data: data[index],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/refleksi/:id
 */
exports.deleteRefleksi = (req, res, next) => {
  try {
    const data = readData();
    const index = data.findIndex((d) => d.id_refleksi === req.params.id);

    if (index === -1) {
      throw createError(404, `Data refleksi dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const deleted = data.splice(index, 1)[0];
    writeData(data);

    res.json({
      success: true,
      message: 'Data refleksi berhasil dihapus',
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};