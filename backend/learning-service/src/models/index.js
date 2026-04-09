const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// ─── ABSENSI GURU ─────────────────────────────────────────────────────────────
const AbsensiGuru = sequelize.define('AbsensiGuru', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_absensiguru: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
  user_id:        { type: DataTypes.UUID, allowNull: false },
  nama_guru:      { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'Unknown' },
  mata_pelajaran: { type: DataTypes.STRING(255), defaultValue: '-' },
  jam_masuk:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tanggal:        { type: DataTypes.DATEONLY, allowNull: false },
  foto:           { type: DataTypes.TEXT },
  status: {
    type: DataTypes.STRING(20), allowNull: false, defaultValue: 'hadir',
    validate: { isIn: [['hadir', 'terlambat', 'izin', 'sakit', 'alpa']] },
  },
  keterangan: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'absensi_guru',
  timestamps: false,
  indexes: [{ unique: true, fields: ['user_id', 'tanggal'] }],
});

// ─── CATATAN MENGAJAR ─────────────────────────────────────────────────────────
const CatatanMengajar = sequelize.define('CatatanMengajar', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:  { type: DataTypes.UUID },
  kelas_id: { type: DataTypes.INTEGER },
  materi:   { type: DataTypes.TEXT },
}, { tableName: 'catatan_mengajar', timestamps: false });

// ─── EVALUASI GURU ────────────────────────────────────────────────────────────
// Tabel ini digunakan oleh kepsekController (evaluasi kinerja guru)
const EvaluasiKinerjaGuru = sequelize.define('EvaluasiKinerjaGuru', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_nama: { type: DataTypes.STRING(150) },
  mapel:     { type: DataTypes.STRING(100) },
  semester:  { type: DataTypes.STRING(20) },
  status:    { type: DataTypes.STRING(50) },
  skor:      { type: DataTypes.INTEGER },
  catatan:   { type: DataTypes.TEXT },
}, { tableName: 'evaluasi_kinerja_guru', timestamps: false });

// ─── PERANGKAT PEMBELAJARAN ───────────────────────────────────────────────────
const PerangkatPembelajaran = sequelize.define('PerangkatPembelajaran', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:        { type: DataTypes.UUID, allowNull: false },
  nama_guru:      { type: DataTypes.STRING(150) },
  nama_dokumen:   { type: DataTypes.STRING(200), allowNull: false },
  jenis_dokumen:  { type: DataTypes.STRING(50), allowNull: false },
  file_name:      { type: DataTypes.STRING(255) },
  file_data:      { type: DataTypes.BLOB },
  file_mime:      { type: DataTypes.STRING(100) },
  status_review: {
    type: DataTypes.STRING(20), defaultValue: 'menunggu',
    validate: { isIn: [['menunggu', 'disetujui', 'revisi', 'ditolak']] },
  },
  catatan_review: { type: DataTypes.TEXT },
  reviewed_by:    { type: DataTypes.STRING(150) },
  reviewed_at:    { type: DataTypes.DATE },
  versi:          { type: DataTypes.INTEGER, defaultValue: 1 },
  parent_id:      { type: DataTypes.INTEGER },
  tanggal_upload: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'perangkat_pembelajaran', timestamps: false });

// ─── REVIEW KEPSEK ────────────────────────────────────────────────────────────
const ReviewKepsek = sequelize.define('ReviewKepsek', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  perangkat_id: { type: DataTypes.INTEGER, references: { model: 'perangkat_pembelajaran', key: 'id' } },
  status:       { type: DataTypes.STRING(20) },
  komentar:     { type: DataTypes.TEXT },
  kepsek_id:    { type: DataTypes.UUID },
  kepsek_nama:  { type: DataTypes.STRING(150) },
  created_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'review_kepsek', timestamps: false });

// ─── REVIEW WAKASEK ───────────────────────────────────────────────────────────
const ReviewWakasek = sequelize.define('ReviewWakasek', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  perangkat_id: { type: DataTypes.INTEGER },
  komentar:     { type: DataTypes.TEXT },
}, { tableName: 'review_wakasek', timestamps: false });

// ─── ASOSIASI ────────────────────────────────────────────────────────────────
ReviewKepsek.belongsTo(PerangkatPembelajaran, { foreignKey: 'perangkat_id', as: 'perangkat' });
PerangkatPembelajaran.hasMany(ReviewKepsek,   { foreignKey: 'perangkat_id', as: 'reviews' });

module.exports = {
  sequelize,
  AbsensiGuru,
  CatatanMengajar,
  EvaluasiKinerjaGuru,
  PerangkatPembelajaran,
  ReviewKepsek,
  ReviewWakasek,
};