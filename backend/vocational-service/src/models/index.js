const sequelize = require('../config/db');

const {
  KelasPramuka,
  AnggotaRegu,
  AbsensiPramuka,
  LaporanPramuka,
  SilabusPramuka,
  LaporanKegiatan,
} = require('./Pramuka');

const { LaporanLokasiPKL, LaporanProgresPKL, NilaiPKL } = require('./PKL');

// Asosiasi sudah didefinisikan di dalam masing-masing file model.
// index.js hanya bertugas mengumpulkan dan mengekspor semua model.

module.exports = {
  sequelize,
  // Pramuka
  KelasPramuka,
  AnggotaRegu,
  AbsensiPramuka,
  LaporanPramuka,
  SilabusPramuka,
  LaporanKegiatan,
  // PKL
  LaporanLokasiPKL,
  LaporanProgresPKL,
  NilaiPKL,
};