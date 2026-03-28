const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createError } = require('../middleware/errorHandler');

const DATA_FILE = path.join(__dirname, '../data/parenting.json');

const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

/**
 * GET /api/students/parenting
 * Query params:
 *   - search: cari berdasarkan ringkasanDiskusi
 */
exports.getAllParenting = (req, res, next) => {
  try {
    let data = readData();
    const { search } = req.query;

    // Wali kelas hanya melihat data miliknya sendiri
    const userId = req.user?.sub;
    if (userId) {
      data = data.filter((d) => d.user_id === userId);
    }

    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter((d) =>
        d.ringkasanDiskusi.toLowerCase().includes(keyword)
      );
    }

    // Urutkan dari yang terbaru
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/parenting/:id
 */
exports.getParentingById = (req, res, next) => {
  try {
    const data = readData();
    const item = data.find((d) => d.id_parenting === req.params.id);

    if (!item) {
      throw createError(404, `Data parenting dengan ID '${req.params.id}' tidak ditemukan`);
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/parenting
 * Body: { tanggal, ringkasanDiskusi, jumlahHadir, jumlahTotal, foto? }
 */
exports.createParenting = (req, res, next) => {
  try {
    const { tanggal, ringkasanDiskusi, jumlahHadir, jumlahTotal, foto } = req.body;

    // Validasi field wajib
    if (!tanggal || !ringkasanDiskusi || jumlahHadir === undefined || jumlahTotal === undefined) {
      throw createError(400, 'Field tanggal, ringkasanDiskusi, jumlahHadir, dan jumlahTotal wajib diisi');
    }
    if (jumlahHadir > jumlahTotal) {
      throw createError(400, 'Jumlah hadir tidak boleh melebihi jumlah total');
    }

    const data = readData();
    const now = new Date().toISOString();

    const newItem = {
      id_parenting: uuidv4(),
      user_id: req.user?.sub || 'unknown',
      tanggal,
      ringkasanDiskusi,
      jumlahHadir: parseInt(jumlahHadir),
      jumlahTotal: parseInt(jumlahTotal),
      foto: foto || null,
      created_at: now,
      updated_at: now,
    };

    data.push(newItem);
    writeData(data);

    res.status(201).json({ success: true, message: 'Data parenting berhasil ditambahkan', data: newItem });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/parenting/:id
 * Body: { tanggal?, ringkasanDiskusi?, jumlahHadir?, jumlahTotal?, foto? }
 */
exports.updateParenting = (req, res, next) => {
  try {
    const data = readData();
    const index = data.findIndex((d) => d.id_parenting === req.params.id);

    if (index === -1) {
      throw createError(404, `Data parenting dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const { tanggal, ringkasanDiskusi, jumlahHadir, jumlahTotal, foto } = req.body;

    const jumlahHadirBaru = jumlahHadir !== undefined ? parseInt(jumlahHadir) : data[index].jumlahHadir;
    const jumlahTotalBaru = jumlahTotal !== undefined ? parseInt(jumlahTotal) : data[index].jumlahTotal;

    if (jumlahHadirBaru > jumlahTotalBaru) {
      throw createError(400, 'Jumlah hadir tidak boleh melebihi jumlah total');
    }

    data[index] = {
      ...data[index],
      ...(tanggal && { tanggal }),
      ...(ringkasanDiskusi && { ringkasanDiskusi }),
      jumlahHadir: jumlahHadirBaru,
      jumlahTotal: jumlahTotalBaru,
      ...(foto !== undefined && { foto }),
      updated_at: new Date().toISOString(),
    };

    writeData(data);
    res.json({ success: true, message: 'Data parenting berhasil diperbarui', data: data[index] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/parenting/:id
 */
exports.deleteParenting = (req, res, next) => {
  try {
    const data = readData();
    const index = data.findIndex((d) => d.id_parenting === req.params.id);

    if (index === -1) {
      throw createError(404, `Data parenting dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const deleted = data.splice(index, 1)[0];
    writeData(data);

    res.json({ success: true, message: 'Data parenting berhasil dihapus', data: deleted });
  } catch (err) {
    next(err);
  }
};