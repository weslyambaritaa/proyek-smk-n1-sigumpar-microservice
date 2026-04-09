const sequelize = require('../config/db');

const AbsensiGuru           = require('./AbsensiGuru');
const PerangkatPembelajaran = require('./PerangkatPembelajaran');
const { EvaluasiKinerjaGuru, ReviewKepsek, ReviewWakasek } = require('./Kepsek');

// ─── ASOSIASI ────────────────────────────────────────────────────────────────

ReviewKepsek.belongsTo(PerangkatPembelajaran, { foreignKey: 'perangkat_id', as: 'perangkat' });
PerangkatPembelajaran.hasMany(ReviewKepsek,   { foreignKey: 'perangkat_id', as: 'reviews' });

// ─── EKSPOR ──────────────────────────────────────────────────────────────────

module.exports = {
  sequelize,
  // Guru
  AbsensiGuru,
  PerangkatPembelajaran,
  // Kepala Sekolah
  EvaluasiKinerjaGuru,
  ReviewKepsek,
  ReviewWakasek,
};