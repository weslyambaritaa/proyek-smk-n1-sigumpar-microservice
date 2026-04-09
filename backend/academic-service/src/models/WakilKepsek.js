const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WakilProgramKerja = sequelize.define('WakilProgramKerja', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_program:     { type: DataTypes.STRING(200), allowNull: false },
  bidang:           { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Kurikulum' },
  tanggal_mulai:    { type: DataTypes.DATEONLY, allowNull: false },
  tanggal_selesai:  { type: DataTypes.DATEONLY },
  penanggung_jawab: { type: DataTypes.STRING(150) },
  status: {
    type: DataTypes.STRING(30), allowNull: false, defaultValue: 'belum_mulai',
    validate: { isIn: [['belum_mulai', 'sedang_berjalan', 'selesai', 'ditunda']] },
  },
  deskripsi:  { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'wakil_program_kerja', timestamps: false });

const WakilSupervisi = sequelize.define('WakilSupervisi', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:         { type: DataTypes.INTEGER, allowNull: false },
  tanggal:         { type: DataTypes.DATEONLY, allowNull: false },
  kelas:           { type: DataTypes.STRING(50) },
  mata_pelajaran:  { type: DataTypes.STRING(100) },
  aspek_penilaian: { type: DataTypes.TEXT },
  nilai:           { type: DataTypes.DECIMAL(5, 2), validate: { min: 0, max: 100 } },
  catatan:         { type: DataTypes.TEXT },
  rekomendasi:     { type: DataTypes.TEXT },
  created_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'wakil_supervisi', timestamps: false });

const WakilPerangkatPembelajaran = sequelize.define('WakilPerangkatPembelajaran', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:        { type: DataTypes.INTEGER, allowNull: false },
  nama_perangkat: { type: DataTypes.STRING(200), allowNull: false },
  jenis:          { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'RPP' },
  status: {
    type: DataTypes.STRING(30), allowNull: false, defaultValue: 'belum_lengkap',
    validate: { isIn: [['lengkap', 'belum_lengkap']] },
  },
  catatan:    { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'wakil_perangkat_pembelajaran', timestamps: false });

module.exports = { WakilProgramKerja, WakilSupervisi, WakilPerangkatPembelajaran };