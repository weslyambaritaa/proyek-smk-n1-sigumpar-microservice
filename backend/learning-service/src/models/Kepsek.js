const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Evaluasi kinerja guru — diinput oleh Kepala Sekolah
const EvaluasiKinerjaGuru = sequelize.define('EvaluasiKinerjaGuru', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_nama: { type: DataTypes.STRING(150) },
  mapel:     { type: DataTypes.STRING(100) },
  semester:  { type: DataTypes.STRING(20) },
  status:    { type: DataTypes.STRING(50) },
  skor:      { type: DataTypes.INTEGER },
  catatan:   { type: DataTypes.TEXT },
}, { tableName: 'evaluasi_kinerja_guru', timestamps: false });

// Riwayat review perangkat pembelajaran oleh Kepala Sekolah
const ReviewKepsek = sequelize.define('ReviewKepsek', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  perangkat_id: { type: DataTypes.INTEGER },
  status:       { type: DataTypes.STRING(20) },
  komentar:     { type: DataTypes.TEXT },
  kepsek_id:    { type: DataTypes.UUID },
  kepsek_nama:  { type: DataTypes.STRING(150) },
  created_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'review_kepsek', timestamps: false });

// Review oleh Wakil Kepala Sekolah
const ReviewWakasek = sequelize.define('ReviewWakasek', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  perangkat_id: { type: DataTypes.INTEGER },
  komentar:     { type: DataTypes.TEXT },
}, { tableName: 'review_wakasek', timestamps: false });

module.exports = { EvaluasiKinerjaGuru, ReviewKepsek, ReviewWakasek };