const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { createError } = require("../middleware/errorHandler");

const DATA_FILE = path.join(__dirname, "../data/absensiGuru.json");

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
};

const readData = () => {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

const writeData = (rows) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2), "utf-8");
};

const isTerlambat = (date) => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return hour > 7 || (hour === 7 && minute > 30);
};

const getAllAbsensiGuru = (req, res, next) => {
  try {
    let rows = readData();
    const { user_id, tanggal, status } = req.query;

    if (user_id) rows = rows.filter((r) => String(r.user_id) === String(user_id));
    if (tanggal) rows = rows.filter((r) => r.tanggal === tanggal);
    if (status) rows = rows.filter((r) => r.status === status);

    rows.sort((a, b) => new Date(b.jamMasuk) - new Date(a.jamMasuk));

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

const getAbsensiGuruById = (req, res, next) => {
  try {
    const rows = readData();
    const item = rows.find((r) => r.id_absensiGuru === req.params.id);
    if (!item) throw createError(404, "Absensi guru tidak ditemukan");
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const createAbsensiGuru = (req, res, next) => {
  try {
    const { user_id, namaGuru, mataPelajaran, keterangan = "", foto = null } = req.body;
    if (!user_id || !namaGuru || !mataPelajaran) {
      throw createError(400, "Field user_id, namaGuru, mataPelajaran wajib diisi");
    }

    const rows = readData();
    const now = new Date();
    const tanggal = now.toISOString().slice(0, 10);
    const already = rows.find(
      (r) => String(r.user_id) === String(user_id) && r.tanggal === tanggal,
    );

    if (already) {
      throw createError(409, "Anda sudah melakukan absensi hari ini");
    }

    const item = {
      id_absensiGuru: uuidv4(),
      user_id,
      namaGuru,
      mataPelajaran,
      jamMasuk: now.toISOString(),
      tanggal,
      foto,
      status: isTerlambat(now) ? "terlambat" : "hadir",
      keterangan,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    rows.push(item);
    writeData(rows);

    res.status(201).json({
      success: true,
      message: "Absensi guru berhasil dicatat",
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const updateAbsensiGuru = (req, res, next) => {
  try {
    const rows = readData();
    const idx = rows.findIndex((r) => r.id_absensiGuru === req.params.id);
    if (idx === -1) throw createError(404, "Absensi guru tidak ditemukan");

    const { status, keterangan, foto } = req.body;
    if (status === undefined && keterangan === undefined && foto === undefined) {
      throw createError(400, "Tidak ada field yang akan diupdate");
    }

    rows[idx] = {
      ...rows[idx],
      ...(status !== undefined ? { status } : {}),
      ...(keterangan !== undefined ? { keterangan } : {}),
      ...(foto !== undefined ? { foto } : {}),
      updated_at: new Date().toISOString(),
    };

    writeData(rows);
    res.json({ success: true, message: "Absensi guru berhasil diperbarui", data: rows[idx] });
  } catch (err) {
    next(err);
  }
};

const deleteAbsensiGuru = (req, res, next) => {
  try {
    const rows = readData();
    const idx = rows.findIndex((r) => r.id_absensiGuru === req.params.id);
    if (idx === -1) throw createError(404, "Absensi guru tidak ditemukan");
    rows.splice(idx, 1);
    writeData(rows);
    res.json({ success: true, message: "Absensi guru berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAbsensiGuru,
  getAbsensiGuruById,
  createAbsensiGuru,
  updateAbsensiGuru,
  deleteAbsensiGuru,
};
