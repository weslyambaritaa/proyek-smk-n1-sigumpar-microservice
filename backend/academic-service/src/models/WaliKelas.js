const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ParentingLog = sequelize.define('ParentingLog', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kelas_id:       { type: DataTypes.INTEGER },
  wali_id:        { type: DataTypes.UUID },
  tanggal:        { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  kehadiran_ortu: { type: DataTypes.INTEGER, defaultValue: 0 },
  agenda:         { type: DataTypes.STRING(255) },
  ringkasan:      { type: DataTypes.TEXT },
  foto_url:       { type: DataTypes.TEXT },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'parenting_log', timestamps: false });

module.exports = { ParentingLog };