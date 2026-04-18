const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PerangkatPembelajaran = sequelize.define('PerangkatPembelajaran', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guru_id:       { type: DataTypes.UUID, allowNull: false },
  nama_guru:     { type: DataTypes.STRING(150) },
  nama_dokumen:  { type: DataTypes.STRING(200), allowNull: false },
  jenis_dokumen: { type: DataTypes.STRING(50), allowNull: false },
  file_name:     { type: DataTypes.STRING(255) },
  file_data:     { type: DataTypes.BLOB },
  file_mime:     { type: DataTypes.STRING(100) },
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

module.exports = PerangkatPembelajaran;