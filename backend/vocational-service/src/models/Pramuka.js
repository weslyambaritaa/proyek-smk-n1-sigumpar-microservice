const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Regu / kelompok pramuka
const KelasPramuka = sequelize.define('KelasPramuka', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_regu: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'kelas_pramuka', timestamps: false });

// Mapping siswa ke regu
const AnggotaRegu = sequelize.define('AnggotaRegu', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regu_id:      { type: DataTypes.INTEGER },
  siswa_id:     { type: DataTypes.INTEGER, allowNull: false },
  nama_lengkap: { type: DataTypes.STRING(150) },
}, { tableName: 'anggota_regu', timestamps: false });

// Absensi per-pertemuan pramuka
const AbsensiPramuka = sequelize.define('AbsensiPramuka', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regu_id:      { type: DataTypes.INTEGER },
  siswa_id:     { type: DataTypes.INTEGER, allowNull: false },
  tanggal:      { type: DataTypes.DATEONLY, allowNull: false },
  status:       { type: DataTypes.STRING(20), allowNull: false },
  nama_lengkap: { type: DataTypes.STRING(150) },
  kelas_id:     { type: DataTypes.INTEGER },
}, {
  tableName: 'absensi_pramuka',
  timestamps: false,
  indexes: [{ unique: true, fields: ['regu_id', 'siswa_id', 'tanggal'], name: 'idx_absensi_pramuka_unique' }],
});

// Laporan kegiatan per-pertemuan pramuka
const LaporanPramuka = sequelize.define('LaporanPramuka', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regu_id:   { type: DataTypes.INTEGER },
  tanggal:   { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  deskripsi: { type: DataTypes.TEXT },
  file_url:  { type: DataTypes.TEXT },
}, { tableName: 'laporan_pramuka', timestamps: false });

// Silabus / kurikulum pramuka (file disimpan sebagai BYTEA di DB)
const SilabusPramuka = sequelize.define('SilabusPramuka', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tingkat_kelas:  { type: DataTypes.STRING(20) },
  judul_kegiatan: { type: DataTypes.STRING(255), allowNull: false },
  tanggal:        { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  file_data:      { type: DataTypes.BLOB },
  file_mime:      { type: DataTypes.STRING(100) },
  file_nama:      { type: DataTypes.STRING(255) },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'silabus_pramuka', timestamps: false });

// Laporan kegiatan besar pramuka (file disimpan sebagai BYTEA di DB)
const LaporanKegiatan = sequelize.define('LaporanKegiatan', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  judul:     { type: DataTypes.STRING(255), allowNull: false },
  deskripsi: { type: DataTypes.TEXT },
  tanggal:   { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  file_data:  { type: DataTypes.BLOB },
  file_mime:  { type: DataTypes.STRING(100) },
  file_nama:  { type: DataTypes.STRING(255) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'laporan_kegiatan', timestamps: false });

// ─── ASOSIASI ────────────────────────────────────────────────────────────────
AnggotaRegu.belongsTo(KelasPramuka,  { foreignKey: 'regu_id', as: 'regu' });
KelasPramuka.hasMany(AnggotaRegu,    { foreignKey: 'regu_id', as: 'anggota' });

AbsensiPramuka.belongsTo(KelasPramuka, { foreignKey: 'regu_id', as: 'regu' });
KelasPramuka.hasMany(AbsensiPramuka,   { foreignKey: 'regu_id', as: 'absensi' });

LaporanPramuka.belongsTo(KelasPramuka, { foreignKey: 'regu_id', as: 'regu' });
KelasPramuka.hasMany(LaporanPramuka,   { foreignKey: 'regu_id', as: 'laporan' });

module.exports = {
  KelasPramuka,
  AnggotaRegu,
  AbsensiPramuka,
  LaporanPramuka,
  SilabusPramuka,
  LaporanKegiatan,
};