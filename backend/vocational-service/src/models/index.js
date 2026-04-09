const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// ─── PRAMUKA ──────────────────────────────────────────────────────────────────

const KelasPramuka = sequelize.define('KelasPramuka', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_regu: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'kelas_pramuka', timestamps: false });

const AnggotaRegu = sequelize.define('AnggotaRegu', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regu_id:      { type: DataTypes.INTEGER, references: { model: 'kelas_pramuka', key: 'id' } },
  siswa_id:     { type: DataTypes.INTEGER, allowNull: false },
  nama_lengkap: { type: DataTypes.STRING(150) },
}, { tableName: 'anggota_regu', timestamps: false });

const AbsensiPramuka = sequelize.define('AbsensiPramuka', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regu_id:      { type: DataTypes.INTEGER, references: { model: 'kelas_pramuka', key: 'id' } },
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

const LaporanPramuka = sequelize.define('LaporanPramuka', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regu_id:   { type: DataTypes.INTEGER, references: { model: 'kelas_pramuka', key: 'id' } },
  tanggal:   { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  deskripsi: { type: DataTypes.TEXT },
  file_url:  { type: DataTypes.TEXT },
}, { tableName: 'laporan_pramuka', timestamps: false });

const SilabusPramuka = sequelize.define('SilabusPramuka', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tingkat_kelas:   { type: DataTypes.STRING(20) },
  judul_kegiatan:  { type: DataTypes.STRING(255), allowNull: false },
  tanggal:         { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  file_data:       { type: DataTypes.BLOB },
  file_mime:       { type: DataTypes.STRING(100) },
  file_nama:       { type: DataTypes.STRING(255) },
  created_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'silabus_pramuka', timestamps: false });

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

// ─── PKL ──────────────────────────────────────────────────────────────────────

const LaporanLokasiPKL = sequelize.define('LaporanLokasiPKL', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:             { type: DataTypes.STRING },
  nama_siswa:           { type: DataTypes.STRING(150) },
  nama_perusahaan:      { type: DataTypes.STRING(150), allowNull: false },
  alamat:               { type: DataTypes.TEXT },
  posisi:               { type: DataTypes.STRING(150) },
  deskripsi_pekerjaan:  { type: DataTypes.TEXT },
  pembimbing_industri:  { type: DataTypes.STRING(150) },
  kontak_pembimbing:    { type: DataTypes.STRING(100) },
  foto_url:             { type: DataTypes.TEXT },
  tanggal:              { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  created_at:           { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'laporan_lokasi_pkl', timestamps: false });

const LaporanProgresPKL = sequelize.define('LaporanProgresPKL', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:  { type: DataTypes.INTEGER },
  minggu_ke: { type: DataTypes.INTEGER },
  deskripsi: { type: DataTypes.TEXT },
}, { tableName: 'laporan_progres_pkl', timestamps: false });

const NilaiPKL = sequelize.define('NilaiPKL', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siswa_id:       { type: DataTypes.INTEGER, allowNull: false },
  kelas_id:       { type: DataTypes.INTEGER },
  nama_siswa:     { type: DataTypes.STRING(150) },
  nilai_praktik:  { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_sikap:    { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  nilai_laporan:  { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'nilai_pkl',
  timestamps: false,
  indexes: [{ unique: true, fields: ['siswa_id', 'kelas_id'], name: 'unique_nilai_pkl' }],
});

// ─── ASOSIASI ────────────────────────────────────────────────────────────────
AnggotaRegu.belongsTo(KelasPramuka,   { foreignKey: 'regu_id', as: 'regu' });
KelasPramuka.hasMany(AnggotaRegu,     { foreignKey: 'regu_id', as: 'anggota' });

AbsensiPramuka.belongsTo(KelasPramuka, { foreignKey: 'regu_id', as: 'regu' });
KelasPramuka.hasMany(AbsensiPramuka,   { foreignKey: 'regu_id', as: 'absensi' });

LaporanPramuka.belongsTo(KelasPramuka, { foreignKey: 'regu_id', as: 'regu' });
KelasPramuka.hasMany(LaporanPramuka,   { foreignKey: 'regu_id', as: 'laporan' });

module.exports = {
  sequelize,
  KelasPramuka,
  AnggotaRegu,
  AbsensiPramuka,
  LaporanPramuka,
  SilabusPramuka,
  LaporanKegiatan,
  LaporanLokasiPKL,
  LaporanProgresPKL,
  NilaiPKL,
};